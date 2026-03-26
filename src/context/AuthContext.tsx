import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserPermissions, Task } from '@/types';
import { users } from '@/data/mockData';

interface MockCredential {
  email: string;
  password: string;
  userId: string;
  permissions: UserPermissions;
}

const mockCredentials: MockCredential[] = [
  { email: 'carlos@empresa.com', password: 'admin123', userId: 'u1', permissions: { visibleDepartments: 'all', role: 'admin' } },
  { email: 'bruno@empresa.com', password: 'info123', userId: 'u3', permissions: { visibleDepartments: ['informatica'], role: 'user' } },
];

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  permissions: UserPermissions | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  canActOnTask: (task: Task) => boolean;
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

  const login = useCallback((email: string, password: string) => {
    const cred = mockCredentials.find(c => c.email === email && c.password === password);
    if (cred) {
      const user = users.find(u => u.id === cred.userId);
      if (user) {
        setCurrentUser(user);
        setPermissions(cred.permissions);
        return true;
      }
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setPermissions(null);
  }, []);

  const canActOnTask = useCallback((task: Task) => {
    if (!currentUser || !permissions) return false;
    if (permissions.role === 'admin') return true;
    return task.createdBy === currentUser.id || task.assigneeIds.includes(currentUser.id);
  }, [currentUser, permissions]);

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, permissions, login, logout, canActOnTask }}>
      {children}
    </AuthContext.Provider>
  );
}
