import { useEffect, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { Button } from '@/components/ui/button';
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { PromptInput, PromptInputTextarea, PromptInputFooter, PromptInputSubmit } from '@/components/ai-elements/prompt-input';
import { Shimmer } from '@/components/ai-elements/shimmer';
import { useLang } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { createVideoThread, listVideoThreads } from '@/lib/video-chat.functions';
const COPY={en:{heading:'Questions about this video?',placeholder:'Ask a question',new:'New conversation',sign:'Sign in to ask Claude',waiting:'Claude is answering…',send:'Send question',stop:'Stop',saved:'Your conversations',empty:'Ask Claude'},es:{heading:'¿Tiene preguntas sobre este video?',placeholder:'Escriba una pregunta',new:'Nueva conversación',sign:'Inicie sesión para preguntar a Claude',waiting:'Claude está respondiendo…',send:'Enviar pregunta',stop:'Detener',saved:'Sus conversaciones',empty:'Pregunte a Claude'},ht:{heading:'Ou gen kesyon sou videyo sa a?',placeholder:'Poze yon kesyon',new:'Nouvo konvèsasyon',sign:'Konekte pou poze Claude kesyon',waiting:'Claude ap reponn…',send:'Voye kesyon',stop:'Sispann',saved:'Konvèsasyon ou yo',empty:'Poze Claude kesyon'}};
export function SavedVideoChat({id,messages:initial}:{id:string;messages:UIMessage[]}){
 const {lang}=useLang();const copy=COPY[lang];const ref=useRef<HTMLTextAreaElement>(null);
 const transport=new DefaultChatTransport({api:'/api/public/video-questions',body:{conversationId:id,language:lang},headers:async()=>{const {data}=await supabase.auth.getSession();return {Authorization:`Bearer ${data.session?.access_token??''}`};}});
 const {messages,sendMessage,status,stop,error}=useChat({id,messages:initial,transport});
 useEffect(()=>{if(status==='ready'&&document.activeElement?.tagName!=='INPUT')ref.current?.focus({preventScroll:true});},[status]);
 return <div className="text-left"><Conversation className="h-64"><ConversationContent>{messages.map(message=><Message from={message.role} key={message.id}><MessageContent>{message.parts.map((part,i)=>part.type==='text'?<MessageResponse key={i}>{part.text}</MessageResponse>:null)}</MessageContent></Message>)}{status==='submitted'&&<Shimmer>{copy.waiting}</Shimmer>}</ConversationContent></Conversation>
 {error&&<p role="alert" className="text-destructive">{error.message}</p>}
 <PromptInput onSubmit={async({text})=>{if(text.trim()){await sendMessage({text});ref.current?.focus({preventScroll:true});}}}><PromptInputTextarea ref={ref} aria-label={copy.placeholder} placeholder={copy.placeholder}/><PromptInputFooter className="justify-end"><PromptInputSubmit status={status} onStop={()=>void stop()} aria-label={status==='streaming'?copy.stop:copy.send}/></PromptInputFooter></PromptInput></div>;
}
export default function VideoQuestionBox({topic}:{topic:'overview'|'home'|'business'}){
 const {lang}=useLang();const copy=COPY[lang];const create=useServerFn(createVideoThread);const list=useServerFn(listVideoThreads);
 const [signed,setSigned]=useState(false);const [threads,setThreads]=useState<{id:string;title:string}[]>([]);const [active,setActive]=useState<string|null>(null);const [error,setError]=useState('');
 useEffect(()=>{let alive=true;void supabase.auth.getUser().then(async({data})=>{if(!alive)return;setSigned(Boolean(data.user));if(data.user){try{const rows=await list({data:{topic}});if(alive)setThreads(rows);}catch(e){if(alive)setError(e instanceof Error?e.message:'');}}});return()=>{alive=false;};},[topic,list]);
 const start=async()=>{try{const row=await create({data:{topic,title:copy.empty}});setActive(row.id);setThreads(t=>[{id:row.id,title:copy.empty},...t]);}catch(e){setError(e instanceof Error?e.message:'');}};
 return <div className="mx-auto mt-8 w-full max-w-3xl border-t border-border pt-6 text-left"><h3 className="mb-3 text-lg font-semibold">{copy.heading}</h3>{!signed?<Button asChild variant="outline"><a href="#assessment">{copy.sign}</a></Button>:<><Button variant="outline" onClick={()=>void start()}>{copy.new}</Button>{active&&<SavedVideoChat key={`${active}-${lang}`} id={active} messages={[]}/>}<div className="mt-3 flex flex-wrap gap-3">{threads.map(t=><Link key={t.id} to="/video-chat/$threadId" params={{threadId:t.id}} search={{lang}} className="text-primary underline">{t.title}</Link>)}</div></>}{error&&<p role="alert">{error}</p>}</div>;
}