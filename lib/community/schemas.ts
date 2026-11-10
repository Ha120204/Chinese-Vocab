import { z } from 'zod';

const cleanText = (max: number, min = 1) => z.string().trim().min(min, `Cần ít nhất ${min} ký tự.`).max(max, `Tối đa ${max} ký tự.`);
export const uuid = z.uuid();
export const name = cleanText(40);
export const honeypot = z.string().max(0).default('');
export const tipSchema = z.object({ displayName: name, body: cleanText(1000, 5), website: honeypot });
export const commentSchema = z.object({ displayName: name, body: cleanText(1000, 2), website: honeypot });
export const questionSchema = z.object({ displayName: name, title: cleanText(160, 10), body: cleanText(3000, 10), category: z.enum(['hsk1','hanzi','pronunciation','grammar','other']), website: honeypot });
export const answerSchema = z.object({ displayName: name, body: cleanText(3000, 2), website: honeypot });
export const reportSchema = z.object({ contentType: z.enum(['tip','word_comment','question','answer']), contentId: uuid, reason: z.enum(['spam','abuse','copyright','other']), details: cleanText(1000, 0), website: honeypot });
