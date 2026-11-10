import 'server-only';
import { createHmac } from 'node:crypto';
import type { z } from 'zod';
import { serviceDb } from '@/lib/community/db';

export const noStore = { 'Cache-Control': 'no-store, max-age=0' };
export function json(data: unknown, status = 200) { return Response.json(data, { status, headers: noStore }); }
export function fail(status: number, message: string) { return json({ error: message }, status); }
export function dbFailure(error: unknown) { console.error('Community database operation failed', error); return fail(503, 'Tạm thời không thể kết nối cộng đồng. Vui lòng thử lại.'); }

function digest(value: string, secret: string | undefined) {
  if (!secret || secret.length < 32) throw new Error('Community HMAC secret is missing or too short');
  return createHmac('sha256', secret).update(value).digest('hex');
}

export function actorHashes(request: Request) {
  const id = request.headers.get('x-community-browser-id');
  if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return null;
  const ip = (request.headers.get('x-vercel-forwarded-for') ?? request.headers.get('x-forwarded-for') ?? 'unknown').split(',')[0].trim();
  return {
    browserHash: digest(id.toLowerCase(), process.env.BROWSER_HMAC_SECRET),
    ipHash: digest(ip, process.env.IP_HMAC_SECRET),
  };
}

const limits = {
  tip: [3, 12, 3600], comment: [10, 40, 3600],
  question: [3, 12, 86400], answer: [10, 40, 86400],
  like: [60, 200, 3600], report: [5, 20, 86400],
} as const;
type Action = keyof typeof limits;

export async function preparePost<T extends z.ZodType>(request: Request, schema: T, action: Action): Promise<{ data: z.infer<T>; hashes: NonNullable<ReturnType<typeof actorHashes>> } | Response> {
  const origin = request.headers.get('origin');
  if (origin) {
    try { if (new URL(origin).host !== new URL(request.url).host) return fail(403, 'Nguồn yêu cầu không hợp lệ.'); }
    catch { return fail(403, 'Nguồn yêu cầu không hợp lệ.'); }
  }
  if (!request.headers.get('content-type')?.includes('application/json')) return fail(415, 'Cần gửi dữ liệu JSON.');
  const raw = await request.text();
  if (raw.length > 8192) return fail(413, 'Nội dung quá dài.');
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return fail(400, 'JSON không hợp lệ.'); }
  if (value && typeof value === 'object' && 'website' in value && Boolean((value as {website?:unknown}).website)) return json({ ok: true }, 202);
  const parsed = schema.safeParse(value);
  if (!parsed.success) return json({ error: 'Vui lòng kiểm tra lại biểu mẫu.', fields: parsed.error.flatten().fieldErrors }, 400);
  const hashes = actorHashes(request);
  if (!hashes) return fail(400, 'Không thể xác định trình duyệt. Vui lòng tải lại trang.');
  const [browserLimit, ipLimit, windowSeconds] = limits[action];
  const { data, error } = await serviceDb().rpc('community_rate_limit', {
    p_action: action, p_browser_hash: hashes.browserHash, p_ip_hash: hashes.ipHash,
    p_browser_limit: browserLimit, p_ip_limit: ipLimit, p_window_seconds: windowSeconds,
  });
  if (error) return dbFailure(error);
  if (!data) return fail(429, 'Bạn đã gửi quá nhiều lần. Vui lòng thử lại sau.');
  return { data: parsed.data, hashes };
}

export async function recordActor(type: 'tip'|'word_comment'|'question'|'answer', id: string, hashes: NonNullable<ReturnType<typeof actorHashes>>) {
  const { error } = await serviceDb().rpc('community_record_actor', {
    p_content_type: type, p_content_id: id, p_browser_hash: hashes.browserHash, p_ip_hash: hashes.ipHash,
  });
  if (error) throw error;
}
