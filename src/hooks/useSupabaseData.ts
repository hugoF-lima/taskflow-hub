import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Department, User, Task, Feedback, FeedbackAttachment } from '@/types';

export function useSupabaseData() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const allProcesses = [...new Set(tasks.map(t => t.process))].sort();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch departments
      const { data: deptData } = await supabase.from('departments').select('*');
      if (deptData) setDepartments(deptData.map(d => ({ id: d.id, name: d.name, color: d.color })));

      // Fetch profiles as users
      const { data: profileData } = await supabase.from('profiles').select('*');
      if (profileData) setUsers(profileData.map(p => ({ id: p.id, name: p.name, avatar: p.avatar_url ?? undefined, departmentId: p.department_id ?? '' })));

      // Fetch tasks with assignees and feedback
      const { data: taskData } = await supabase.from('tasks').select('*');
      const { data: assigneeData } = await supabase.from('task_assignees').select('*');
      const { data: feedbackData } = await supabase.from('feedback').select('*');
      const { data: attachmentData } = await supabase.from('feedback_attachments').select('*');

      if (taskData) {
        const assigneeMap = new Map<string, string[]>();
        (assigneeData ?? []).forEach(a => {
          const arr = assigneeMap.get(a.task_id) ?? [];
          arr.push(a.user_id);
          assigneeMap.set(a.task_id, arr);
        });

        const attachmentMap = new Map<string, FeedbackAttachment[]>();
        (attachmentData ?? []).forEach(att => {
          const arr = attachmentMap.get(att.feedback_id) ?? [];
          arr.push({ name: att.name, url: att.url, type: att.type, size: att.size });
          attachmentMap.set(att.feedback_id, arr);
        });

        const feedbackMap = new Map<string, Feedback[]>();
        (feedbackData ?? []).forEach(fb => {
          const arr = feedbackMap.get(fb.task_id) ?? [];
          arr.push({
            id: fb.id,
            taskId: fb.task_id,
            topic: fb.topic as Feedback['topic'],
            type: fb.type as Feedback['type'],
            comment: fb.comment ?? undefined,
            anonymous: fb.anonymous,
            authorId: fb.author_id ?? undefined,
            createdAt: fb.created_at,
            attachments: attachmentMap.get(fb.id),
          });
          feedbackMap.set(fb.task_id, arr);
        });

        setTasks(taskData.map(t => ({
          id: t.id,
          code: t.code,
          title: t.title,
          assigneeIds: assigneeMap.get(t.id) ?? [],
          deadline: t.deadline,
          urgency: t.urgency as Task['urgency'],
          important: t.important,
          process: t.process,
          observations: t.observations ?? undefined,
          completed: t.completed,
          completedAt: t.completed_at ?? undefined,
          createdAt: t.created_at,
          createdBy: t.created_by,
          feedback: feedbackMap.get(t.id) ?? [],
        })));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'code' | 'createdAt' | 'feedback'>) => {
    const { data: maxCodeRow } = await supabase
      .from('tasks')
      .select('code')
      .order('code', { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastNum = maxCodeRow?.code
      ? parseInt(maxCodeRow.code.replace('GAP-', ''), 10)
      : 0;
    const code = `GAP-${String(lastNum + 1).padStart(4, '0')}`;

    const { data, error } = await supabase.from('tasks').insert({
      code,
      title: taskData.title,
      deadline: taskData.deadline,
      urgency: taskData.urgency,
      important: taskData.important,
      process: taskData.process,
      observations: taskData.observations ?? null,
      completed: taskData.completed,
      created_by: taskData.createdBy,
    }).select().single();

    if (error || !data) { console.error('addTask error:', error); return; }

    if (taskData.assigneeIds.length > 0) {
      await supabase.from('task_assignees').insert(
        taskData.assigneeIds.map(uid => ({ task_id: data.id, user_id: uid }))
      );
    }

    await fetchAll();
  }, [fetchAll]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Omit<Task, 'id' | 'code' | 'createdAt' | 'feedback'>>) => {
    const dbUpdates: Record<string, any> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
    if (updates.urgency !== undefined) dbUpdates.urgency = updates.urgency;
    if (updates.important !== undefined) dbUpdates.important = updates.important;
    if (updates.process !== undefined) dbUpdates.process = updates.process;
    if (updates.observations !== undefined) dbUpdates.observations = updates.observations;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;

    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from('tasks').update(dbUpdates).eq('id', taskId);
    }

    if (updates.assigneeIds) {
      await supabase.from('task_assignees').delete().eq('task_id', taskId);
      if (updates.assigneeIds.length > 0) {
        await supabase.from('task_assignees').insert(
          updates.assigneeIds.map(uid => ({ task_id: taskId, user_id: uid }))
        );
      }
    }

    await fetchAll();
  }, [fetchAll]);

  const deleteTask = useCallback(async (taskId: string) => {
    await supabase.from('task_assignees').delete().eq('task_id', taskId);
    await supabase.from('feedback').delete().eq('task_id', taskId);
    await supabase.from('tasks').delete().eq('id', taskId);
    await fetchAll();
  }, [fetchAll]);

  const toggleCompletion = useCallback(async (taskId: string): Promise<boolean> => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return false;
    const newCompleted = !task.completed;
    await supabase.from('tasks').update({
      completed: newCompleted,
      completed_at: newCompleted ? new Date().toISOString() : null,
    }).eq('id', taskId);
    await fetchAll();
    return true;
  }, [tasks, fetchAll]);

  const toggleImportance = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    await supabase.from('tasks').update({ important: !task.important }).eq('id', taskId);
    await fetchAll();
  }, [tasks, fetchAll]);

  const addFeedback = useCallback(async (taskId: string, fb: Omit<Feedback, 'id' | 'taskId' | 'createdAt'>) => {
    await supabase.from('feedback').insert({
      task_id: taskId,
      topic: fb.topic,
      type: fb.type,
      comment: fb.comment ?? null,
      anonymous: fb.anonymous,
      author_id: fb.authorId ?? null,
    });
    await fetchAll();
  }, [fetchAll]);

  return {
    departments,
    users,
    tasks,
    allProcesses,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleCompletion,
    toggleImportance,
    addFeedback,
    refetch: fetchAll,
  };
}
