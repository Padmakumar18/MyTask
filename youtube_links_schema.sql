-- YouTube Links Watch Later Table Schema

-- Create youtube_links table
CREATE TABLE youtube_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  youtube_url TEXT NOT NULL,
  video_id TEXT NOT NULL,
  title TEXT,
  thumbnail_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'need_to_watch',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign key referencing the custom users table
  CONSTRAINT fk_youtube_links_user
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE,
    
  -- Check constraint for status values
  CONSTRAINT check_status
    CHECK (status IN ('need_to_watch', 'completed'))
);

-- Create indexes for better performance
CREATE INDEX idx_youtube_links_user_id ON youtube_links(user_id);
CREATE INDEX idx_youtube_links_status ON youtube_links(status);
CREATE INDEX idx_youtube_links_user_status ON youtube_links(user_id, status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_youtube_links_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_youtube_links_updated_at
  BEFORE UPDATE ON youtube_links
  FOR EACH ROW
  EXECUTE FUNCTION update_youtube_links_updated_at();

-- Optional: Enable Row Level Security (RLS)
-- ALTER TABLE youtube_links ENABLE ROW LEVEL SECURITY;

-- Sample data (optional - for testing)
-- INSERT INTO youtube_links (user_id, youtube_url, video_id, title, thumbnail_url, status)
-- VALUES 
--   ('your-user-id', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ', 'Sample Video', 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg', 'need_to_watch');
