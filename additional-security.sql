-- Additional security setup for existing drawings table
-- Run this if you want to enable Row Level Security

-- Enable Row Level Security (RLS)
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now
-- You can modify this later to add user authentication
CREATE POLICY "Allow all operations on drawings" ON drawings
  FOR ALL USING (true); 