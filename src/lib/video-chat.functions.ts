import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
const topic=z.enum(['overview','home','business']);
export const listVideoThreads=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({topic})).handler(async({data,context})=>{
 const result=await context.supabase.from('video_question_threads').select('id,title,topic').eq('user_id',context.userId).eq('topic',data.topic).order('updated_at',{ascending:false});
 if(result.error)throw new Error(result.error.message);return result.data;
});
export const createVideoThread=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({topic,title:z.string().min(1).max(120)})).handler(async({data,context})=>{
 const result=await context.supabase.from('video_question_threads').insert({user_id:context.userId,topic:data.topic,title:data.title}).select('id').single();
 if(result.error)throw new Error(result.error.message);return result.data;
});
export const getVideoThread=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid()})).handler(async({data,context})=>{
 const result=await context.supabase.from('video_question_threads').select('id,title,topic,messages').eq('id',data.id).eq('user_id',context.userId).single();
 if(result.error)throw new Error('This conversation is not available.');return result.data;
});