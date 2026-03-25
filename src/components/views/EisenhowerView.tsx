import { useAppContext } from '@/context/AppContext';
import { TaskCard } from '@/components/TaskCard';
import { cn } from '@/lib/utils';
import { Task } from '@/types';

function isUrgent(task: Task): boolean {
  return task.urgency === 'critical' || task.urgency === 'critical24h';
}

const quadrants = [
  { key: 'ui', label: 'Urgente + Importante', desc: 'Fazer agora', bg: 'hsla(0, 70%, 50%, 0.06)', border: 'hsla(0, 70%, 50%, 0.15)', filter: (t: Task) => isUrgent(t) && t.important },
  { key: 'ni', label: 'Importante + Não Urgente', desc: 'Agendar', bg: 'hsla(210, 60%, 50%, 0.06)', border: 'hsla(210, 60%, 50%, 0.15)', filter: (t: Task) => !isUrgent(t) && t.important },
  { key: 'un', label: 'Urgente + Não Importante', desc: 'Delegar', bg: 'hsla(40, 80%, 50%, 0.06)', border: 'hsla(40, 80%, 50%, 0.15)', filter: (t: Task) => isUrgent(t) && !t.important },
  { key: 'nn', label: 'Nem Urgente + Nem Importante', desc: 'Eliminar', bg: 'hsla(0, 0%, 50%, 0.05)', border: 'hsla(0, 0%, 50%, 0.12)', filter: (t: Task) => !isUrgent(t) && !t.important },
] as const;

export function EisenhowerView() {
  const { filteredTasks, selectedUserId, sidebarMode, zoomLevel } = useAppContext();

  return (
    <div className="flex-1 overflow-auto custom-scrollbar p-4">
      <div
        className="grid grid-cols-2 grid-rows-2 gap-3 origin-top-left transition-transform"
        style={{
          height: `calc((100vh - 10rem) * ${10000 / zoomLevel / 100})`,
          transform: `scale(${zoomLevel / 100})`,
          width: `${10000 / zoomLevel}%`,
        }}
      >
        {quadrants.map(q => {
          const tasks = filteredTasks.filter(q.filter);
          return (
            <div
              key={q.key}
              className="rounded-xl p-3 flex flex-col overflow-hidden"
              style={{
                background: q.bg,
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: q.border,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xs font-semibold text-foreground">{q.label}</h3>
                  <p className="text-[10px] text-muted-foreground">{q.desc}</p>
                </div>
                <span className="text-xs font-bold tabular-nums text-muted-foreground">{tasks.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                {tasks.map(task => {
                  const isHighlighted = sidebarMode === 'highlight' && selectedUserId === task.assigneeId;
                  return (
                    <div key={task.id} className={cn(isHighlighted && 'ring-1 ring-primary rounded-lg')}>
                      <TaskCard task={task} compact />
                    </div>
                  );
                })}
                {tasks.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">Nenhuma tarefa</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
