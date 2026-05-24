-- ─────────────────────────────────────────
-- Scribe Clone — Supabase Schema
-- Run this in your Supabase SQL editor
-- ─────────────────────────────────────────

create table if not exists guides (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  title       text not null default 'Untitled Guide',
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  is_public   boolean default false,
  share_token text unique default substr(md5(random()::text), 1, 12)
);

create table if not exists steps (
  id                          uuid primary key default gen_random_uuid(),
  guide_id                    uuid references guides(id) on delete cascade,
  step_number                 int not null,
  title                       text not null default 'Untitled Step',
  description                 text,
  type                        text default 'click',        -- click | type | navigate | select
  screenshot_url              text,                        -- Supabase Storage path
  annotated_screenshot_url    text,                        -- with drawn highlight overlay
  annotation_rect             jsonb,                       -- {x,y,w,h} in canvas pixels
  click_x                     int,
  click_y                     int,
  element_rect                jsonb,
  source_url                  text,
  created_at                  timestamptz default now()
);

-- Keep updated_at current
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger guides_updated_at before update on guides
  for each row execute function update_updated_at();

-- Storage bucket for screenshots
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict do nothing;

-- RLS policies
alter table guides enable row level security;
alter table steps enable row level security;

create policy "Users see own guides"
  on guides for select using (auth.uid() = user_id or is_public = true);
create policy "Users insert own guides"
  on guides for insert with check (auth.uid() = user_id);
create policy "Users update own guides"
  on guides for update using (auth.uid() = user_id);
create policy "Users delete own guides"
  on guides for delete using (auth.uid() = user_id);

create policy "Steps visible with guide"
  on steps for select using (
    exists (select 1 from guides g where g.id = guide_id and (g.user_id = auth.uid() or g.is_public = true))
  );
create policy "Steps insert with guide"
  on steps for insert with check (
    exists (select 1 from guides g where g.id = guide_id and g.user_id = auth.uid())
  );
create policy "Steps update with guide"
  on steps for update using (
    exists (select 1 from guides g where g.id = guide_id and g.user_id = auth.uid())
  );
create policy "Steps delete with guide"
  on steps for delete using (
    exists (select 1 from guides g where g.id = guide_id and g.user_id = auth.uid())
  );
  create table if not exists guides (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid references auth.users(id) on delete cascade,
    title       text not null default 'Untitled Guide',
    description text,
    created_at  timestamptz default now(),
    updated_at  timestamptz default now(),
    is_public   boolean default false,
    share_token text unique default substr(md5(random()::text), 1, 12)
  );

  create table if not exists steps (
    id                          uuid primary key default gen_random_uuid(),
    guide_id                    uuid references guides(id) on delete cascade,
    step_number                 int not null,
    title                       text not null default 'Untitled Step',
    description                 text,
    type                        text default 'click',
    screenshot_url              text,
    annotated_screenshot_url    text,
    annotation_rect             jsonb,
    click_x                     int,
    click_y                     int,
    element_rect                jsonb,
    source_url                  text,
    created_at                  timestamptz default now()
  );

  create or replace function update_updated_at()
  returns trigger language plpgsql as $$
  begin new.updated_at = now(); return new; end;
  $$;
  create trigger guides_updated_at before update on guides
    for each row execute function update_updated_at();

  insert into storage.buckets (id, name, public)
  values ('screenshots', 'screenshots', true)
  on conflict do nothing;

  alter table guides enable row level security;
  alter table steps enable row level security;

  create policy "Users see own guides"
    on guides for select using (auth.uid() = user_id or is_public = true);
  create policy "Users insert own guides"
    on guides for insert with check (auth.uid() = user_id);
  create policy "Users update own guides"
    on guides for update using (auth.uid() = user_id);
  create policy "Users delete own guides"
    on guides for delete using (auth.uid() = user_id);

  create policy "Steps visible with guide"
    on steps for select using (
      exists (select 1 from guides g where g.id = guide_id and (g.user_id = auth.uid() or g.is_public = true))
    );
  create policy "Steps insert with guide"
    on steps for insert with check (
      exists (select 1 from guides g where g.id = guide_id and g.user_id = auth.uid())
    );
  create policy "Steps update with guide"
    on steps for update using (
      exists (select 1 from guides g where g.id = guide_id and g.user_id = auth.uid())
    );
  create policy "Steps delete with guide"
    on steps for delete using (
      exists (select 1 from guides g where g.id = guide_id and g.user_id = auth.uid())
    );

