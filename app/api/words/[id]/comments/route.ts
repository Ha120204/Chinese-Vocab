import { getWord } from '@/lib/vocab';
import { publicDb, serviceDb } from '@/lib/community/db';
import { dbFailure, fail, json, preparePost, recordActor } from '@/lib/community/api';
import { commentSchema } from '@/lib/community/schemas';

type Context = { params: Promise<{ id: string }> };
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!getWord(id)) return fail(404, 'Không tìm thấy từ.');
  try {
    const { data, error } = await publicDb().from('word_comments').select('id,word_id,display_name,body,created_at').eq('word_id', id).order('created_at', { ascending: false }).limit(50);
    return error ? dbFailure(error) : json({ comments: data });
  } catch (error) { return dbFailure(error); }
}

export async function POST(request: Request, { params }: Context) {
  const { id } = await params;
  if (!getWord(id)) return fail(404, 'Không tìm thấy từ.');
  try {
    const prepared = await preparePost(request, commentSchema, 'comment');
    if (prepared instanceof Response) return prepared;
    const db = serviceDb();
    const { data, error } = await db.from('word_comments').insert({ word_id: id, display_name: prepared.data.displayName, body: prepared.data.body }).select('id,word_id,display_name,body,created_at').single();
    if (error || !data) return dbFailure(error);
    try { await recordActor('word_comment', data.id, prepared.hashes); }
    catch (actorError) { await db.from('word_comments').delete().eq('id', data.id); return dbFailure(actorError); }
    return json({ comment: data }, 201);
  } catch (error) { return dbFailure(error); }
}
