
-- Enums
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.urgency_level AS ENUM ('normal', 'medium', 'critical', 'critical24h', 'report');
CREATE TYPE public.feedback_topic AS ENUM ('Organização', 'Comunicação', 'Pro atividade', 'Prioridades', 'ICC', 'KISS', 'Reportar problemas');
CREATE TYPE public.feedback_type AS ENUM ('precisa mais atenção', 'precisa um pouco mais de atenção', 'mandou bem!', 'cooperação');

-- Departments
CREATE TABLE public.departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view departments" ON public.departments FOR SELECT TO authenticated USING (true);

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  department_id TEXT REFERENCES public.departments(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own role or admins all" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- User department visibility
CREATE TABLE public.user_department_visibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  department_id TEXT NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  UNIQUE (user_id, department_id)
);
ALTER TABLE public.user_department_visibility ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own visibility" ON public.user_department_visibility FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Tasks (create without UPDATE/DELETE policies first)
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  urgency public.urgency_level NOT NULL DEFAULT 'normal',
  important BOOLEAN NOT NULL DEFAULT false,
  process TEXT NOT NULL DEFAULT '',
  observations TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id)
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);

-- Task assignees (must exist before tasks UPDATE policy)
CREATE TABLE public.task_assignees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  UNIQUE (task_id, user_id)
);
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view task assignees" ON public.task_assignees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert task assignees" ON public.task_assignees FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Creator or admin can delete assignees" ON public.task_assignees FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_id AND tasks.created_by = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Now add tasks UPDATE/DELETE policies that reference task_assignees
CREATE POLICY "Creator or assignee or admin can update tasks" ON public.tasks FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.task_assignees WHERE task_id = id AND user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Creator or admin can delete tasks" ON public.tasks FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Feedback
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  topic public.feedback_topic NOT NULL,
  type public.feedback_type NOT NULL,
  comment TEXT,
  anonymous BOOLEAN NOT NULL DEFAULT true,
  author_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view feedback" ON public.feedback FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert feedback" ON public.feedback FOR INSERT TO authenticated WITH CHECK (true);

-- Feedback attachments
CREATE TABLE public.feedback_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  size BIGINT NOT NULL DEFAULT 0
);
ALTER TABLE public.feedback_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view feedback attachments" ON public.feedback_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert feedback attachments" ON public.feedback_attachments FOR INSERT TO authenticated WITH CHECK (true);

-- Pending registrations
CREATE TABLE public.pending_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  department_id TEXT REFERENCES public.departments(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pending_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert pending registration" ON public.pending_registrations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view pending registrations" ON public.pending_registrations FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update pending registrations" ON public.pending_registrations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
