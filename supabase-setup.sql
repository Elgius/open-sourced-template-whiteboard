-- Create the drawings table
CREATE TABLE IF NOT EXISTS drawings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now
-- You can modify this later to add user authentication
CREATE POLICY "Allow all operations on drawings" ON drawings
  FOR ALL USING (true);

-- Create an index on updated_at for better performance when ordering
CREATE INDEX IF NOT EXISTS idx_drawings_updated_at ON drawings (updated_at DESC);

-- Create an index on created_at for better performance
CREATE INDEX IF NOT EXISTS idx_drawings_created_at ON drawings (created_at DESC); 