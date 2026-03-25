import { Task, UrgencyLevel } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { users, departments, urgencyConfig } from '@/data/mockData';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { MessageSquare, Star, Check, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { FeedbackModal } from './FeedbackModal';
import { toast } from '@/hooks/use-toast';

function getUrgencyClasses(urgency: UrgencyLevel) {
  const map: Record<UrgencyLevel, string> = {
    normal: 'bg-urgency-normal/15 text-urgency-normal border-urgency-normal/30',
    medium: 'bg-urgency-medium/15 text-urgency-medium border-urgency-medium/30',
    critical: 'bg-urgency-critical/15 text-urgency-critical border-urgency-critical/30',
    critical24h: 'bg-urgency-critical24h/15 text-urgency-critical24h border-urgency-critical24h/30',
    report: 'bg-urgency-report/15 text-urgency-report border-urgency-report/30',
  };
  return map[urgency];
}

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

export function TaskCard({ task, compact }: TaskCardProps) {
  const { toggleTaskCompletion, toggleTaskImportance, getTaskStatus, settings } = useAppContext();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const user = users.find(u => u.id === task.assigneeId);
  const dept = departments.find(d => d.id === user?.departmentId);
  const status = getTaskStatus(task);
  const lastFeedback = task.feedback.length > 0 ? task.feedback[task.feedback.length - 1] : null;

  const handleComplete = () => {
    const success = toggleTaskCompletion(task.id);
    if (!success) {
      toast({
        title: 'Feedback obrigatório',
        description: 'Adicione pelo menos um feedback antes de concluir esta tarefa.',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <TooltipProvider delayDuration={300}>
        <Card
          className={cn(
            'p-3 cursor-pointer transition-all hover:shadow-md border',
            task.completed && 'opacity-60',
            status === 'overdue' && !task.completed && 'border-urgency-critical24h/40',
          )}
        >
          {/* Urgency badge + important */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 h-5 border', getUrgencyClasses(task.urgency))}>
              {urgencyConfig[task.urgency].label}
            </Badge>
            <div className="flex items-center gap-1">
              <button onClick={(e) => { e.stopPropagation(); toggleTaskImportance(task.id); }} className="p-0.5">
                <Star className={cn('h-3.5 w-3.5', task.important ? 'fill-urgency-medium text-urgency-medium' : 'text-muted-foreground/40')} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleComplete(); }} className="p-0.5">
                <Check className={cn('h-3.5 w-3.5', task.completed ? 'text-urgency-normal' : 'text-muted-foreground/40')} />
              </button>
            </div>
          </div>

          {/* Title with description tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <h3 className={cn('text-sm font-medium leading-snug mb-2 cursor-default', task.completed && 'line-through')}>
                {task.title}
              </h3>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[240px] text-xs">
              <p className="font-semibold mb-0.5">Descrição</p>
              <p className="text-muted-foreground">
                {task.observations || 'Sem descrição'}
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Meta row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(task.deadline), 'dd/MM')}</span>
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {task.process}
            </Badge>
          </div>

          {/* Feedback row */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t">
            <span className="text-[10px] text-muted-foreground">{task.code}</span>
            <HoverCard openDelay={300}>
              <HoverCardTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); setFeedbackOpen(true); }}
                  className="h-6 px-2 text-xs gap-1 text-muted-foreground hover:text-primary"
                >
                  <MessageSquare className="h-3 w-3" />
                  {task.feedback.length > 0 && (
                    <span className="bg-primary/10 text-primary rounded-full px-1.5 text-[10px] font-semibold">
                      {task.feedback.length}
                    </span>
                  )}
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-56 text-xs" side="top">
                <p className="font-semibold mb-1">Último feedback</p>
                {lastFeedback ? (
                  <div className="space-y-1">
                    <p><span className="text-muted-foreground">Tópico:</span> {lastFeedback.topic}</p>
                    <p><span className="text-muted-foreground">Tipo:</span> {lastFeedback.type}</p>
                    {lastFeedback.comment && <p className="text-muted-foreground line-clamp-2">{lastFeedback.comment}</p>}
                    <p className="text-muted-foreground">{formatDistanceToNow(new Date(lastFeedback.createdAt), { addSuffix: true, locale: ptBR })}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Sem feedback ainda</p>
                )}
              </HoverCardContent>
            </HoverCard>
          </div>
        </Card>
      </TooltipProvider>
      <FeedbackModal taskId={task.id} open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  );
}
