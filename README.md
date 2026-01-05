# 🦸 Superhero Wheel

Transform yourself into your favorite superhero with AI! Upload your photo, spin the wheel, and watch the magic happen.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

## ✨ Features

- 📸 **Drag & Drop Upload** - Easy photo upload with validation
- 🎰 **Animated Spin Wheel** - Canvas-based wheel with 16 superheroes
- 🎨 **Style Presets** - Choose between Realistic, Comic, or Anime styles
- 🤖 **AI Transformation** - Powered by Pollinations NanoBanana model
- 📥 **Download Results** - Save your superhero transformations
- 🕐 **History** - View your last 5 transformations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone or navigate to the project
cd superhero-wheel

# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

## 🏗️ Architecture

```
superhero-wheel/
├── app/
│   ├── api/
│   │   ├── health/route.ts     # Health check endpoint
│   │   ├── upload/route.ts     # Image upload (5MB max, jpg/png/webp)
│   │   └── generate/route.ts   # AI generation via Pollinations
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Main application page
│   └── globals.css             # Global styles & animations
├── components/
│   ├── SpinWheel.tsx           # Canvas-based animated wheel
│   ├── ImageUpload.tsx         # Drag & drop upload
│   ├── ResultPanel.tsx         # Before/after comparison
│   ├── GenerationHistory.tsx   # LocalStorage history
│   ├── StyleSelector.tsx       # Art style picker
│   └── LoadingSpinner.tsx      # Loading indicator
├── lib/
│   ├── constants.ts            # Superhero list & config
│   ├── utils.ts                # Helper functions
│   └── rate-limit.ts           # IP-based rate limiting
└── public/
    ├── uploads/                # User uploaded images
    └── generated/              # AI generated images
```

## 🔌 API Endpoints

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{ "status": "ok", "timestamp": "...", "version": "1.0.0" }
```

### `POST /api/upload`
Upload an image for transformation.

**Request:** `multipart/form-data` with `image` field

**Response:**
```json
{ "imageUrl": "http://localhost:3000/uploads/uuid.png" }
```

### `POST /api/generate`
Generate superhero transformation.

**Request:**
```json
{
  "imageUrl": "http://localhost:3000/uploads/uuid.png",
  "selectedHero": "Spider-Man",
  "style": "realistic",
  "seed": 12345
}
```

**Response:**
```json
{ "generatedUrl": "http://localhost:3000/generated/uuid.png" }
```

## 🦸 Available Superheroes

Spider-Man, Iron Man, Captain America, Thor, Hulk, Black Panther, Doctor Strange, Wolverine, Deadpool, Black Widow, Scarlet Witch, Captain Marvel, Ant-Man, Vision, Hawkeye, Star-Lord

## 🎨 Art Styles

| Style | Description |
|-------|-------------|
| **Realistic** | Photorealistic, cinematic lighting |
| **Comic** | Marvel Comics style, bold colors |
| **Anime** | Japanese animation aesthetic |

## ☁️ Switching to Cloud Storage (S3/R2)

For production deployments, replace local disk storage with cloud storage:

### AWS S3

1. Install AWS SDK:
   ```bash
   npm install @aws-sdk/client-s3
   ```

2. Update upload/generate routes:
   ```typescript
   import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

   const s3 = new S3Client({
     region: process.env.AWS_REGION,
     credentials: {
       accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
       secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
     },
   });

   // Replace writeFile with:
   await s3.send(new PutObjectCommand({
     Bucket: process.env.S3_BUCKET,
     Key: `uploads/${filename}`,
     Body: buffer,
     ContentType: 'image/png',
   }));

   // Return URL:
   const imageUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/uploads/${filename}`;
   ```

### Cloudflare R2

1. Install S3-compatible client:
   ```bash
   npm install @aws-sdk/client-s3
   ```

2. Configure for R2:
   ```typescript
   const s3 = new S3Client({
     region: 'auto',
     endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
     credentials: {
       accessKeyId: process.env.R2_ACCESS_KEY_ID!,
       secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
     },
   });
   ```

## 🔒 Security Features

- ✅ File type validation (JPEG, PNG, WebP only)
- ✅ File size limit (5MB max)
- ✅ IP-based rate limiting (20 requests/minute)
- ✅ Superhero allowlist (no arbitrary prompts)
- ✅ Safe content generation (no NSFW)

## 📦 Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🛠️ Development

```bash
# Run development server with Turbopack
npm run dev

# Lint code
npm run lint
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_BASE_URL` | Public base URL | `http://localhost:3000` |

## 🙏 Credits

- **AI Generation**: [Pollinations AI](https://pollinations.ai) - NanoBanana model
- **Framework**: [Next.js](https://nextjs.org) 14 with App Router
- **Styling**: [Tailwind CSS](https://tailwindcss.com) 4

## 📄 License

MIT License - feel free to use this project for any purpose!

---

Made with ❤️ and AI magic ✨
