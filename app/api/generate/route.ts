import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import { SUPERHEROES, GENERATION_PROMPT_TEMPLATE } from '@/lib/constants';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

// ============================================================================
// POLLINATIONS API CONFIGURATION
// ============================================================================
const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt';
const POLLINATIONS_MODEL = 'kontext';

interface GenerateRequest {
    imageUrl: string; // Public URL of uploaded image
    selectedHero: string;
    style?: 'realistic' | 'comic' | 'anime';
    seed?: number;
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
        const { imageUrl, selectedHero, style = 'realistic', seed } = body;

        // ====================================================================
        // VALIDATION
        // ====================================================================
        if (!imageUrl) {
            return NextResponse.json(
                { error: 'Image URL is required' },
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
        console.log('POLLINATIONS API REQUEST');
        console.log('='.repeat(60));
        console.log('Model:', POLLINATIONS_MODEL);
        console.log('Hero:', selectedHero);
        console.log('Style:', style);
        console.log('Prompt:', prompt.substring(0, 100) + '...');
        console.log('Image URL:', imageUrl);

        // ====================================================================
        // CALL POLLINATIONS API
        // ====================================================================
        const encodedPrompt = encodeURIComponent(prompt);
        const encodedImageUrl = encodeURIComponent(imageUrl);

        let pollinationsUrl = `${POLLINATIONS_BASE}/${encodedPrompt}?model=${POLLINATIONS_MODEL}&width=1024&height=1024&safe=true&image=${encodedImageUrl}`;

        if (seed) {
            pollinationsUrl += `&seed=${seed}`;
        }

        console.log('Pollinations URL:', pollinationsUrl.substring(0, 150) + '...');

        let response: Response;
        try {
            response = await fetch(pollinationsUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'image/*',
                },
            });

            console.log('Response status:', response.status);
            console.log('Response URL (final):', response.url);
            console.log('Content-Type:', response.headers.get('content-type'));

        } catch (fetchError) {
            console.error('Pollinations fetch error:', fetchError);
            return NextResponse.json(
                {
                    error: 'Failed to connect to image generation server.',
                    details: String(fetchError)
                },
                { status: 502 }
            );
        }

        // ====================================================================
        // VALIDATE RESPONSE
        // ====================================================================
        const contentType = response.headers.get('content-type') || '';

        if (!contentType.startsWith('image/')) {
            // Response is not an image - log and return error
            const textContent = await response.text();
            console.error('Invalid response content-type:', contentType);
            console.error('Response body (first 300 chars):', textContent.substring(0, 300));

            return NextResponse.json(
                {
                    error: 'Image generation failed. Server returned non-image response.',
                    details: textContent.substring(0, 300),
                    contentType,
                },
                { status: 502 }
            );
        }

        if (!response.ok) {
            return NextResponse.json(
                { error: `Pollinations API error: ${response.status} ${response.statusText}` },
                { status: 502 }
            );
        }

        // ====================================================================
        // GET IMAGE BYTES AND UPLOAD TO VERCEL BLOB
        // ====================================================================
        const imageBuffer = Buffer.from(await response.arrayBuffer());

        // Validate image size
        if (imageBuffer.length < 1000) {
            console.warn('Image too small:', imageBuffer.length, 'bytes');
            return NextResponse.json(
                { error: 'Generated image is too small. Please try again.' },
                { status: 502 }
            );
        }

        console.log('✓ Image received successfully');
        console.log('  Size:', imageBuffer.length, 'bytes');

        // Upload to Vercel Blob
        const filename = `generated/${uuidv4()}.png`;
        const blob = await put(filename, imageBuffer, {
            access: 'public',
            contentType: 'image/png',
        });

        console.log('  Uploaded to Vercel Blob:', blob.url);
        console.log('='.repeat(60));

        return NextResponse.json(
            {
                generatedUrl: blob.url,
                hero: selectedHero,
                style,
                seed: seed || null,
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
