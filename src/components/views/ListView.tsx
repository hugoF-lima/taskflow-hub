import { useAppContext } from '@/context/AppContext';
import { users, departments, urgencyConfig } from '@/data/mockData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Star, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import { FeedbackModal } from '@/components/FeedbackModal';
import { toast } from '@/hooks/use-toast';

export function ListView() {
  const { filteredTasks, selectedUserId, sidebarMode, toggleTaskCompletion, toggleTaskImportance, getTaskStatus, settings } = useAppContext();
  const [feedbackTaskId, setFeedbackTaskId] = useState<string | null>(null);

  const handleComplete = (taskId: string) => {
    const success = toggleTaskCompletion(taskId);
    if (!success) {
      toast({ title: 'Feedback obrigatório', description: 'Adicione feedback antes de concluir.', variant: 'destructive' });
    }
  };

  return (
    <div className="flex-1 overflow-auto custom-scrollbar p-4">
      <div className="bg-card rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-8"></TableHead>
              <TableHead className="text-xs">Título</TableHead>
              <TableHead className="text-xs">Responsável</TableHead>
              <TableHead className="text-xs">Setor</TableHead>
              <TableHead className="text-xs">Prazo</TableHead>
              <TableHead className="text-xs">Urgência</TableHead>
              <TableHead className="text-xs">Processo</TableHead>
              <TableHead className="text-xs text-center">Feedback</TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map(task => {
              const user = users.find(u => u.id === task.assigneeId);
              const dept = departments.find(d => d.id === user?.departmentId);
              const isHighlighted = sidebarMode === 'highlight' && selectedUserId === task.assigneeId;
              const status = getTaskStatus(task);

              return (
                <TableRow
                  key={task.id}
                  className={cn(
                    'transition-colors',
                    isHighlighted && 'bg-primary/5',
                    task.completed && 'opacity-60',
                    status === 'overdue' && !task.completed && 'bg-urgency-critical24h/5'
                  )}
                >
                  <TableCell>
                    <button onClick={() => handleComplete(task.id)} className="p-0.5">
                      <Check className={cn('h-3.5 w-3.5', task.completed ? 'text-urgency-normal' : 'text-muted-foreground/30')} />
                    </button>
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => toggleTaskImportance(task.id)}>
                        <Star className={cn('h-3 w-3', task.important ? 'fill-urgency-medium text-urgency-medium' : 'text-muted-foreground/30')} />
                      </button>
                      <span className={cn(task.completed && 'line-through')}>{task.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{user?.name}</TableCell>
                  <TableCell>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `hsl(${dept?.color} / 0.1)`, color: `hsl(${dept?.color})` }}>
                      {dept?.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs tabular-nums">{format(new Date(task.deadline), 'dd/MM')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn('text-[10px] h-4 px-1.5',
                      task.urgency === 'normal' && 'border-urgency-normal/30 text-urgency-normal',
                      task.urgency === 'medium' && 'border-urgency-medium/30 text-urgency-medium',
                      task.urgency === 'critical' && 'border-urgency-critical/30 text-urgency-critical',
                      task.urgency === 'critical24h' && 'border-urgency-critical24h/30 text-urgency-critical24h',
                      task.urgency === 'report' && 'border-urgency-report/30 text-urgency-report',
                    )}>
                      {urgencyConfig[task.urgency].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{task.process}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => setFeedbackTaskId(task.id)} className="h-6 px-1.5 text-xs gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {task.feedback.length > 0 && <span className="text-primary font-semibold">{task.feedback.length}</span>}
                    </Button>
                  </TableCell>
                  <TableCell className="text-[10px] text-muted-foreground">{task.code}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {feedbackTaskId && <FeedbackModal taskId={feedbackTaskId} open={!!feedbackTaskId} onOpenChange={() => setFeedbackTaskId(null)} />}
    </div>
  );
}
