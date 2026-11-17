import { supabaseAdmin } from '@/integrations/supabase/client.server';
export async function loadServiceClient(id: string, source: 'assessment'|'app') {
 if(source==='assessment') {
 const {data,error}=await supabaseAdmin.from('assessments').select('id,full_name,email,phone,language,answers,results,property_estimate,service_file').eq('id',id).single();
 if(error||!data) throw new Error('Client file not found'); return data;
 }
 const {data,error}=await supabaseAdmin.from('app_clients').select('id,full_name,email,phone_e164,language,service_file').eq('id',id).single();
 if(error||!data) throw new Error('Client file not found');
 return {...data,phone:data.phone_e164,answers:{},results:{},property_estimate:null};
}