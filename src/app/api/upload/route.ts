import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';

/**
 * Lưu ảnh (đã nén ở trình duyệt) vào thư mục `uploads/` của project và trả về URL đọc lại.
 * Dùng cho môi trường local. Khi lên mạng thật, thay bằng upload IPFS (Pinata…).
 */
export const runtime = 'nodejs';

export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { dataUrl?: unknown } | null;
  const match = typeof body?.dataUrl === 'string' ? body.dataUrl.match(/^data:image\/(jpeg|png|webp);base64,(.+)$/) : null;
  if (!match) return NextResponse.json({ error: 'Ảnh không hợp lệ.' }, { status: 400 });

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length > MAX_BYTES) return NextResponse.json({ error: 'Ảnh quá lớn (tối đa 5MB sau khi nén).' }, { status: 413 });

  const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
  const name = `${createHash('sha256').update(buffer).digest('hex').slice(0, 32)}.${ext}`;
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), buffer);

  return NextResponse.json({ url: `/api/files/${name}` });
}
