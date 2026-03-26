import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserPermissions, Task } from '@/types';
import { users as initialUsers } from '@/data/mockData';

export interface PendingRegistration {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  createdAt: Date;
}

interface MockCredential {
  email: string;
  password: string;
  userId: string;
  permissions: UserPermissions;
}

const initialCredentials: MockCredential[] = [
  { email: 'carlos@empresa.com', password: 'admin123', userId: 'u1', permissions: { visibleDepartments: 'all', role: 'admin' } },
  { email: 'bruno@empresa.com', password: 'info123', userId: 'u3', permissions: { visibleDepartments: ['informatica'], role: 'user' } },
];

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
  pendingRegistrations: PendingRegistration[];
  registeredUsers: RegisteredUser[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  canActOnTask: (task: Task) => boolean;
  addRegistration: (name: string, email: string, departmentId: string) => void;
  approveRegistration: (id: string, visibleDepartments: string[], password: string) => void;
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
  const [allUsers, setAllUsers] = useState<User[]>([...initialUsers]);
  const [credentials, setCredentials] = useState<MockCredential[]>([...initialCredentials]);
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistration[]>([]);

  const login = useCallback((email: string, password: string) => {
    const cred = credentials.find(c => c.email === email && c.password === password);
    if (cred) {
      const user = allUsers.find(u => u.id === cred.userId);
      if (user) {
        setCurrentUser(user);
        setPermissions(cred.permissions);
        return true;
      }
    }
    return false;
  }, [credentials, allUsers]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setPermissions(null);
  }, []);

  const canActOnTask = useCallback((task: Task) => {
    if (!currentUser || !permissions) return false;
    if (permissions.role === 'admin') return true;
    return task.createdBy === currentUser.id || task.assigneeIds.includes(currentUser.id);
  }, [currentUser, permissions]);

  const addRegistration = useCallback((name: string, email: string, departmentId: string) => {
    const reg: PendingRegistration = {
      id: `reg-${Date.now()}`,
      name,
      email,
      departmentId,
      createdAt: new Date(),
    };
    setPendingRegistrations(prev => [...prev, reg]);
    // TODO: Send notification email to admin when backend is available
  }, []);

  const approveRegistration = useCallback((id: string, visibleDepartments: string[], password: string) => {
    setPendingRegistrations(prev => {
      const reg = prev.find(r => r.id === id);
      if (!reg) return prev;

      const newUserId = `u-${Date.now()}`;
      const newUser: User = { id: newUserId, name: reg.name, departmentId: reg.departmentId };
      setAllUsers(u => [...u, newUser]);

      const newCred: MockCredential = {
        email: reg.email,
        password,
        userId: newUserId,
        permissions: { visibleDepartments, role: 'user' },
      };
      setCredentials(c => [...c, newCred]);

      // TODO: Send approval email with credentials when backend is available
      return prev.filter(r => r.id !== id);
    });
  }, []);

  const registeredUsers: RegisteredUser[] = allUsers.map(u => {
    const cred = credentials.find(c => c.userId === u.id);
    return { id: u.id, name: u.name, email: cred?.email ?? '', departmentId: u.departmentId, role: (cred?.permissions.role ?? 'user') as 'admin' | 'user' };
  });

  return (
    <AuthContext.Provider value={{
      currentUser, isAuthenticated: !!currentUser, permissions,
      pendingRegistrations, registeredUsers, login, logout, canActOnTask,
      addRegistration, approveRegistration,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
