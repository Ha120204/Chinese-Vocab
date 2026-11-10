import { dbFailure, fail, json, preparePost, actorHashes } from '@/lib/community/api';
import { serviceDb } from '@/lib/community/db';
import { uuid } from '@/lib/community/schemas';
import { z } from 'zod';

type Context = { params: Promise<{ id: string }> };
export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: Context) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) return fail(404, 'Không tìm thấy mẹo nhớ.');
  try {
    const hashes = actorHashes(request);
    if (!hashes) return fail(400, 'Không thể xác định trình duyệt.');
    const { data, error } = await serviceDb().rpc('community_tip_like_state', { p_tip_id: id, p_browser_hash: hashes.browserHash });
    return error ? dbFailure(error) : json({ liked: Boolean(data) });
  } catch (error) { return dbFailure(error); }
}

export async function POST(request: Request, { params }: Context) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) return fail(404, 'Không tìm thấy mẹo nhớ.');
  try {
    const prepared = await preparePost(request, z.object({ website: z.string().max(0).default('') }), 'like');
    if (prepared instanceof Response) return prepared;
    const { data, error } = await serviceDb().rpc('community_toggle_tip_like', { p_tip_id: id, p_browser_hash: prepared.hashes.browserHash });
    if (error) return error.message.includes('tip_not_found') ? fail(404, 'Không tìm thấy mẹo nhớ.') : dbFailure(error);
    return json(data?.[0] ?? { liked: false, likes_count: 0 });
  } catch (error) { return dbFailure(error); }
}
