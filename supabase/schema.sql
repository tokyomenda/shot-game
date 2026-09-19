-- Run ONCE manually in the Supabase SQL Editor (postgres role).
-- Foundation migration for a project without these tables. Transactional:
-- name conflicts abort instead of silently replacing existing data/policies.
begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 40),
  birth_date date not null check (birth_date <= (current_date - interval '18 years')::date and birth_date >= (current_date - interval '121 years')::date),
  gender text not null check (gender in ('woman','man','nonbinary')),
  interested_in text not null check (interested_in in ('woman','man','everyone')),
  city text not null check (char_length(btrim(city)) between 1 and 80),
  bio text not null check (char_length(btrim(bio)) between 1 and 400),
  interests text[] not null check (cardinality(interests) between 1 and 10 and array_position(interests, null) is null),
  photo_path text not null check (photo_path ~ ('^' || id::text || '/[a-zA-Z0-9-]+\.(jpg|png|webp)$')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- Never return this table in discovery. RLS is owner-only, even for direct API queries.
create table public.profile_contacts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  contact_information text not null default '' check (char_length(contact_information) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.likes (
  liker_id uuid not null references public.profiles(id) on delete cascade,
  liked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (liker_id, liked_id),
  check (liker_id <> liked_id)
);
create index likes_received_idx on public.likes(liked_id);
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  current_level smallint not null default 1 check (current_level between 1 and 10),
  level_10_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_a, user_b),
  check (user_a < user_b),
  check (level_10_completed_at is null or current_level = 10)
);
create index matches_user_b_idx on public.matches(user_b);
create table public.questions (
  id uuid primary key default gen_random_uuid(),
  level smallint not null check (level between 1 and 10),
  prompt text not null check (char_length(btrim(prompt)) between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, level)
);
create index questions_level_idx on public.questions(level);
create table public.match_answers (
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  level smallint not null check (level between 1 and 10),
  question_id uuid not null,
  answer text not null check (char_length(btrim(answer)) between 1 and 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (match_id, level, user_id),
  foreign key (question_id, level) references public.questions(id, level)
);
create index match_answers_user_idx on public.match_answers(user_id);
create index match_answers_question_idx on public.match_answers(question_id, level);
create table public.contact_exchange_requests (
  match_id uuid not null references public.matches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  consented boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (match_id, user_id)
);
create index contact_exchange_user_idx on public.contact_exchange_requests(user_id);
create index profiles_discovery_idx on public.profiles(created_at desc, id);

create function public.meet_touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create function public.meet_validate_profile() returns trigger
language plpgsql set search_path = '' as $$
begin
  if exists (select 1 from unnest(new.interests) as i(value) where char_length(btrim(i.value)) not between 1 and 30)
     or array_ndims(new.interests) <> 1 then
    raise exception 'Invalid interests' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger meet_profile_validation before insert or update on public.profiles
for each row execute function public.meet_validate_profile();

-- Future answer/consent writes must also belong to the match, even for server jobs.
create function public.meet_validate_participant() returns trigger
language plpgsql set search_path = '' as $$
begin
  if not exists (select 1 from public.matches m where m.id = new.match_id and new.user_id in (m.user_a, m.user_b)) then
    raise exception 'Not a match participant' using errcode = '23514';
  end if;
  return new;
end;
$$;
create trigger meet_answer_participant before insert or update on public.match_answers
for each row execute function public.meet_validate_participant();
create trigger meet_consent_participant before insert or update on public.contact_exchange_requests
for each row execute function public.meet_validate_participant();

do $$
declare t text;
begin
  foreach t in array array['profiles','profile_contacts','likes','matches','questions','match_answers','contact_exchange_requests'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from public, anon, authenticated', t);
    execute format('create trigger meet_updated_at before update on public.%I for each row execute function public.meet_touch_updated_at()', t);
  end loop;
end;
$$;

grant select, insert, update on public.profiles, public.profile_contacts to authenticated;
grant select, insert on public.likes to authenticated;
grant select on public.matches, public.questions, public.match_answers, public.contact_exchange_requests to authenticated;
create policy profiles_owner_read on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_owner_insert on public.profiles for insert to authenticated with check (id = (select auth.uid()));
create policy profiles_owner_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy contacts_owner_read on public.profile_contacts for select to authenticated using (user_id = (select auth.uid()));
create policy contacts_owner_insert on public.profile_contacts for insert to authenticated with check (user_id = (select auth.uid()));
create policy contacts_owner_update on public.profile_contacts for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy likes_owner_read on public.likes for select to authenticated using (liker_id = (select auth.uid()));
create policy likes_owner_insert on public.likes for insert to authenticated with check (liker_id = (select auth.uid()) and exists (select 1 from public.profiles where id = (select auth.uid())));
create policy matches_participant_read on public.matches for select to authenticated using ((select auth.uid()) in (user_a, user_b));
create policy questions_member_read on public.questions for select to authenticated using (exists (select 1 from public.profiles where id = (select auth.uid())));
-- No peer answer visibility until a future trusted reveal operation is implemented.
create policy answers_owner_read on public.match_answers for select to authenticated using (user_id = (select auth.uid()) and exists (select 1 from public.matches m where m.id = match_id and (select auth.uid()) in (m.user_a,m.user_b)));
create policy consent_owner_read on public.contact_exchange_requests for select to authenticated using (user_id = (select auth.uid()) and exists (select 1 from public.matches m where m.id = match_id and (select auth.uid()) in (m.user_a,m.user_b)));
-- Intentionally NO client write grants/policies for matches, questions, answers or consent.
-- No client can manufacture a match, level completion, revealed answers or contact access.

create function public.save_meet_profile(
  p_display_name text, p_birth_date date, p_gender text, p_interested_in text,
  p_city text, p_bio text, p_interests text[], p_photo_path text, p_contact_information text
) returns void language plpgsql security invoker set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  if not exists (select 1 from storage.objects o where o.bucket_id = 'profile-photos' and o.name = p_photo_path and (storage.foldername(o.name))[1] = auth.uid()::text) then
    raise exception 'Upload your profile photo first' using errcode = '23514';
  end if;
  insert into public.profiles (id,display_name,birth_date,gender,interested_in,city,bio,interests,photo_path)
  values (auth.uid(),btrim(p_display_name),p_birth_date,p_gender,p_interested_in,btrim(p_city),btrim(p_bio),p_interests,p_photo_path)
  on conflict (id) do update set display_name=excluded.display_name,birth_date=excluded.birth_date,gender=excluded.gender,
    interested_in=excluded.interested_in,city=excluded.city,bio=excluded.bio,interests=excluded.interests,photo_path=excluded.photo_path;
  insert into public.profile_contacts (user_id,contact_information) values (auth.uid(),btrim(coalesce(p_contact_information,'')))
  on conflict (user_id) do update set contact_information=excluded.contact_information;
end;
$$;

-- Explicitly whitelisted projection. Definer is needed because raw profiles are owner-only.
-- No birth_date, preferences, contacts, email, or auth metadata leaves this function.
create function public.discover_profiles()
returns table (id uuid, display_name text, age integer, city text, bio text, interests text[], photo_path text)
language sql stable security definer set search_path = '' as $$
  select p.id, p.display_name, extract(year from age(current_date,p.birth_date))::integer,
    p.city, p.bio, p.interests, p.photo_path
  from public.profiles p
  where auth.uid() is not null and p.id <> auth.uid()
    and exists (select 1 from public.profiles me where me.id = auth.uid())
    and not exists (select 1 from public.likes l where l.liker_id = auth.uid() and l.liked_id = p.id)
  order by p.created_at desc, p.id
  limit 50;
$$;

create function public.can_read_meet_photo(object_name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and (
    split_part(object_name,'/',1) = auth.uid()::text
    or (exists (select 1 from public.profiles me where me.id = auth.uid())
      and exists (select 1 from public.profiles p where p.photo_path = object_name))
  );
$$;

revoke all on function public.meet_touch_updated_at(), public.meet_validate_profile(), public.meet_validate_participant() from public, anon, authenticated;
revoke all on function public.save_meet_profile(text,date,text,text,text,text,text[],text,text), public.discover_profiles(), public.can_read_meet_photo(text) from public, anon, authenticated;
grant execute on function public.save_meet_profile(text,date,text,text,text,text,text[],text,text), public.discover_profiles(), public.can_read_meet_photo(text) to authenticated;

-- Private bucket: authenticated discovery uses short-lived signed URLs.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('profile-photos','profile-photos',false,5242880,array['image/jpeg','image/png','image/webp']);
create policy meet_photos_read on storage.objects for select to authenticated
using (bucket_id = 'profile-photos' and public.can_read_meet_photo(name));
create policy meet_photos_insert on storage.objects for insert to authenticated
with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy meet_photos_update on storage.objects for update to authenticated
using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy meet_photos_delete on storage.objects for delete to authenticated
using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;