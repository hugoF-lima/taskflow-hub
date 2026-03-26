import { useRef, useCallback } from 'react';
import { users, departments } from '@/data/mockData';
import { Separator } from '@/components/ui/separator';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

function getInitials(name: string) {
  const parts = name.split(' ');
  return (parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '');
}

function getDeptColor(deptId: string) {
  const dept = departments.find(d => d.id === deptId);
  return dept?.color ?? '0 0% 50%';
}

export function AppSidebar() {
  const { selectedUserId, sidebarMode, handleUserClick, handleUserDoubleClick, clearUserSelection, filteredTasks, filters, setFilter } = useAppContext();
  const { currentUser } = useAuth();
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const onItemClick = useCallback((userId: string) => {
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      handleUserClick(userId);
      clickTimerRef.current = null;
    }, 250);
  }, [handleUserClick]);

  const onItemDoubleClick = useCallback((userId: string) => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    handleUserDoubleClick(userId);
  }, [handleUserDoubleClick]);

  const taskCountByUser = filteredTasks.reduce((acc, t) => {
    t.assigneeIds.forEach(uid => { acc[uid] = (acc[uid] || 0) + 1; });
    return acc;
  }, {} as Record<string, number>);

  const handleDeptClick = useCallback((deptId: string) => {
    setFilter('departmentId', filters.departmentId === deptId ? null : deptId);
  }, [filters.departmentId, setFilter]);

  // Group users by department
  const currentUserId = currentUser?.id;
  const currentUserDeptId = currentUser?.departmentId;

  // Order: current user's dept first, then rest
  const sortedDepts = [...departments].sort((a, b) => {
    if (a.id === currentUserDeptId) return -1;
    if (b.id === currentUserDeptId) return 1;
    return 0;
  });

  const usersByDept = sortedDepts.map(dept => ({
    dept,
    users: users.filter(u => u.departmentId === dept.id && u.id !== currentUserId),
  }));

  const renderUserItem = (user: typeof users[0], label?: string, highlight?: boolean) => {
    const dept = departments.find(d => d.id === user.departmentId);
    const isSelected = selectedUserId === user.id;
    const count = taskCountByUser[user.id] || 0;

    return (
      <SidebarMenuItem key={user.id}>
        <SidebarMenuButton
          isActive={isSelected}
          onClick={() => onItemClick(user.id)}
          onDoubleClick={(e) => {
            e.preventDefault();
            onItemDoubleClick(user.id);
          }}
          tooltip={label || user.name}
          className={cn(
            'h-12 px-3 transition-all',
            isSelected && sidebarMode === 'isolate' && 'ring-1 ring-sidebar-primary'
          )}
        >
          <div className="relative">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback
                className="text-xs font-medium"
                style={{
                  background: `hsl(${getDeptColor(user.departmentId)} / 0.15)`,
                  color: `hsl(${getDeptColor(user.departmentId)})`,
                }}
              >
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div
              className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] w-5 rounded-full"
              style={{ background: `hsl(${getDeptColor(user.departmentId)})` }}
            />
          </div>
          <div className="flex flex-1 flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium">{label || user.name}</span>
            <span className="truncate text-xs text-sidebar-foreground/60">{dept?.name}</span>
          </div>
          {count > 0 && (
            <span className="shrink-0 text-xs tabular-nums rounded-full bg-sidebar-accent px-1.5 py-0.5 text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
              {count}
            </span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const loggedUser = currentUserId ? users.find(u => u.id === currentUserId) : null;

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-sidebar-foreground" />
          <span className="text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Equipe
          </span>
          {(sidebarMode !== 'none' || filters.departmentId) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearUserSelection();
                setFilter('departmentId', null);
              }}
              className="ml-auto text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent h-7 group-data-[collapsible=icon]:hidden"
            >
              Mostrar todos
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="custom-scrollbar">
        <SidebarMenu>
          {/* Logged user "Você" */}
          {loggedUser && renderUserItem(loggedUser, 'Você', true)}

          {/* Department groups */}
          {usersByDept.map(({ dept, users: deptUsers }) => {
            if (deptUsers.length === 0 && dept.id !== currentUserDeptId) return null;
            if (deptUsers.length === 0) return null;
            const isActiveDept = filters.departmentId === dept.id;

            return (
              <Collapsible key={dept.id} defaultOpen>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        'flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors group/dept',
                        isActiveDept && 'text-sidebar-foreground bg-sidebar-accent/50 rounded-md'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeptClick(dept.id);
                      }}
                    >
                      <div
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ background: `hsl(${dept.color})` }}
                      />
                      <span className="group-data-[collapsible=icon]:hidden truncate">{dept.name}</span>
                      <ChevronDown className="ml-auto h-3.5 w-3.5 shrink-0 transition-transform group-data-[collapsible=icon]:hidden [[data-state=closed]_&]:rotate-[-90deg]" />
                    </button>
                  </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent>
                  {deptUsers.map(user => renderUserItem(user))}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
