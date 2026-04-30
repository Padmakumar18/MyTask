# YouTube Watch Later - Quick Setup Guide

## Step 1: Create Database Table

Run this SQL in your Supabase SQL Editor:

```sql
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
```

## Step 2: Add Navigation Link

Update your navigation menu to include the YouTube Watch Later link:

```html
<!-- In your navigation component -->
<a routerLink="/youtube" routerLinkActive="active">
  <svg><!-- YouTube icon --></svg>
  Watch Later
</a>
```

## Step 3: Access the Page

1. **Build the application** (already done):

   ```bash
   npm run build
   ```

2. **Start the dev server**:

   ```bash
   npm start
   ```

3. **Navigate to**: `http://localhost:4200/youtube`

## Step 4: Test the Features

### Add a Video

1. Click "Add Video" button
2. Paste a YouTube URL (e.g., `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
3. Click "Add Video"
4. Video appears in the grid with thumbnail

### Edit a Video

1. Click the edit button (pencil icon) on any video card
2. Modify the URL, title, or status
3. Click "Update Video"

### Toggle Status

1. Click the status button (checkmark icon) on any video card
2. Status toggles between "Need to Watch" and "Completed"

### Delete a Video

1. Click the delete button (trash icon) on any video card
2. Confirm deletion in the dialog

### Filter Videos

1. Click on the statistics cards at the top:
   - **Total**: Show all videos
   - **To Watch**: Show only pending videos
   - **Watched**: Show only completed videos

## Supported YouTube URL Formats

The application supports these URL formats:

1. **Standard**: `https://www.youtube.com/watch?v=VIDEO_ID`
2. **Short**: `https://youtu.be/VIDEO_ID`
3. **Embed**: `https://www.youtube.com/embed/VIDEO_ID`
4. **Direct ID**: `VIDEO_ID` (11 characters)

## Features Overview

✅ **Add Videos**: Save YouTube links with custom titles
✅ **Edit Videos**: Update URL, title, or status
✅ **Delete Videos**: Remove videos with confirmation
✅ **Status Tracking**: Mark as "Need to Watch" or "Completed"
✅ **Thumbnails**: Automatic YouTube thumbnail display
✅ **Filtering**: Filter by status (All, To Watch, Watched)
✅ **Statistics**: Real-time counts for each status
✅ **Responsive**: Works on mobile, tablet, and desktop
✅ **Watch Videos**: Click thumbnail or link to open on YouTube

## Troubleshooting

### Videos Not Loading

- Check that you're logged in
- Verify the database table was created correctly
- Check browser console for errors

### Thumbnails Not Showing

- Verify the video ID is correct
- Check if the YouTube video is public
- Try a different video URL

### Can't Add Videos

- Ensure the URL is a valid YouTube link
- Check that the form validation passes
- Verify you're logged in

### Foreign Key Error

- Make sure the `users` table exists
- Verify the foreign key references `users(user_id)`
- Check that your user_id exists in the users table

## Quick Tips

1. **Paste URLs Quickly**: Just paste the YouTube URL and click Add
2. **Custom Titles**: Leave title blank to use default "YouTube Video"
3. **Quick Status Toggle**: Click the checkmark button to toggle status
4. **Filter by Status**: Click stat cards to filter the list
5. **Open Videos**: Click thumbnail to watch on YouTube

## Next Steps

1. Add videos to your watch later list
2. Organize them by status
3. Use filters to focus on what you need to watch
4. Mark videos as completed when done
5. Delete videos you no longer need

Enjoy your YouTube Watch Later feature! 🎥
