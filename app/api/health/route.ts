import { serviceDb } from '@/lib/community/db';
import { dbFailure, fail, json } from '@/lib/community/api';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return fail(401, 'Không có quyền truy cập.');
  try {
    const { data, error } = await serviceDb().rpc('community_health_and_prune');
    return error ? dbFailure(error) : json({ ok: true, removedBuckets: data });
  } catch (error) { return dbFailure(error); }
}
