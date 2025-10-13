-- Add foreign key relationship for circle_calls to profiles
ALTER TABLE circle_calls
ADD CONSTRAINT circle_calls_caller_id_fkey 
FOREIGN KEY (caller_id) 
REFERENCES profiles(id) 
ON DELETE CASCADE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_circle_calls_room_id ON circle_calls(room_id);
CREATE INDEX IF NOT EXISTS idx_circle_calls_circle_id ON circle_calls(circle_id);
CREATE INDEX IF NOT EXISTS idx_circle_calls_status ON circle_calls(status);