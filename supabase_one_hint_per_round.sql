-- Supabase Dashboard > SQL Editor에서 한 번 실행하세요.
-- 팀별·라운드별로 힌트 하나만 구매할 수 있도록 변경합니다.

begin;

create temporary table duplicate_hint_views
on commit drop
as
select
  id,
  team_id,
  deducted_amount
from (
  select
    id,
    team_id,
    deducted_amount,
    row_number() over (
      partition by team_id, round_id
      order by created_at asc, id asc
    ) as purchase_order
  from public.team_hint_views
) ranked
where purchase_order > 1;

update public.teams as team
set cash = team.cash + refund.total_refund
from (
  select
    team_id,
    sum(deducted_amount) as total_refund
  from duplicate_hint_views
  group by team_id
) as refund
where team.id = refund.team_id;

delete from public.team_hint_views
where id in (
  select id
  from duplicate_hint_views
);

alter table public.team_hint_views
  drop constraint if exists team_hint_views_team_id_round_id_hint_id_key;

alter table public.team_hint_views
  drop constraint if exists team_hint_views_one_per_round_key;

alter table public.team_hint_views
  add constraint team_hint_views_one_per_round_key
  unique (team_id, round_id);

commit;
