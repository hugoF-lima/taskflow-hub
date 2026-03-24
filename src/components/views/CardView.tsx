import { useEffect, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { users, departments } from '@/data/mockData';
import { TaskCard } from '@/components/TaskCard';
import { cn } from '@/lib/utils';

export function CardView() {
  const { filteredTasks, selectedUserId, sidebarMode, zoomLevel } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const activeUsers = users.filter(u => filteredTasks.some(t => t.assigneeId === u.id));

  const HORIZONTAL_SCROLL_SPEED = 0.3; // ms for smooth scroll behavior (increase = slower feel)

  const handleCardHoverFocus = (el: HTMLDivElement) => {
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
  };

    // Inside your CardView function
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY * HORIZONTAL_SCROLL_SPEED;
      }
    };

    // { passive: false } is required to allow e.preventDefault()
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    if (sidebarMode === 'highlight' && selectedUserId && columnRefs.current[selectedUserId]) {
      columnRefs.current[selectedUserId]?.scrollIntoView({ 
        behavior: 'smooth', 
        inline: 'center', 
        block: 'nearest' 
      });
    }
  }, [selectedUserId, sidebarMode]);

  return (
    /* Parent: overflow-x-auto allows the board to scroll sideways.
       h-full + min-h-0 ensures it stays within the DashboardContent's boundaries.
    */
    <div 
      ref={containerRef} 
      className="flex-1 min-h-0 w-full overflow-x-auto overflow-y-hidden custom-scrollbar"
    >
      <div
        className="flex gap-4 p-4 min-w-max h-full origin-top-left transition-transform"
        style={{ 
          transform: `scale(${zoomLevel / 100})`, 
          // We use width/height adjustments to ensure the scrollable area 
          // matches the visual size after scaling
          width: `${10000 / zoomLevel}%`, 
          height: `${10000 / zoomLevel}%` 
        }}
      >
        {activeUsers.map(user => {
          const dept = departments.find(d => d.id === user.departmentId);
          const userTasks = filteredTasks.filter(t => t.assigneeId === user.id);
          const isHighlighted = sidebarMode === 'highlight' && selectedUserId === user.id;

          return (
            <div
              key={user.id}
              ref={el => { columnRefs.current[user.id] = el; }}
              className={cn(
                /* shrink-0 is VITAL: stops columns from squishing.
                   max-h-full: keeps the column from growing taller than the board.
                */
                'w-[280px] shrink-0 flex flex-col max-h-full rounded-xl transition-all',
                isHighlighted && 'ring-2 ring-primary shadow-lg'
              )}
            >
              {/* Column header */}
              <div
                className="rounded-t-xl px-3 py-2 flex items-center justify-between shrink-0"
                style={{ background: `hsl(${dept?.color ?? '0 0% 50%'} / 0.1)` }}
              >
                <div>
                  <p className="text-sm font-semibold text-foreground truncate w-[180px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{dept?.name}</p>
                </div>
                <span
                  className="text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shrink-0"
                  style={{ 
                    background: `hsl(${dept?.color ?? '0 0% 50%'} / 0.2)`, 
                    color: `hsl(${dept?.color ?? '0 0% 50%'})` 
                  }}
                >
                  {userTasks.length}
                </span>
              </div>

              {/* Task cards container */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 p-2 bg-muted/30 rounded-b-xl min-h-0">
                {userTasks.map(task => (
                  <TaskCard key={task.id} task={task} onHoverFocus={handleCardHoverFocus}/>
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