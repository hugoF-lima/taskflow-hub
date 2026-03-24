import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Task, Feedback, AppFilters, SidebarMode, AppSettings, ViewMode, UrgencyLevel, FeedbackTopic, TaskStatus } from '@/types';
import { tasks as initialTasks, users } from '@/data/mockData';

interface AppContextType {
  tasks: Task[];
  filters: AppFilters;
  setFilter: <K extends keyof AppFilters>(key: K, value: AppFilters[K]) => void;
  resetFilters: () => void;
  selectedUserId: string | null;
  sidebarMode: SidebarMode;
  handleUserClick: (userId: string) => void;
  handleUserDoubleClick: (userId: string) => void;
  clearUserSelection: () => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  settings: AppSettings;
  toggleSetting: (key: keyof AppSettings) => void;
  addFeedback: (taskId: string, feedback: Omit<Feedback, 'id' | 'taskId' | 'createdAt'>) => void;
  toggleTaskCompletion: (taskId: string) => boolean;
  toggleTaskImportance: (taskId: string) => void;
  filteredTasks: Task[];
  getTaskStatus: (task: Task) => TaskStatus;
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
}

const defaultFilters: AppFilters = {
  departmentId: null,
  process: null,
  urgency: null,
  status: null,
  feedbackTopic: null,
  dateRange: { from: null, to: null },
};

const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filters, setFilters] = useState<AppFilters>(defaultFilters);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('none');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [settings, setSettings] = useState<AppSettings>({
    feedbackRequired: false,
    darkMode: false,
    managerDashboard: false,
  });
  const [zoomLevel, setZoomLevel] = useState(100);

  const setFilter = useCallback(<K extends keyof AppFilters>(key: K, value: AppFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(defaultFilters), []);

  const handleUserClick = useCallback((userId: string) => {
    if (sidebarMode === 'highlight' && selectedUserId === userId) {
      setSelectedUserId(null);
      setSidebarMode('none');
    } else {
      setSelectedUserId(userId);
      setSidebarMode('highlight');
    }
  }, [sidebarMode, selectedUserId]);

  const handleUserDoubleClick = useCallback((userId: string) => {
    if (sidebarMode === 'isolate' && selectedUserId === userId) {
      setSelectedUserId(null);
      setSidebarMode('none');
    } else {
      setSelectedUserId(userId);
      setSidebarMode('isolate');
    }
  }, [sidebarMode, selectedUserId]);

  const clearUserSelection = useCallback(() => {
    setSelectedUserId(null);
    setSidebarMode('none');
  }, []);

  const toggleSetting = useCallback((key: keyof AppSettings) => {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === 'darkMode') {
        document.documentElement.classList.toggle('dark', next.darkMode);
      }
      return next;
    });
  }, []);

  const getTaskStatus = useCallback((task: Task): TaskStatus => {
    if (task.completed) return 'completed';
    if (new Date(task.deadline) < new Date()) return 'overdue';
    return 'active';
  }, []);

  const addFeedback = useCallback((taskId: string, fb: Omit<Feedback, 'id' | 'taskId' | 'createdAt'>) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        feedback: [...t.feedback, {
          ...fb,
          id: `fb-${Date.now()}`,
          taskId,
          createdAt: new Date().toISOString(),
        }],
      };
    }));
  }, []);

  const toggleTaskCompletion = useCallback((taskId: string): boolean => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return false;
    if (!task.completed && settings.feedbackRequired && task.feedback.length === 0) {
      return false; // blocked
    }
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      return { ...t, completed: !t.completed, completedAt: !t.completed ? new Date().toISOString() : undefined };
    }));
    return true;
  }, [tasks, settings.feedbackRequired]);

  const toggleTaskImportance = useCallback((taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, important: !t.important } : t));
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Isolate mode
      if (sidebarMode === 'isolate' && selectedUserId && task.assigneeId !== selectedUserId) return false;

      if (filters.departmentId) {
        const user = users.find(u => u.id === task.assigneeId);
        if (user && user.departmentId !== filters.departmentId) return false;
      }
      if (filters.process && task.process !== filters.process) return false;
      if (filters.urgency && task.urgency !== filters.urgency) return false;
      if (filters.status) {
        const status = getTaskStatus(task);
        if (status !== filters.status) return false;
      }
      if (filters.feedbackTopic) {
        if (!task.feedback.some(f => f.topic === filters.feedbackTopic)) return false;
      }
      if (filters.dateRange.from && new Date(task.deadline) < filters.dateRange.from) return false;
      if (filters.dateRange.to && new Date(task.deadline) > filters.dateRange.to) return false;
      return true;
    });
  }, [tasks, filters, sidebarMode, selectedUserId, getTaskStatus]);

  const value = useMemo(() => ({
    tasks, filters, setFilter, resetFilters,
    selectedUserId, sidebarMode, handleUserClick, handleUserDoubleClick, clearUserSelection,
    viewMode, setViewMode, settings, toggleSetting,
    addFeedback, toggleTaskCompletion, toggleTaskImportance,
    filteredTasks, getTaskStatus, zoomLevel, setZoomLevel,
  }), [tasks, filters, setFilter, resetFilters, selectedUserId, sidebarMode, handleUserClick, handleUserDoubleClick, clearUserSelection, viewMode, setViewMode, settings, toggleSetting, addFeedback, toggleTaskCompletion, toggleTaskImportance, filteredTasks, getTaskStatus, zoomLevel, setZoomLevel]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
