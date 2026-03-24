import { useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { users, departments } from '@/data/mockData';
import { TaskCard } from '@/components/TaskCard';
import { cn } from '@/lib/utils';

export function CardView() {
  const { filteredTasks, selectedUserId, sidebarMode } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Get users that have tasks
  const activeUsers = users.filter(u => filteredTasks.some(t => t.assigneeId === u.id));

  // Scroll to highlighted user column
  useEffect(() => {
    if (sidebarMode === 'highlight' && selectedUserId && columnRefs.current[selectedUserId]) {
      columnRefs.current[selectedUserId]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [selectedUserId, sidebarMode]);

  return (
    <div ref={containerRef} className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar">
      <div className="flex gap-4 p-4 h-full min-w-max">
        {activeUsers.map(user => {
          const dept = departments.find(d => d.id === user.departmentId);
          const userTasks = filteredTasks.filter(t => t.assigneeId === user.id);
          const isHighlighted = sidebarMode === 'highlight' && selectedUserId === user.id;

          return (
            <div
              key={user.id}
              ref={el => { columnRefs.current[user.id] = el; }}
              className={cn(
                'w-[280px] shrink-0 flex flex-col rounded-xl transition-all',
                isHighlighted && 'ring-2 ring-primary shadow-lg'
              )}
            >
              {/* Column header */}
              <div
                className="rounded-t-xl px-3 py-2 flex items-center justify-between"
                style={{ background: `hsl(${dept?.color ?? '0 0% 50%'} / 0.1)` }}
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground">{dept?.name}</p>
                </div>
                <span
                  className="text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  style={{ background: `hsl(${dept?.color ?? '0 0% 50%'} / 0.2)`, color: `hsl(${dept?.color ?? '0 0% 50%'})` }}
                >
                  {userTasks.length}
                </span>
              </div>

              {/* Task cards */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 p-2 bg-muted/30 rounded-b-xl">
                {userTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
                {userTasks.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">Nenhuma tarefa</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
