import { publicDb, serviceDb } from '@/lib/community/db';
import { dbFailure, json, preparePost, recordActor } from '@/lib/community/api';
import { questionSchema } from '@/lib/community/schemas';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const category = params.get('category');
    const search = (params.get('search') ?? '').trim().replace(/[%_]/g, '').slice(0, 80);
    const page = Math.min(20, Math.max(0, Number.parseInt(params.get('page') ?? '0', 10) || 0));
    let query = publicDb().from('questions').select('id,display_name,title,body,category,created_at').order('created_at', { ascending: false }).range(page * 20, page * 20 + 19);
    if (category && ['hsk1','hanzi','pronunciation','grammar','other'].includes(category)) query = query.eq('category', category);
    if (search) query = query.ilike('title', `%${search}%`);
    const { data, error } = await query;
    return error ? dbFailure(error) : json({ questions: data, page });
  } catch (error) { return dbFailure(error); }
}

export async function POST(request: Request) {
  try {
    const prepared = await preparePost(request, questionSchema, 'question');
    if (prepared instanceof Response) return prepared;
    const db = serviceDb();
    const { data, error } = await db.from('questions').insert({ display_name: prepared.data.displayName, title: prepared.data.title, body: prepared.data.body, category: prepared.data.category }).select('id,display_name,title,body,category,created_at').single();
    if (error || !data) return dbFailure(error);
    try { await recordActor('question', data.id, prepared.hashes); }
    catch (actorError) { await db.from('questions').delete().eq('id', data.id); return dbFailure(actorError); }
    return json({ question: data }, 201);
  } catch (error) { return dbFailure(error); }
}
