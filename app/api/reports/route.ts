import { serviceDb } from '@/lib/community/db';
import { dbFailure, fail, json, preparePost } from '@/lib/community/api';
import { reportSchema } from '@/lib/community/schemas';

export async function POST(request: Request) {
  try {
    const prepared = await preparePost(request, reportSchema, 'report');
    if (prepared instanceof Response) return prepared;
    const { contentType, contentId, reason, details } = prepared.data;
    const { data, error } = await serviceDb().rpc('community_create_report', {
      p_content_type: contentType, p_content_id: contentId, p_reason: reason,
      p_details: details, p_browser_hash: prepared.hashes.browserHash, p_ip_hash: prepared.hashes.ipHash,
    });
    if (error) return error.message.includes('content_not_found') ? fail(404, 'Nội dung không còn hiển thị.') : dbFailure(error);
    return json({ id: data, ok: true }, 201);
  } catch (error) { return dbFailure(error); }
}
