import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { OPERATING_NOTICE, HOME_TRUST_AD_NOTICE } from '@/lib/operating-disclosure';
import type { UIMessage } from 'ai';
export const Route=createFileRoute('/api/public/video-questions')({server:{handlers:{POST:async({request})=>{
 const token=request.headers.get('Authorization')?.replace(/^Bearer /,'');
 if(!token)return Response.json({error:'Sign in to ask and save questions.'},{status:401});
 const {createClient}=await import('@supabase/supabase-js');
 const db=createClient(process.env['SUPABASE_URL']??'',process.env['SUPABASE_PUBLISHABLE_KEY']??'',{auth:{persistSession:false},global:{headers:{Authorization:`Bearer ${token}`}}});
 const {data:auth,error:authError}=await db.auth.getUser(token);
 if(authError||!auth.user)return Response.json({error:'Sign in to ask and save questions.'},{status:401});
 let input;try{input=z.object({conversationId:z.string().uuid(),language:z.enum(['en','es','ht']),messages:z.array(z.object({id:z.string().max(200),role:z.enum(['user','assistant','system']),parts:z.array(z.object({type:z.literal('text'),text:z.string().max(4000)})).max(10)})).min(1).max(50)}).parse(await request.json());}catch{return Response.json({error:'Please shorten your question.'},{status:400});}
 if(input.messages.at(-1)?.role!=='user'||JSON.stringify(input.messages).length>40000)return Response.json({error:'Start a new conversation.'},{status:400});
 const {data:thread}=await db.from('video_question_threads').select('*').eq('id',input.conversationId).eq('user_id',auth.user.id).single();
 if(!thread)return Response.json({error:'Conversation not found.'},{status:404});
 if(thread.blocked_reason)return Response.json({error:thread.blocked_reason},{status:403});
 const messages=input.messages as UIMessage[];
 const saved=await db.from('video_question_threads').update({messages,title:input.messages.find(m=>m.role==='user')?.parts[0]?.text.slice(0,100)??thread.title,updated_at:new Date().toISOString()}).eq('id',thread.id);
 if(saved.error)return Response.json({error:'Could not save your question.'},{status:500});
 const key=process.env['LOVABLE_API_KEY'];if(!key)return Response.json({error:'Claude help is not configured.'},{status:503});
 const [{createAnthropic},{streamText,convertToModelMessages},{createLovableAiGatewayRunIdFetch}]=await Promise.all([import('@ai-sdk/anthropic'),import('ai'),import('@/lib/ai-run-id.server')]);
 const run=createLovableAiGatewayRunIdFetch();
 const provider=createAnthropic({baseURL:'https://ai.gateway.lovable.dev/v1',apiKey:key,headers:{'Lovable-API-Key':key,'X-Lovable-AIG-SDK':'vercel-ai-sdk'},fetch:async(url,init)=>{
  const response=await run.fetch(url,init);
  if(!response.ok){const text=await response.text();let safe='Claude is unavailable.';try{const body=JSON.parse(text);safe=body.message??body.error?.message??safe;}catch{/* no unsafe raw output */}
   if(response.status===403){await db.from('video_question_threads').update({blocked_reason:safe}).eq('id',thread.id);}
   throw Object.assign(new Error(safe),{status:response.status});
  }return response;
 }});
 const result=streamText({model:provider('anthropic/claude-sonnet-5'),system:`You are the DetencionDefensa video information helper. Answer in ${input.language==='es'?'Spanish':input.language==='ht'?'Haitian Kreyòl':'English'} at a fifth-grade reading level. Topic: ${thread.topic}. Use short sentences and bullets. Explain the website and document gathering only. Never give individualized legal, immigration, tax, lending, business-sale or investment advice, prequalify loans, guarantee outcomes, or invent account actions. Do not ask for immigration identifiers, passwords or bank information. Staff and paralegals gather documents and schedule; legal advice comes only from the Firm after engagement. Suggest call/text 305-773-7737 for personal help. ${OPERATING_NOTICE[input.language]} ${HOME_TRUST_AD_NOTICE[input.language]}`,messages:await convertToModelMessages(messages),maxOutputTokens:2000,maxRetries:0,abortSignal:request.signal});
 return result.toUIMessageStreamResponse({originalMessages:messages,onError:error=>error instanceof Error?error.message:'Claude could not answer.',onFinish:async({messages:complete})=>{const saved=await db.from('video_question_threads').update({messages:JSON.parse(JSON.stringify(complete)),updated_at:new Date().toISOString()}).eq('id',thread.id);if(saved.error)throw new Error('Could not save the answer.');}});
}}}});