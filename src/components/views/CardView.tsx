import { useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '@/context/AppContext';
import { users, departments } from '@/data/mockData';
import { TaskCard } from '@/components/TaskCard';
import { cn } from '@/lib/utils';

export function CardView() {
  const { filteredTasks, selectedUserId, sidebarMode, zoomLevel } = useAppContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const columnScrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Dwell tracking: only enable vertical scroll after mouse stays in column for DWELL_MS
  const DWELL_MS = 150;
  const HORIZONTAL_SCROLL_SPEED = 1.5;
  const dwellingColumnId = useRef<string | null>(null);
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDwelling = useRef(false);

  const activeUsers = users.filter(u => filteredTasks.some(t => t.assigneeId === u.id));

  const handleColumnEnter = useCallback((userId: string) => {
    dwellingColumnId.current = userId;
    isDwelling.current = false;
    if (dwellTimer.current) clearTimeout(dwellTimer.current);
    dwellTimer.current = setTimeout(() => {
      if (dwellingColumnId.current === userId) {
        isDwelling.current = true;
      }
    }, DWELL_MS);
  }, []);

  const handleColumnLeave = useCallback(() => {
    dwellingColumnId.current = null;
    isDwelling.current = false;
    if (dwellTimer.current) clearTimeout(dwellTimer.current);
  }, []);

  // Single wheel handler on the outer container (capture phase)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const activeColId = dwellingColumnId.current;
      const colEl = activeColId ? columnScrollRefs.current[activeColId] : null;

      // If dwelling in a column and it has scroll room, let vertical scroll happen
      if (isDwelling.current && colEl) {
        const { scrollTop, scrollHeight, clientHeight } = colEl;
        const atTop = scrollTop <= 0;
        const atBottom = Math.abs(scrollTop + clientHeight - scrollHeight) < 1;
        const scrollingUp = e.deltaY < 0;
        const scrollingDown = e.deltaY > 0;

        if ((scrollingDown && !atBottom) || (scrollingUp && !atTop)) {
          // Column has room — let browser handle vertically
          return;
        }
      }

      // Otherwise redirect to horizontal scroll
      e.preventDefault();
      container.scrollLeft += e.deltaY * HORIZONTAL_SCROLL_SPEED;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Scroll to highlighted user column
  useEffect(() => {
    if (sidebarMode === 'highlight' && selectedUserId && columnRefs.current[selectedUserId]) {
      columnRefs.current[selectedUserId]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [selectedUserId, sidebarMode]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 w-full overflow-x-auto overflow-y-hidden custom-scrollbar"
    >
      <div
        className="flex gap-4 p-4 min-w-max h-full origin-top-left transition-transform"
        style={{
          transform: `scale(${zoomLevel / 100})`,
          width: `${10000 / zoomLevel}%`,
          height: `${10000 / zoomLevel}%`,
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
                    color: `hsl(${dept?.color ?? '0 0% 50%'})`,
                  }}
                >
                  {userTasks.length}
                </span>
              </div>

              {/* Task cards container */}
              <div
                ref={el => { columnScrollRefs.current[user.id] = el; }}
                onMouseEnter={() => handleColumnEnter(user.id)}
                onMouseLeave={handleColumnLeave}
                className="flex-1 overflow-y-auto custom-scrollbar space-y-2 p-2 bg-muted/30 rounded-b-xl min-h-0"
              >
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
