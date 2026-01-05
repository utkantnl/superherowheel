import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/constants';
import { getMimeTypeExtension } from '@/lib/utils';
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
        const filename = `uploads/${uuidv4()}.${ext}`;

        // Read file buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Vercel Blob
        const blob = await put(filename, buffer, {
            access: 'public',
            contentType: file.type,
        });

        console.log('Uploaded to Vercel Blob:', blob.url);

        return NextResponse.json(
            {
                imageUrl: blob.url,
                filename: blob.pathname,
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
