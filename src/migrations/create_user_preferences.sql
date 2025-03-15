
-- Create user_preferences table
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  tutorial_completed boolean default false,
  dark_mode boolean default true,
  compact_view boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (user_id)
);

-- Add RLS policies
alter table public.user_preferences enable row level security;

-- Create policy for users to read their own preferences
create policy "Users can read their own preferences"
on public.user_preferences
for select using (auth.uid() = user_id);

-- Create policy for users to update their own preferences
create policy "Users can update their own preferences"
on public.user_preferences
for update using (auth.uid() = user_id);

-- Create policy for users to insert their own preferences
create policy "Users can insert their own preferences"
on public.user_preferences
for insert with check (auth.uid() = user_id);
