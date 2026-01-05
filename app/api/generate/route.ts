import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { SUPERHEROES, GENERATION_PROMPT_TEMPLATE } from '@/lib/constants';
import { getBaseUrl } from '@/lib/utils';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

// ============================================================================
// LOCAL INFERENCE SERVER CONFIGURATION
// ============================================================================
const INFERENCE_BASE_URL = 'http://127.0.0.1:8045/v1';
const INFERENCE_MODEL = 'gemini-3-pro-image';

// Initialize OpenAI client pointing to local server
const openai = new OpenAI({
    baseURL: INFERENCE_BASE_URL,
    apiKey: process.env.OPENAI_API_KEY || 'not-needed', // May not be required for local
});

interface GenerateRequest {
    imageBase64: string; // Base64 encoded image data
    selectedHero: string;
    style?: 'realistic' | 'comic' | 'anime';
}

const STYLE_MODIFIERS: Record<string, string> = {
    realistic: 'photorealistic, cinematic lighting, detailed',
    comic: 'comic book style, bold colors, dynamic pose, Marvel Comics art',
    anime: 'anime style, vibrant colors, Japanese animation aesthetic',
};

// ============================================================================
// PROMPT BUILDER (FIXED TEMPLATE - NO USER INPUT)
// ============================================================================
function buildPrompt(hero: string, style: string): string {
    const basePrompt = GENERATION_PROMPT_TEMPLATE(hero);
    const styleModifier = STYLE_MODIFIERS[style] || STYLE_MODIFIERS.realistic;
    return `${basePrompt} ${styleModifier}`;
}

// ============================================================================
// IMAGE EXTRACTION HELPERS
// ============================================================================

// Extract base64 image from response content
function extractImageFromContent(content: string): Buffer | null {
    // Case 1: Markdown image format: ![...](data:image/...;base64,...)
    // This is what gemini-3-pro-image returns
    const markdownMatch = content.match(/!\[.*?\]\((data:image\/[^;]+;base64,([A-Za-z0-9+/=]+))\)/);
    if (markdownMatch) {
        console.log('Matched Markdown image format');
        return Buffer.from(markdownMatch[2], 'base64');
    }

    // Case 2: Content is already base64 data URL
    if (content.startsWith('data:image')) {
        const base64Match = content.match(/base64,(.+)/);
        if (base64Match) {
            console.log('Matched data URL format');
            return Buffer.from(base64Match[1], 'base64');
        }
    }

    // Case 3: Content is raw base64 (no data: prefix)
    if (/^[A-Za-z0-9+/=]+$/.test(content.replace(/\s/g, ''))) {
        try {
            const buffer = Buffer.from(content.replace(/\s/g, ''), 'base64');
            if (buffer[0] === 0x89 && buffer[1] === 0x50) return buffer; // PNG
            if (buffer[0] === 0xFF && buffer[1] === 0xD8) return buffer; // JPEG
        } catch {
            // Not valid base64
        }
    }

    // Case 4: Just extract any data URL from content
    const anyDataUrlMatch = content.match(/data:image\/[^;]+;base64,([A-Za-z0-9+/=]+)/);
    if (anyDataUrlMatch) {
        console.log('Matched embedded data URL');
        return Buffer.from(anyDataUrlMatch[1], 'base64');
    }

    return null;
}


// ============================================================================
// MAIN API HANDLER
// ============================================================================

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIP(request);
        const { allowed, remaining } = checkRateLimit(ip);

        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: { 'X-RateLimit-Remaining': remaining.toString() } }
            );
        }

        // Parse request body
        const body: GenerateRequest = await request.json();
        const { imageBase64, selectedHero, style = 'realistic' } = body;

        // ====================================================================
        // VALIDATION
        // ====================================================================
        if (!imageBase64) {
            return NextResponse.json(
                { error: 'Image data is required (imageBase64)' },
                { status: 400 }
            );
        }

        if (!selectedHero) {
            return NextResponse.json(
                { error: 'Selected hero is required' },
                { status: 400 }
            );
        }

        // Validate hero against allowlist
        if (!SUPERHEROES.includes(selectedHero as typeof SUPERHEROES[number])) {
            return NextResponse.json(
                { error: `Invalid hero. Must be one of: ${SUPERHEROES.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate style
        if (!['realistic', 'comic', 'anime'].includes(style)) {
            return NextResponse.json(
                { error: 'Invalid style. Must be: realistic, comic, or anime' },
                { status: 400 }
            );
        }

        // ====================================================================
        // BUILD PROMPT
        // ====================================================================
        const prompt = buildPrompt(selectedHero, style);

        console.log('='.repeat(60));
        console.log('LOCAL INFERENCE REQUEST');
        console.log('='.repeat(60));
        console.log('Server:', INFERENCE_BASE_URL);
        console.log('Model:', INFERENCE_MODEL);
        console.log('Hero:', selectedHero);
        console.log('Style:', style);
        console.log('Prompt:', prompt.substring(0, 100) + '...');
        console.log('Image data length:', imageBase64.length);

        // ====================================================================
        // CALL LOCAL INFERENCE SERVER
        // ====================================================================
        let response;
        try {
            // Prepare the message content with image
            const messageContent = [
                {
                    type: 'text' as const,
                    text: prompt,
                },
                {
                    type: 'image_url' as const,
                    image_url: {
                        url: imageBase64.startsWith('data:')
                            ? imageBase64
                            : `data:image/png;base64,${imageBase64}`,
                    },
                },
            ];

            response = await openai.chat.completions.create({
                model: INFERENCE_MODEL,
                messages: [
                    {
                        role: 'user',
                        content: messageContent,
                    },
                ],
                // @ts-expect-error - extra_body for custom params
                extra_body: {
                    size: '1024x1024',
                },
            });

            console.log('Response received');
            console.log('Choices:', response.choices?.length || 0);

        } catch (apiError) {
            console.error('Inference API error:', apiError);
            return NextResponse.json(
                {
                    error: 'Failed to connect to image generation server.',
                    details: String(apiError)
                },
                { status: 502 }
            );
        }

        // ====================================================================
        // EXTRACT IMAGE FROM RESPONSE
        // ====================================================================
        const choice = response.choices?.[0];
        if (!choice || !choice.message?.content) {
            console.error('No content in response');
            console.error('Full response:', JSON.stringify(response, null, 2));
            return NextResponse.json(
                { error: 'No image generated. Empty response from server.' },
                { status: 502 }
            );
        }

        const content = choice.message.content;
        console.log('Content type:', typeof content);
        console.log('Content length:', content.length);
        console.log('Content preview:',
            typeof content === 'string' ? content.substring(0, 100) + '...' : 'non-string'
        );

        // Extract image buffer from content
        const imageBuffer = extractImageFromContent(content);

        if (!imageBuffer) {
            console.error('Could not extract image from content');
            console.error('Content:', content.substring(0, 500));
            return NextResponse.json(
                {
                    error: 'Invalid response format. Could not extract image.',
                    details: content.substring(0, 200)
                },
                { status: 502 }
            );
        }

        // Validate image size
        if (imageBuffer.length < 1000) {
            console.warn('Image too small:', imageBuffer.length, 'bytes');
            return NextResponse.json(
                { error: 'Generated image is too small. Please try again.' },
                { status: 502 }
            );
        }

        console.log('✓ Image extracted successfully');
        console.log('  Size:', imageBuffer.length, 'bytes');

        // ====================================================================
        // SAVE IMAGE
        // ====================================================================
        const filename = `${uuidv4()}.png`;
        const generatedDir = path.join(process.cwd(), 'public', 'generated');
        await mkdir(generatedDir, { recursive: true });

        const filepath = path.join(generatedDir, filename);
        await writeFile(filepath, imageBuffer);

        const baseUrl = getBaseUrl();
        const generatedUrl = `${baseUrl}/generated/${filename}`;

        console.log('  Saved to:', filepath);
        console.log('  Public URL:', generatedUrl);
        console.log('='.repeat(60));

        return NextResponse.json(
            {
                generatedUrl,
                hero: selectedHero,
                style,
            },
            {
                status: 200,
                headers: { 'X-RateLimit-Remaining': remaining.toString() }
            }
        );

    } catch (error) {
        console.error('Generate error:', error);
        return NextResponse.json(
            { error: 'Failed to generate image. Please try again.' },
            { status: 500 }
        );
    }
}
