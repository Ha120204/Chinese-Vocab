import { publicDb, serviceDb } from '@/lib/community/db';
import { dbFailure, fail, json, preparePost, recordActor } from '@/lib/community/api';
import { answerSchema, uuid } from '@/lib/community/schemas';

type Context = { params: Promise<{ id: string }> };
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) return fail(404, 'Không tìm thấy câu hỏi.');
  try {
    const { data, error } = await publicDb().from('answers').select('id,question_id,display_name,body,created_at').eq('question_id', id).order('created_at', { ascending: true }).limit(100);
    return error ? dbFailure(error) : json({ answers: data });
  } catch (error) { return dbFailure(error); }
}

export async function POST(request: Request, { params }: Context) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) return fail(404, 'Không tìm thấy câu hỏi.');
  try {
    const { data: question, error: lookupError } = await publicDb().from('questions').select('id').eq('id', id).maybeSingle();
    if (lookupError) return dbFailure(lookupError);
    if (!question) return fail(404, 'Không tìm thấy câu hỏi.');
    const prepared = await preparePost(request, answerSchema, 'answer');
    if (prepared instanceof Response) return prepared;
    const db = serviceDb();
    const { data, error } = await db.from('answers').insert({ question_id: id, display_name: prepared.data.displayName, body: prepared.data.body }).select('id,question_id,display_name,body,created_at').single();
    if (error || !data) return dbFailure(error);
    try { await recordActor('answer', data.id, prepared.hashes); }
    catch (actorError) { await db.from('answers').delete().eq('id', data.id); return dbFailure(actorError); }
    return json({ answer: data }, 201);
  } catch (error) { return dbFailure(error); }
}
