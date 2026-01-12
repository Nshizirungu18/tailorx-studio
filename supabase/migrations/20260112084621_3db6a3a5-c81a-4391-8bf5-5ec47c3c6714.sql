-- Create table for rendered/photorealistic projects
CREATE TABLE public.rendered_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Untitled Design',
  source_sketch_url TEXT,
  rendered_image_url TEXT NOT NULL,
  prompt TEXT,
  style TEXT,
  design_id UUID REFERENCES public.designs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.rendered_projects ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own rendered projects" 
ON public.rendered_projects 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rendered projects" 
ON public.rendered_projects 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rendered projects" 
ON public.rendered_projects 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rendered projects" 
ON public.rendered_projects 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_rendered_projects_updated_at
BEFORE UPDATE ON public.rendered_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create table for tailor transfer requests
CREATE TABLE public.tailor_transfers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rendered_project_id UUID NOT NULL REFERENCES public.rendered_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  tailor_id TEXT NOT NULL,
  tailor_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tailor_transfers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own transfers" 
ON public.tailor_transfers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create transfers" 
ON public.tailor_transfers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transfers" 
ON public.tailor_transfers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for tailor_transfers timestamps
CREATE TRIGGER update_tailor_transfers_updated_at
BEFORE UPDATE ON public.tailor_transfers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();