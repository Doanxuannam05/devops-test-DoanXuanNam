import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const TYPES: Record<string, string> = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const match = name.match(/^[a-f0-9]{32}\.(jpg|png|webp)$/);
  if (!match) return new Response('Not found', { status: 404 });
  try {
    const data = await readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(data), {
      headers: { 'Content-Type': TYPES[match[1]], 'Cache-Control': 'public, max-age=31536000, immutable' },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
