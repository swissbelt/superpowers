# Connecting the forms to a real database

The three forms on this site (Government "Request a Quote," Private "Request a Quote," and Partner "Apply to Partner") save submissions to a [Supabase](https://supabase.com) project, a free, hosted Postgres database. No server to run or maintain: the static site talks to it directly.

Until you complete this setup, submitting any form shows a "not connected yet" message instead of failing silently.

## Step 1: Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free tier is plenty for this).
2. Click **New Project**. Pick any name and a database password (save that password somewhere; you likely won't need it again for this setup).
3. Wait about a minute for the project to finish provisioning.

## Step 2: Create the submissions table

1. In your new project, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `sql/schema.sql` from this folder, copy its entire contents, and paste it into the editor.
4. Click **Run**.

You should see a success message. This creates one table, `submissions`, and locks it down so the public website can only add new rows, never read, edit, or delete existing ones.

## Step 3: Copy your project's API credentials

1. In the left sidebar, go to **Project Settings → API**.
2. Copy the **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`).
3. Copy the **anon public** key (a long string starting with `eyJ...`). Do **not** use the "service_role" key for this: that one must stay secret and never go in a public website.

## Step 4: Paste them into the site

1. Open `js/config.js` in a text editor.
2. Replace `YOUR_SUPABASE_PROJECT_URL` with the Project URL from Step 3.
3. Replace `YOUR_SUPABASE_ANON_PUBLIC_KEY` with the anon public key from Step 3.
4. Save the file, and redeploy/re-upload the site.

## Step 5: Test it

Fill out any form on the live site and submit it. Then in Supabase, go to **Table Editor → submissions**: your test entry should appear as a new row within a second or two. Every submission going forward (quote requests and partner applications alike) lands there, timestamped, with no volume limit worth worrying about on the free tier.

## Viewing submissions day to day

Bookmark **Table Editor → submissions** in your Supabase project. You can sort, filter, and export to CSV from that screen, no separate admin panel needed. Supabase also has a free mobile-friendly web view, so you can check new leads from your phone.
