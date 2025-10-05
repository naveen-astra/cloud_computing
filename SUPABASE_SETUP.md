# Supabase Setup Guide for Flask Note Sharing App

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** (sign up with GitHub if needed)
3. Click **"New Project"**
4. Fill in details:
   - **Name**: `secure-notes` (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
5. Click **"Create new project"** (wait 2-3 minutes)

## Step 2: Create Database Table

1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Paste this SQL code:

```sql
CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  one_time_view INTEGER NOT NULL DEFAULT 0,
  viewed INTEGER NOT NULL DEFAULT 0
);

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since we're using service key)
CREATE POLICY "Allow all operations" ON notes
FOR ALL
TO public
USING (true)
WITH CHECK (true);
```

4. Click **"Run"** button (bottom right)
5. You should see success message

## Step 3: Get Your API Credentials

1. Click **"Settings"** icon (gear) in left sidebar
2. Click **"API"** under Project Settings
3. You'll see two important values:

   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

## Step 4: Configure Your Flask App

1. Create `.env` file in `cloud_computing` folder:

```bash
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

2. Replace with YOUR actual values from Step 3

## Step 5: Test Locally

```bash
cd d:\Class\Amrita_Class\codes4\s5\cloud_computing
python app.py
```

Open browser: `http://localhost:5000`

- Create a note
- Copy the share link
- Open in another browser/tab
- Should work! ✅

## Step 6: Deploy to Cloud (Optional)

### Option A: Render.com (Recommended - Free)

1. Push code to GitHub
2. Go to [render.com](https://render.com)
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repo
5. Settings:
   - **Name**: `secure-notes-app`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
6. Add environment variables:
   - `SUPABASE_URL`: your URL
   - `SUPABASE_KEY`: your key
7. Click **"Create Web Service"**
8. Wait 5-10 minutes for deployment
9. You'll get a public URL like `https://secure-notes-app.onrender.com`

### Option B: Railway.app (Also Free)

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Select your repo
5. Add environment variables in Railway dashboard
6. Automatic deployment!

## Requirements File

Make sure your `requirements.txt` includes:

```
Flask==3.1.0
cryptography==44.0.1
supabase==2.21.1
python-dotenv==1.1.1
gunicorn==23.0.0
```

## Troubleshooting

### Error: "Please set SUPABASE_URL and SUPABASE_KEY"
- Make sure `.env` file exists in same folder as `app.py`
- Check that values don't have quotes or extra spaces

### Error: "relation 'notes' does not exist"
- Run the SQL table creation query again in Supabase SQL Editor

### Note not saving
- Check Supabase dashboard → Table Editor → notes table
- Make sure RLS policy was created

### Share links not working publicly
- Deploy the app to Render/Railway
- Can't use localhost URLs for sharing

## Security Notes

- ✅ Notes are encrypted with AES-256
- ✅ Supabase connection uses HTTPS
- ✅ Environment variables keep credentials safe
- ✅ Row Level Security (RLS) enabled
- ⚠️ Don't commit `.env` file to GitHub!

## Next Steps

After deployment:
1. Share the public URL (not localhost)
2. Create a note and copy the share link
3. Send link to anyone - they can view it!
4. Note auto-deletes after expiry or one-time view ✨
