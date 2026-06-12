# Supabase quick start (SQL was empty)

Masz pusty SQL Editor, bo schema nie byla jeszcze zainicjalizowana.

## Krok 1
W Supabase SQL Editor wklej i uruchom:

- [docs/SUPABASE_INIT.sql](docs/SUPABASE_INIT.sql)

## Krok 2 (weryfikacja)
Uruchom:

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'app_settings',
    'usage_daily',
    'top_up_purchases',
    'stripe_fulfilled_sessions',
    'subscription_entitlements',
    'publish_jobs',
    'publish_dead_letters',
    'content_brain_events',
    'security_audit_log'
  )
order by table_name;
```

## Krok 3 (opcjonalny smoke test)

```sql
select id, updated_at from public.app_settings;
```

Powinien byc 1 rekord (singleton ustawien).

## Wazne
Aktualny backend nadal zapisuje runtime do plikow `.runtime/*.json`.
Schema w Supabase jest gotowa, ale kod API trzeba jeszcze przepiac na zapisy/odczyty z bazy.
