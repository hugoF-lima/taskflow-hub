
-- Fix tasks UPDATE RLS policy bug
DROP POLICY IF EXISTS "Creator or assignee or admin can update tasks" ON public.tasks;
CREATE POLICY "Creator or assignee or admin can update tasks" ON public.tasks
FOR UPDATE TO authenticated
USING (
  created_by = auth.uid()
  OR EXISTS (SELECT 1 FROM public.task_assignees WHERE task_assignees.task_id = tasks.id AND task_assignees.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- Add INSERT policy on profiles for auth trigger and self-creation
CREATE POLICY "Service role or self can insert profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- Add INSERT/DELETE policies on user_roles for admin management
CREATE POLICY "Admins can insert user roles" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update user roles" ON public.user_roles
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user roles" ON public.user_roles
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add INSERT/DELETE policies on user_department_visibility for admin management
CREATE POLICY "Admins can insert department visibility" ON public.user_department_visibility
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update department visibility" ON public.user_department_visibility
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete department visibility" ON public.user_department_visibility
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger to auto-create profile on auth.users signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
