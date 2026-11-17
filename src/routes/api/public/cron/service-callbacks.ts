import { createFileRoute } from '@tanstack/react-router';
import { authenticateCronRequest } from '@/integrations/supabase/cron-auth';
import { dueReminders } from '@/lib/service-file';
export const Route=createFileRoute('/api/public/cron/service-callbacks')({server:{handlers:{POST:async({request})=>{
 const authFailure=await authenticateCronRequest(request); if(authFailure) return authFailure;
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const now=Date.now(); const {data:callbacks,error}=await supabaseAdmin.from('service_callbacks').select('*').eq('status','scheduled').gt('starts_at',new Date(now).toISOString()).lte('starts_at',new Date(now+60*60000).toISOString()).limit(100);
 if(error) return Response.json({error:error.message},{status:500});
 const {sendTemplateEmail}=await import('@/lib/email-templates/send-email'); let handled=0;
 for(const callback of callbacks??[]) {
 const minutes=dueReminders(callback.starts_at,callback.handled_reminders,now,callback.reminder_minutes);
 for(const minute of minutes) {
 const {data:current}=await supabaseAdmin.from('service_callbacks').select('status,starts_at,handled_reminders').eq('id',callback.id).single();
 if(!current||current.status!=='scheduled'||current.starts_at!==callback.starts_at||current.handled_reminders.includes(minute)) continue;
 const time=new Date(callback.starts_at).toLocaleString('en-US',{timeZone:callback.timezone});
 try {await sendTemplateEmail('service-notice',callback.paralegal_email,{templateData:{title:`Call in ${minute} minutes: ${callback.title}`,lines:[`Time: ${time} (${callback.timezone})`,'Open the staff board to see the client file.'],language:'en'},idempotencyKey:`callback-${callback.id}-${minute}-${callback.starts_at}`});
 const next=[...callback.handled_reminders,minute]; const {error:updateError}=await supabaseAdmin.from('service_callbacks').update({handled_reminders:next}).eq('id',callback.id).eq('status','scheduled').eq('starts_at',callback.starts_at); if(updateError) throw new Error(updateError.message); callback.handled_reminders=next; handled++;
 } catch(error) { console.error('Callback reminder failed',callback.id,error instanceof Error?error.message:'Unknown'); }
 }
 }
 return Response.json({handled});
}}}});