-- Create table for storing Instagram OAuth tokens per user
CREATE TABLE public.instagram_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'bearer',
  expires_at TIMESTAMP WITH TIME ZONE,
  instagram_user_id TEXT,
  instagram_username TEXT,
  page_id TEXT,
  page_access_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.instagram_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own Instagram tokens" 
ON public.instagram_tokens 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own Instagram tokens" 
ON public.instagram_tokens 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Instagram tokens" 
ON public.instagram_tokens 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Instagram tokens" 
ON public.instagram_tokens 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_instagram_tokens_updated_at
BEFORE UPDATE ON public.instagram_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_instagram_tokens_user_id ON public.instagram_tokens(user_id);
CREATE INDEX idx_instagram_tokens_expires_at ON public.instagram_tokens(expires_at);