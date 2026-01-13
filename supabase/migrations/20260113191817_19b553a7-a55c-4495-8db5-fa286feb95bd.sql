-- Create generations queue table for tracking AI generation requests
CREATE TABLE public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sketch_data TEXT,
  fabric_type TEXT DEFAULT 'cotton',
  lighting_style TEXT DEFAULT 'studio',
  detail_level INTEGER DEFAULT 70,
  agent_type TEXT DEFAULT 'realistic',
  additional_notes TEXT,
  status TEXT DEFAULT 'pending',
  generated_image TEXT,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add new columns to designs table
ALTER TABLE public.designs 
ADD COLUMN IF NOT EXISTS fabric_type TEXT,
ADD COLUMN IF NOT EXISTS lighting_style TEXT,
ADD COLUMN IF NOT EXISTS detail_level INTEGER,
ADD COLUMN IF NOT EXISTS agent_type TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT,
ADD COLUMN IF NOT EXISTS generated_image TEXT,
ADD COLUMN IF NOT EXISTS sketch_data TEXT;

-- Enable RLS on generations
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- RLS policies for generations table
CREATE POLICY "Users can view their own generations" 
ON public.generations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own generations" 
ON public.generations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own generations" 
ON public.generations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own generations" 
ON public.generations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates on generations
CREATE TRIGGER update_generations_updated_at
BEFORE UPDATE ON public.generations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for generations table
ALTER PUBLICATION supabase_realtime ADD TABLE public.generations;