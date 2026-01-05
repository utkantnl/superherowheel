import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/constants';
import { getMimeTypeExtension, getBaseUrl } from '@/lib/utils';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIP(request);
        const { allowed, remaining } = checkRateLimit(ip);

        if (!allowed) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                {
                    status: 429,
                    headers: { 'X-RateLimit-Remaining': remaining.toString() }
                }
            );
        }

        // Parse form data
        const formData = await request.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_IMAGE_SIZE) {
            return NextResponse.json(
                { error: `File too large. Maximum size is ${MAX_IMAGE_SIZE / 1024 / 1024}MB` },
                { status: 400 }
            );
        }

        // Generate unique filename
        const ext = getMimeTypeExtension(file.type);
        const filename = `${uuidv4()}.${ext}`;

        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadsDir, { recursive: true });

        // Read file buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filepath = path.join(uploadsDir, filename);
        await writeFile(filepath, buffer);

        // Build public URL
        const baseUrl = getBaseUrl();
        const imageUrl = `${baseUrl}/uploads/${filename}`;

        return NextResponse.json(
            {
                imageUrl,
                filename,
                size: file.size,
                type: file.type
            },
            {
                status: 200,
                headers: { 'X-RateLimit-Remaining': remaining.toString() }
            }
        );

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload image. Please try again.' },
            { status: 500 }
        );
    }
}
