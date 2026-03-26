import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { users, departments, allProcesses, urgencyConfig } from '@/data/mockData';
import { Task, UrgencyLevel, FeedbackTopic, FeedbackType } from '@/types';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarIcon, MoreVertical, Pencil, Trash2, Send, MessageSquare, X, Check, Clock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const topics: FeedbackTopic[] = ['Organização', 'Comunicação', 'Pro atividade', 'Prioridades', 'ICC', 'KISS', 'Reportar problemas'];
const types: FeedbackType[] = ['precisa mais atenção', 'precisa um pouco mais de atenção', 'mandou bem!', 'cooperação'];

interface TaskDetailDialogProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailDialog({ taskId, open, onOpenChange }: TaskDetailDialogProps) {
  const { tasks, addFeedback, updateTask, deleteTask } = useAppContext();
  const task = tasks.find(t => t.id === taskId);

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [title, setTitle] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [deadlineTime, setDeadlineTime] = useState('18:00');
  const [noDeadline, setNoDeadline] = useState(false);
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');
  const [process, setProcess] = useState('');
  const [observations, setObservations] = useState('');
  const [important, setImportant] = useState(false);

  const [fbTopic, setFbTopic] = useState<FeedbackTopic | ''>('');
  const [fbType, setFbType] = useState<FeedbackType | ''>('');
  const [fbComment, setFbComment] = useState('');
  const [fbAnonymous, setFbAnonymous] = useState(true);

  useEffect(() => {
    if (task && open) {
      setTitle(task.title);
      setAssigneeIds([...task.assigneeIds]);
      const hasDeadline = !!task.deadline;
      setNoDeadline(!hasDeadline);
      if (hasDeadline) {
        const d = new Date(task.deadline);
        setDeadline(d);
        setDeadlineTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
      } else {
        setDeadline(undefined);
        setDeadlineTime('18:00');
      }
      setUrgency(task.urgency);
      setProcess(task.process);
      setObservations(task.observations || '');
      setImportant(task.important);
      setEditing(false);
    }
  }, [task, open]);

  if (!task) return null;

  const taskUsers = task.assigneeIds.map(id => users.find(u => u.id === id)).filter(Boolean);
  const firstUser = taskUsers[0];
  const dept = departments.find(d => d.id === firstUser?.departmentId);

  const buildDeadline = (): string => {
    if (noDeadline) return '';
    if (!deadline) return task.deadline;
    const [h, m] = deadlineTime.split(':').map(Number);
    const d = new Date(deadline);
    d.setHours(h || 18, m || 0, 0, 0);
    return d.toISOString();
  };

  const toggleAssignee = (userId: string) => {
    setAssigneeIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSave = () => {
    updateTask(task.id, {
      title,
      assigneeIds,
      deadline: buildDeadline(),
      urgency,
      process,
      observations,
      important,
    });
    setEditing(false);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setConfirmDelete(false);
    onOpenChange(false);
  };

  const handleFeedbackSubmit = () => {
    if (!fbTopic || !fbType) return;
    addFeedback(taskId, { topic: fbTopic, type: fbType, comment: fbComment || undefined, anonymous: fbAnonymous, authorId: fbAnonymous ? undefined : 'u1' });
    setFbTopic('');
    setFbType('');
    setFbComment('');
  };

  const selectedNames = assigneeIds
    .map(id => users.find(u => u.id === id)?.name?.split(' ')[0])
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 pt-5 pb-3">
            <div className="flex items-center justify-between gap-2 mr-8">
              <DialogTitle className="text-base leading-snug flex-1">
                {editing ? 'Editar Atividade' : task.title}
              </DialogTitle>
              {!editing && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditing(true)}>
                      <Pencil className="h-3.5 w-3.5 mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setConfirmDelete(true)} className="text-destructive focus:text-destructive">
                      <Trash2 className="h-3.5 w-3.5 mr-2" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <DialogDescription className="text-xs">
              {task.code} · {taskUsers.map(u => u!.name).join(', ')} · {dept?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-6 pb-6 space-y-5">

              {editing ? (
                <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium">Assunto</Label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} className="h-8 text-xs" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium">Responsáveis</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="h-8 justify-start text-left text-xs font-normal">
                          {assigneeIds.length > 0 ? selectedNames : <span className="text-muted-foreground">Selecione...</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-64 p-2 max-h-60 overflow-y-auto" 
                        align="start"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        {users.map(u => {
                          const d = departments.find(dp => dp.id === u.departmentId);
                          return (
                            <label key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer text-xs">
                              <Checkbox checked={assigneeIds.includes(u.id)} onCheckedChange={() => toggleAssignee(u.id)} />
                              <span>{u.name}</span>
                              <span className="text-muted-foreground ml-auto text-[10px]">{d?.name}</span>
                            </label>
                          );
                        })}
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium">Data e Hora de Entrega</Label>
                    <div className="flex items-center gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={noDeadline}
                            className={cn('h-8 flex-1 justify-start text-left text-xs font-normal', !deadline && !noDeadline && 'text-muted-foreground')}
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                            {noDeadline ? 'Sem data' : deadline ? format(deadline, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-auto p-0" 
                          align="start"
                          onWheel={(e) => e.stopPropagation()}
                        >
                          <Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={noDeadline}
                            className={cn(
                              "h-8 w-24 flex items-center gap-2 text-xs font-normal",
                              !deadlineTime && "text-muted-foreground"
                            )}
                          >
                            <Clock className="h-3 w-3" />
                            {deadlineTime}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-[120px] p-0" 
                          align="start"
                          onWheel={(e) => e.stopPropagation()}
                        >
                          <div className="flex h-[180px] divide-x">
                            <ScrollArea className="flex-1">
                              <div className="flex flex-col p-1">
                                {Array.from({ length: 24 }).map((_, i) => {
                                  const h = i.toString().padStart(2, '0');
                                  return (
                                    <Button
                                      key={h}
                                      variant="ghost"
                                      className={cn(
                                        "h-7 w-full text-[10px] px-2",
                                        deadlineTime.startsWith(h) && "bg-accent font-bold"
                                      )}
                                      onClick={() => {
                                        const [_, m] = deadlineTime.split(':');
                                        setDeadlineTime(`${h}:${m}`);
                                      }}
                                    >
                                      {h}
                                    </Button>
                                  );
                                })}
                              </div>
                            </ScrollArea>
                            <ScrollArea className="flex-1">
                              <div className="flex flex-col p-1">
                                {Array.from({ length: 60 }).map((_, i) => {
                                  const m = i.toString().padStart(2, '0');
                                  return (
                                    <Button
                                      key={m}
                                      variant="ghost"
                                      className={cn(
                                        "h-7 w-full text-[10px] px-2",
                                        deadlineTime.endsWith(m) && "bg-accent font-bold"
                                      )}
                                      onClick={() => {
                                        const [h, _] = deadlineTime.split(':');
                                        setDeadlineTime(`${h}:${m}`);
                                      }}
                                    >
                                      {m}
                                    </Button>
                                  );
                                })}
                              </div>
                            </ScrollArea>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <div className="flex items-center gap-1.5">
                        <Checkbox id="noDeadlineEdit" checked={noDeadline} onCheckedChange={c => { setNoDeadline(c === true); if (c) setDeadline(undefined); }} />
                        <Label htmlFor="noDeadlineEdit" className="text-xs cursor-pointer whitespace-nowrap">Sem data</Label>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="grid gap-1.5">
                      <Label className="text-xs font-medium">Urgência</Label>
                      <Select value={urgency} onValueChange={v => setUrgency(v as UrgencyLevel)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(Object.entries(urgencyConfig) as [UrgencyLevel, { label: string; color: string }][]).map(([key, cfg]) => (
                            <SelectItem key={key} value={key} className="text-xs">
                              <span className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full shrink-0" style={{ background: `hsl(${cfg.color})` }} />
                                {cfg.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs font-medium">Processo</Label>
                      <Select value={process} onValueChange={setProcess}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {allProcesses.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium">Descrição / Observações</Label>
                    <Textarea value={observations} onChange={e => setObservations(e.target.value)} className="text-xs min-h-[50px] resize-none" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="importantEdit" checked={important} onCheckedChange={c => setImportant(c === true)} />
                    <Label htmlFor="importantEdit" className="text-xs cursor-pointer">Importante</Label>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setEditing(false)}>
                      <X className="h-3 w-3 mr-1" /> Cancelar
                    </Button>
                    <Button size="sm" className="h-7 text-xs" onClick={handleSave}>
                      <Check className="h-3 w-3 mr-1" /> Salvar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div><span className="text-muted-foreground">Urgência:</span> <Badge variant="outline" className="text-[10px] ml-1">{urgencyConfig[task.urgency].label}</Badge></div>
                    <div><span className="text-muted-foreground">Processo:</span> <span className="ml-1 font-medium">{task.process}</span></div>
                    <div><span className="text-muted-foreground">Prazo:</span> <span className="ml-1">{task.deadline ? format(new Date(task.deadline), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 'Sem data'}</span></div>
                    <div><span className="text-muted-foreground">Importante:</span> <span className="ml-1">{task.important ? 'Sim' : 'Não'}</span></div>
                    <div><span className="text-muted-foreground">Status:</span> <span className="ml-1">{task.completed ? 'Concluída' : 'Ativa'}</span></div>
                    <div><span className="text-muted-foreground">Responsáveis:</span> <span className="ml-1">{taskUsers.map(u => u!.name).join(', ')}</span></div>
                  </div>
                  {task.observations && (
                    <div className="pt-2 border-t border-border/50">
                      <span className="text-muted-foreground">Observações:</span>
                      <p className="mt-1 text-foreground leading-relaxed">{task.observations}</p>
                    </div>
                  )}
                </div>
              )}

              <Separator />

              {/* Feedback History */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Feedback ({task.feedback.length})
                </p>
                {task.feedback.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6 bg-muted/20 rounded-lg">Nenhum feedback registrado</p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {[...task.feedback].reverse().map(fb => (
                      <div key={fb.id} className="rounded-lg border-l-2 border-l-primary/40 bg-muted/40 p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-[10px] h-5 font-medium">{fb.topic}</Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(fb.createdAt), "dd/MM/yy", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-xs font-medium">{fb.type}</p>
                        {fb.comment && <p className="text-[11px] text-muted-foreground leading-relaxed">{fb.comment}</p>}
                        <p className="text-[10px] text-muted-foreground/60">{fb.anonymous ? 'Anônimo' : 'Identificado'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Add feedback form */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-primary flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Adicionar Feedback
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label className="text-xs text-muted-foreground">Tópico</Label>
                    <Select value={fbTopic} onValueChange={v => setFbTopic(v as FeedbackTopic)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                      <SelectContent>
                        {topics.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs text-muted-foreground">Tipo</Label>
                    <Select value={fbType} onValueChange={v => setFbType(v as FeedbackType)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                      <SelectContent>
                        {types.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">Comentário (opcional)</Label>
                  <Textarea
                    value={fbComment}
                    onChange={e => setFbComment(e.target.value)}
                    maxLength={450}
                    className="text-xs resize-none h-16"
                    placeholder="Observações sobre o feedback..."
                  />
                  <p className="text-[10px] text-muted-foreground text-right">{fbComment.length}/450</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch id="anonDetail" checked={fbAnonymous} onCheckedChange={setFbAnonymous} />
                    <Label htmlFor="anonDetail" className="text-xs">Anônimo</Label>
                  </div>
                  <Button size="sm" onClick={handleFeedbackSubmit} disabled={!fbTopic || !fbType} className="gap-1.5 h-8 text-xs px-4">
                    <Send className="h-3 w-3" /> Incluir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir atividade?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{task.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
