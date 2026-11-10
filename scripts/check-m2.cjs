const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { createClient } = require('@supabase/supabase-js');
const { loadEnvFile } = require('node:process');

try { loadEnvFile('.env.local'); } catch {}
const base = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
const marker = `M2 QA ${Date.now()}`;
const browserId = randomUUID();
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {auth:{persistSession:false,autoRefreshToken:false}});
const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {auth:{persistSession:false,autoRefreshToken:false}});
const created = [];

async function request(path, method='GET', body){
  const response=await fetch(`${base}${path}`,{method,headers:{'X-Community-Browser-ID':browserId,'Content-Type':'application/json','X-Forwarded-For':'203.0.113.123',Origin:base},body:body?JSON.stringify({website:'',...body}):undefined});
  return {status:response.status,data:await response.json(),headers:response.headers};
}

(async()=>{
  const health=await fetch(`${base}/api/health`);assert.equal(health.status,401);
  assert.equal((await request('/api/words/no-such-word/tips')).status,404);
  assert.equal((await request('/api/questions/no-such-question')).status,404);
  const forbidden=await anon.rpc('community_health_and_prune');assert.ok(['42501','PGRST202'].includes(forbidden.error?.code),'anon RPC must be denied by database permissions');

  const tip=await request('/api/words/hsk1-147/tips','POST',{displayName:'M2 test',body:`${marker}: liên tưởng nét chữ.`});assert.equal(tip.status,201,JSON.stringify(tip.data));created.push(['tips',tip.data.tip.id]);
  const tips=await request('/api/words/hsk1-147/tips');assert.equal(tips.headers.get('cache-control')?.includes('no-store'),true);assert.ok(tips.data.tips.some(item=>item.id===tip.data.tip.id));
  const like1=await request(`/api/tips/${tip.data.tip.id}/like`,'POST',{});assert.equal(like1.status,200);assert.equal(like1.data.liked,true);
  const like2=await request(`/api/tips/${tip.data.tip.id}/like`,'POST',{});assert.equal(like2.status,200);assert.equal(like2.data.liked,false);
  const comment=await request('/api/words/hsk1-147/comments','POST',{displayName:'M2 test',body:`${marker}: ví dụ dễ nhớ.`});assert.equal(comment.status,201,JSON.stringify(comment.data));created.push(['word_comments',comment.data.comment.id]);
  const question=await request('/api/questions','POST',{displayName:'M2 test',title:`${marker}: cách đọc thanh điệu?`,body:'Mình muốn hỏi cách đọc thanh điệu trong câu đơn giản.',category:'pronunciation'});assert.equal(question.status,201,JSON.stringify(question.data));created.push(['questions',question.data.question.id]);
  const answer=await request(`/api/questions/${question.data.question.id}/answers`,'POST',{displayName:'M2 test',body:'Hãy nghe mẫu rồi đọc chậm từng âm tiết.'});assert.equal(answer.status,201,JSON.stringify(answer.data));created.push(['answers',answer.data.answer.id]);
  assert.equal((await request(`/api/questions/${question.data.question.id}`)).status,200);
  const report=await request('/api/reports','POST',{contentType:'tip',contentId:tip.data.tip.id,reason:'other',details:`${marker}: kiểm tra báo cáo`});assert.equal(report.status,201,JSON.stringify(report.data));
  const fake=await request('/api/questions','POST',{displayName:'Bot',title:'Câu hỏi kiểm tra bot',body:'Nội dung kiểm tra bot hợp lệ',category:'other',website:'filled'});assert.equal(fake.status,202);
  console.log('PASS M2: RLS RPC, health auth, tips, likes, comments, questions, answers, reports, honeypot, no-store');
})().catch(error=>{console.error(error);process.exitCode=1}).finally(async()=>{
  for(const [table,id] of created.reverse()){
    const {error}=await db.from(table).update({status:'hidden'}).eq('id',id);
    if(error)console.error(`Could not hide QA row in ${table}: ${error.message}`);
  }
  if(created.length)console.log('QA posts hidden; one test report remains in private.reports for review.');
});
