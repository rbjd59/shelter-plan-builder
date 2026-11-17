import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery, queryOptions } from '@tanstack/react-query';
import type { UIMessage } from 'ai';
import { getVideoThread } from '@/lib/video-chat.functions';
import { SavedVideoChat } from '@/components/VideoQuestionBox';
const options=(id:string)=>queryOptions({queryKey:['video-thread',id],queryFn:()=>getVideoThread({data:{id}})});
export const Route=createFileRoute('/_authenticated/video-chat/$threadId')({validateSearch:(s:Record<string,unknown>)=>({lang:typeof s.lang==='string'?s.lang:'en'}),loader:({params,context})=>context.queryClient.ensureQueryData(options(params.threadId)),head:()=>({meta:[{title:'Saved video questions — DetencionDefensa'},{name:'description',content:'Your private saved questions about DetencionDefensa videos.'},{property:'og:title',content:'Saved video questions — DetencionDefensa'},{property:'og:description',content:'Private video conversations saved to your account.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'}]}),component:Page});
function Page(){const {threadId}=Route.useParams();const {data}=useSuspenseQuery(options(threadId));return <main className="mx-auto max-w-3xl px-5 py-12"><h1 className="mb-6 text-2xl font-bold">{data.title}</h1><SavedVideoChat key={threadId} id={threadId} messages={data.messages as unknown as UIMessage[]}/></main>;}