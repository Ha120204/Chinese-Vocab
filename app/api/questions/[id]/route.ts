import { publicDb } from '@/lib/community/db';
import { dbFailure, fail, json } from '@/lib/community/api';
import { uuid } from '@/lib/community/schemas';

type Context = { params: Promise<{ id: string }> };
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!uuid.safeParse(id).success) return fail(404, 'Không tìm thấy câu hỏi.');
  try {
    const { data, error } = await publicDb().from('questions').select('id,display_name,title,body,category,created_at').eq('id', id).maybeSingle();
    if (error) return dbFailure(error);
    return data ? json({ question: data }) : fail(404, 'Không tìm thấy câu hỏi.');
  } catch (error) { return dbFailure(error); }
}
