import { users, departments } from '@/data/mockData';
import { useAppContext } from '@/context/AppContext';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
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
  const { selectedUserId, sidebarMode, handleUserClick, handleUserDoubleClick, clearUserSelection, filteredTasks } = useAppContext();

  const taskCountByUser = filteredTasks.reduce((acc, t) => {
    t.assigneeIds.forEach(uid => { acc[uid] = (acc[uid] || 0) + 1; });
    return acc;
  }, {} as Record<string, number>);

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-sidebar-foreground" />
          <span className="text-sm font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Equipe
          </span>
        </div>
        {sidebarMode !== 'none' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearUserSelection}
            className="text-xs text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent h-7 group-data-[collapsible=icon]:hidden"
          >
            Mostrar todos
          </Button>
        )}
      </SidebarHeader>
      <SidebarContent className="custom-scrollbar">
        <SidebarMenu>
          {users.map(user => {
            const dept = departments.find(d => d.id === user.departmentId);
            const isSelected = selectedUserId === user.id;
            const count = taskCountByUser[user.id] || 0;

            return (
              <SidebarMenuItem key={user.id}>
                <SidebarMenuButton
                  isActive={isSelected}
                  onClick={() => handleUserClick(user.id)}
                  onDoubleClick={(e) => {
                    e.preventDefault();
                    handleUserDoubleClick(user.id);
                  }}
                  tooltip={user.name}
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
                    {/* Department accent border */}
                    <div
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] w-5 rounded-full"
                      style={{ background: `hsl(${getDeptColor(user.departmentId)})` }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-sm font-medium">{user.name}</span>
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
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
