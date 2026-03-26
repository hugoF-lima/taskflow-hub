import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserPermissions, Task } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

export interface PendingRegistration {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  createdAt: Date;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  permissions: UserPermissions | null;
  loading: boolean;
  pendingRegistrations: PendingRegistration[];
  registeredUsers: RegisteredUser[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  canActOnTask: (task: Task) => boolean;
  addRegistration: (name: string, email: string, departmentId: string) => Promise<void>;
  approveRegistration: (id: string, visibleDepartments: string[], password: string) => Promise<void>;
  fetchRegisteredUsers: () => Promise<void>;
  fetchPendingRegistrations: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);

  const loadUserData = useCallback(async (userId: string) => {
    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      setCurrentUser({
        id: profile.id,
        name: profile.name,
        avatar: profile.avatar_url ?? undefined,
        departmentId: profile.department_id ?? '',
      });
    }

    // Fetch role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    const role = roleData?.find(r => r.role === 'admin') ? 'admin' : 'user';

    // Fetch visible departments
    if (role === 'admin') {
      setPermissions({ visibleDepartments: 'all', role: 'admin' });
    } else {
      const { data: visData } = await supabase
        .from('user_department_visibility')
        .select('department_id')
        .eq('user_id', userId);

      setPermissions({
        visibleDepartments: visData?.map(v => v.department_id) ?? [],
        role: 'user',
      });
    }
  }, []);

  useEffect(() => {
    // Set up auth listener BEFORE getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Use setTimeout to avoid deadlock with Supabase client
          setTimeout(() => loadUserData(session.user.id), 0);
        } else {
          setCurrentUser(null);
          setPermissions(null);
        }
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setPermissions(null);
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: window.location.origin },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  const canActOnTask = useCallback((task: Task) => {
    if (!currentUser || !permissions) return false;
    if (permissions.role === 'admin') return true;
    return task.createdBy === currentUser.id || task.assigneeIds.includes(currentUser.id);
  }, [currentUser, permissions]);

  const addRegistration = useCallback(async (name: string, email: string, departmentId: string) => {
    await supabase.from('pending_registrations').insert({
      name,
      email,
      department_id: departmentId,
    });
  }, []);

  const approveRegistration = useCallback(async (id: string, visibleDepartments: string[], password: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/approve-registration`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ registrationId: id, visibleDepartments, password }),
      }
    );

    if (response.ok) {
      setPendingRegistrations(prev => prev.filter(r => r.id !== id));
    }
  }, []);

  const fetchPendingRegistrations = useCallback(async () => {
    const { data } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (data) {
      setPendingRegistrations(data.map(r => ({
        id: r.id,
        name: r.name,
        email: r.email,
        departmentId: r.department_id ?? '',
        createdAt: new Date(r.created_at),
      })));
    }
  }, []);

  const fetchRegisteredUsers = useCallback(async () => {
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: roles } = await supabase.from('user_roles').select('*');

    if (profiles) {
      setRegisteredUsers(profiles.map(p => {
        const userRole = roles?.find(r => r.user_id === p.id && r.role === 'admin');
        return {
          id: p.id,
          name: p.name,
          email: p.email ?? '',
          departmentId: p.department_id ?? '',
          role: userRole ? 'admin' : 'user',
        };
      }));
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser, isAuthenticated: !!currentUser, permissions, loading,
      pendingRegistrations, registeredUsers,
      login, logout, signUp, canActOnTask,
      addRegistration, approveRegistration,
      fetchRegisteredUsers, fetchPendingRegistrations,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
