import { Html, Head, Preview, Body, Container, Heading, Text } from '@react-email/components';
import type { TemplateEntry } from './registry';
type Props = { title?: string; name?: string; lines?: string[]; language?: string };
export const template = {
 component: ({title='Your appointment',name='',lines=[],language='en'}: Props) => <Html lang={language}><Head/><Preview>{title}</Preview><Body style={{backgroundColor:'#ffffff',fontFamily:'Arial, sans-serif'}}><Container style={{padding:'24px',maxWidth:'600px'}}><Heading>{title}</Heading><Text>{name}</Text>{lines.map((line,index)=><Text key={index}>{line}</Text>)}</Container></Body></Html>,
 subject: (data: Record<string, unknown>) => String(data.title || 'Your appointment'),
 displayName: 'Client documents and appointment notice',
} satisfies TemplateEntry;