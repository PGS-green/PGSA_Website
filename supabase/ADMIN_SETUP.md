# PGSA administrator setup

Public account registration should remain disabled. Create administrators manually in the Supabase Dashboard.

1. Open **Authentication → Users → Add user**.
2. For username `pgsgreenAdmin`, use the synthetic email `pgsgreenadmin@admin.pgsa.local`.
3. Set the administrator password directly in Supabase Auth and mark the email as confirmed. Never place the password in source code or a Vercel environment variable.
4. Copy the new user's UUID.
5. Run this in the SQL Editor, replacing the UUID:

```sql
insert into public.admins (user_id, username)
values ('USER_UUID', 'pgsgreenAdmin');
```

The website login accepts `pgsgreenAdmin` case-insensitively and converts it to the synthetic email internally. The `admins` table and Row-Level Security policies are the authorization boundary: an authenticated user who is not listed there cannot read unpublished projects or change database and Storage content.
