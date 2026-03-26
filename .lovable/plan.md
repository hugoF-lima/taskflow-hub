

## Plan: Supabase SQL Database Schema + Seed Data

### Overview

Create the full database schema in Supabase matching the existing app models (departments, profiles, tasks, task_assignees, feedback, feedback_attachments, user_roles, user_department_visibility, pending_registrations), with enums, RLS policies, and seed data from mock. All task deadlines will be pushed to April 2026+.

### Schema Design

```text
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────────────┐
│  departments    │◄────│  profiles        │     │  user_roles              │
│  id (text PK)   │     │  id (uuid PK/FK) │────►│  user_id (uuid FK)       │
│  name           │     │  name            │     │  role (app_role enum)     │
│  color          │     │  department_id   │     └──────────────────────────┘
└─────────────────┘     │  avatar_url      │
        ▲               │  email           │     ┌──────────────────────────┐
        │               └──────────────────┘────►│  user_department_visibility│
        │                       ▲                │  user_id (uuid FK)       │
        │                       │                │  department_id (text FK) │
        │               ┌──────────────────┐     └──────────────────────────┘
        │               │  tasks           │
        └───────────────│  department_id?  │     ┌──────────────────────────┐
                        │  id (uuid PK)    │────►│  task_assignees          │
                        │  code, title     │     │  task_id (uuid FK)       │
                        │  deadline        │     │  user_id (uuid FK)       │
                        │  urgency (enum)  │     └──────────────────────────┘
                        │  important       │
                        │  process         │     ┌──────────────────────────┐
                        │  completed       │────►│  feedback                │
                        │  created_by (FK) │     │  task_id (uuid FK)       │
                        └──────────────────┘     │  topic (enum)            │
                                                 │  type (enum)             │
                                                 │  comment, anonymous      │
                                                 │  author_id (uuid FK)     │
                                                 └──────────┬───────────────┘
                                                            │
                                                 ┌──────────▼───────────────┐
                                                 │  feedback_attachments    │
                                                 │  feedback_id (uuid FK)   │
                                                 │  name, url, type, size   │
                                                 └──────────────────────────┘

┌──────────────────────────┐
│  pending_registrations   │
│  id (uuid PK)            │
│  name, email             │
│  department_id (text FK) │
│  status                  │
└──────────────────────────┘
```

### Migration 1: Schema (enums, tables, RLS)

**Enums:**
- `app_role` = ('admin', 'user')
- `urgency_level` = ('normal', 'medium', 'critical', 'critical24h', 'report')
- `feedback_topic` = ('Organização', 'Comunicação', 'Pro atividade', 'Prioridades', 'ICC', 'KISS', 'Reportar problemas')
- `feedback_type` = ('precisa mais atenção', 'precisa um pouco mais de atenção', 'mandou bem!', 'cooperação')

**Tables:**
1. `departments` -- text PK (e.g. 'comercial'), name, color
2. `profiles` -- uuid PK references auth.users, name, email, department_id FK, avatar_url
3. `user_roles` -- uuid PK, user_id FK (unique), role (app_role)
4. `user_department_visibility` -- uuid PK, user_id FK, department_id FK (unique pair)
5. `tasks` -- uuid PK, code (unique), title, deadline, urgency, important, process, observations, completed, completed_at, created_at, created_by FK profiles
6. `task_assignees` -- uuid PK, task_id FK, user_id FK (unique pair)
7. `feedback` -- uuid PK, task_id FK, topic, type, comment, anonymous, author_id FK, created_at
8. `feedback_attachments` -- uuid PK, feedback_id FK, name, url, type, size
9. `pending_registrations` -- uuid PK, name, email, department_id FK, status text default 'pending', created_at

**Security definer function:**
- `has_role(uuid, app_role)` for RLS without recursion

**RLS policies:**
- `departments`: SELECT for all authenticated
- `profiles`: SELECT for authenticated; UPDATE own row
- `user_roles`: SELECT via has_role or own row
- `tasks`: SELECT for authenticated users whose visible departments include the task's assignees' departments; INSERT/UPDATE/DELETE gated by creator/assignee or admin
- `task_assignees`, `feedback`, `feedback_attachments`: SELECT for authenticated; INSERT for authenticated; UPDATE/DELETE restricted
- `pending_registrations`: INSERT for anon+authenticated; SELECT/UPDATE for admins

### Migration 2: Seed Data (via insert tool)

**Departments:** 6 rows matching mock (comercial, informatica, expedicao, almoxarifado, processos, rh)

**Profiles:** 12 rows with deterministic UUIDs (using `gen_random_uuid()` or fixed UUIDs for FK consistency)

Since we need FK consistency across profiles, tasks, assignees, and feedback, we'll use fixed UUIDs for the 12 mock users. Example pattern: `00000000-0000-0000-0000-000000000001` through `...000000000012`.

**User roles:** Carlos (u1) = admin, all others = user

**User department visibility:** Carlos gets all 6 departments. Bruno gets only 'informatica'. Others get their own department.

**Tasks:** 37 tasks with deadlines shifted so the base date is April 10, 2026 (instead of March 24). This ensures all deadlines are April 2026+. Tasks with negative offsets (e.g. -3) become April 7, still past April 1. Completed tasks get completed_at in late March 2026.

**Task assignees:** One row per task linking to the assignee.

**Feedback:** All mock feedback entries, with created_at dates in March 2026.

### Files Changed

| File | Change |
|------|--------|
| Supabase migration | Schema: enums, 9 tables, `has_role` function, RLS policies |
| Supabase insert | Seed data: departments, profiles, user_roles, visibility, tasks, assignees, feedback |

### Notes
- No code changes to the app in this step -- this is schema-only preparation for future backend migration
- Profiles table uses fixed UUIDs (not tied to auth.users yet) so seed data works without real Supabase Auth accounts. When auth is implemented, these will be linked
- The `code` column on tasks auto-generates via a sequence or is inserted manually matching the GAP-XXXX pattern

