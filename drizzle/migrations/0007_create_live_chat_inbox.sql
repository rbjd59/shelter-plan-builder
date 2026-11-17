CREATE TABLE public.live_chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_key_hash text NOT NULL UNIQUE,
  language text NOT NULL CHECK (language IN ('en','es','ht')),
  status text NOT NULL DEFAULT 'waiting_staff' CHECK (status IN ('waiting_staff','active','ai','closed')),
  visitor_name text,
  visitor_phone text,
  assigned_to uuid,
  assigned_name text,
  callback_at timestamptz,
  callback_timezone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.live_chat_conversations TO service_role;
ALTER TABLE public.live_chat_conversations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.live_chat_messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.live_chat_conversations(id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('visitor','staff','system')),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.live_chat_messages TO service_role;
ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE INDEX live_chat_messages_conversation_created_idx ON public.live_chat_messages(conversation_id, created_at);
CREATE INDEX live_chat_conversations_status_updated_idx ON public.live_chat_conversations(status, updated_at DESC);