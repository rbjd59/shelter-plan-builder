import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { CHECKLISTS } from './service-file';
const reference = z.object({id:z.string().uuid(),source:z.enum(['assessment','app'])});
async function staff(context: {supabase: {rpc: Function}; userId: string}) {
 const {data,error}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
 if(error||!data) throw new Error('Sign in with an approved staff account to manage this file.');
}
export const getServiceFile=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(reference).handler(async({data,context})=>{
 await staff(context); const {loadServiceClient}=await import('./service-client.server'); const client=await loadServiceClient(data.id,data.source);
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {data:callbacks,error}=await supabaseAdmin.from('service_callbacks').select('*').eq(data.source==='assessment'?'assessment_id':'app_client_id',data.id).order('starts_at');
 if(error) throw new Error(error.message); return {client,callbacks:callbacks??[]};
});
const fileSchema=z.object({ notes:z.string().max(12000).default(''), trustName:z.string().max(200).default(''), trustee:z.string().max(200).default(''), backupTrustee:z.string().max(200).default(''), beneficiaries:z.string().max(3000).default(''), legalDescription:z.string().max(4000).default(''), authorizedPerson:z.string().max(200).default(''), providerOrder:z.string().max(500).default(''), titleOrder:z.string().max(500).default(''), checklist:z.record(z.enum(['missing','requested','received','reviewed'])).default({}) });
export const saveServiceFile=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(reference.extend({file:fileSchema})).handler(async({data,context})=>{
 await staff(context); const {supabaseAdmin}=await import('@/integrations/supabase/client.server'); const {error}=await supabaseAdmin.from(data.source==='assessment'?'assessments':'app_clients').update({service_file:data.file}).eq('id',data.id); if(error) throw new Error(error.message); return {ok:true};
});
export const addServiceCallback=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(reference.extend({title:z.string().min(2).max(200),startsAt:z.string().datetime(),timezone:z.string().max(60).default('America/New_York'),paralegalEmail:z.string().email().max(254),notes:z.string().max(3000).default('')})).handler(async({data,context})=>{
 await staff(context); if(Date.parse(data.startsAt)<=Date.now()) throw new Error('Choose a future date and time.');
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server'); const {error}=await supabaseAdmin.from('service_callbacks').insert({assessment_id:data.source==='assessment'?data.id:null,app_client_id:data.source==='app'?data.id:null,title:data.title,starts_at:data.startsAt,timezone:data.timezone,paralegal_email:data.paralegalEmail,notes:data.notes}); if(error) throw new Error(error.message); return {ok:true};
});
export const updateServiceCallback=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(z.object({id:z.string().uuid(),status:z.enum(['completed','cancelled'])})).handler(async({data,context})=>{
 await staff(context); const {supabaseAdmin}=await import('@/integrations/supabase/client.server'); const {error}=await supabaseAdmin.from('service_callbacks').update({status:data.status}).eq('id',data.id); if(error) throw new Error(error.message); return {ok:true};
});
export const generateServicePacket=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(reference.extend({kind:z.enum(['heloc','sale','rental','trust','business','family'])})).handler(async({data,context})=>{
 await staff(context); const {loadServiceClient}=await import('./service-client.server'); const client=await loadServiceClient(data.id,data.source); const file=(client.service_file??{}) as Record<string,unknown>;
 const {servicePacket,familyPacket}=await import('./service-packet.server');
 const answers=(client.answers??{}) as Record<string,unknown>;
 const bytes=data.kind==='family'?await familyPacket({...answers,authorizedPerson:file.authorizedPerson},client.full_name??'Client'):await servicePacket(data.kind,client,file);
 const b64=Buffer.from(bytes).toString('base64');
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 if(data.source==='assessment') {const {error}=await supabaseAdmin.from('assessment_documents').insert({assessment_id:data.id,title:`${data.kind} preparation draft`,document_type:`service_${data.kind}`,content:b64,review_status:'draft_pending_review'}); if(error) throw new Error(error.message);}
 else {const {error}=await supabaseAdmin.from('client_documents').insert({client_id:data.id,title:`${data.kind} preparation draft`,document_type:`service_${data.kind}`,content:b64,review_status:'draft_pending_review',send_on_alert:false}); if(error) throw new Error(error.message);}
 return {pdfB64:b64,filename:`${data.kind}-preparation-draft.pdf`};
});
export const emailClientChecklist=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(reference.extend({kind:z.enum(['heloc','sale','rental','trust','business']),eventId:z.string().uuid()})).handler(async({data,context})=>{
 await staff(context); const {loadServiceClient}=await import('./service-client.server'); const client=await loadServiceClient(data.id,data.source); if(!client.email) throw new Error('Add the client email first.');
 const {sendTemplateEmail}=await import('./email-templates/send-email');
 const language=client.language==='es'?'es':client.language==='ht'?'ht':'en';
 const localized = await import('./service-notice-content');
 return sendTemplateEmail('service-notice',client.email,{templateData:{title:localized.noticeTitle(language),name:client.full_name,language,lines:localized.checklistNotice(language,data.kind)},idempotencyKey:`client-checklist-${data.id}-${data.eventId}`});
});