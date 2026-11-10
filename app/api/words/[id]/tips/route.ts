import { getWord } from '@/lib/vocab';
import { publicDb, serviceDb } from '@/lib/community/db';
import { dbFailure, fail, json, preparePost, recordActor } from '@/lib/community/api';
import { tipSchema } from '@/lib/community/schemas';

type Context = { params: Promise<{ id: string }> };
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!getWord(id)) return fail(404, 'Không tìm thấy từ.');
  try {
    const { data, error } = await publicDb().from('tips').select('id,word_id,display_name,body,likes_count,created_at').eq('word_id', id).order('likes_count', { ascending: false }).order('created_at', { ascending: false }).limit(50);
    return error ? dbFailure(error) : json({ tips: data });
  } catch (error) { return dbFailure(error); }
}

export async function POST(request: Request, { params }: Context) {
  const { id } = await params;
  if (!getWord(id)) return fail(404, 'Không tìm thấy từ.');
  try {
    const prepared = await preparePost(request, tipSchema, 'tip');
    if (prepared instanceof Response) return prepared;
    const db = serviceDb();
    const { data, error } = await db.from('tips').insert({ word_id: id, display_name: prepared.data.displayName, body: prepared.data.body }).select('id,word_id,display_name,body,likes_count,created_at').single();
    if (error || !data) return dbFailure(error);
    try { await recordActor('tip', data.id, prepared.hashes); }
    catch (actorError) { await db.from('tips').delete().eq('id', data.id); return dbFailure(actorError); }
    return json({ tip: data }, 201);
  } catch (error) { return dbFailure(error); }
}
