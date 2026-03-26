import { useState, useRef } from 'react';
import { useAppContext } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { users, departments, allProcesses, urgencyConfig } from '@/data/mockData';
import { UrgencyLevel } from '@/types';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { CalendarIcon, ChevronDown, Paperclip, X, Clock } from 'lucide-react';
import { format, startOfToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface Attachment {
  name: string;
  type: string;
  size: number;
  file: File;
}

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewTaskDialog({ open, onOpenChange }: NewTaskDialogProps) {
  const { addTask } = useAppContext();
  const { currentUser } = useAuth();
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [deadlineTime, setDeadlineTime] = useState('18:00');
  const [noDeadline, setNoDeadline] = useState(false);
  const [title, setTitle] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');
  const [process, setProcess] = useState('');
  const [observations, setObservations] = useState('');
  const [important, setImportant] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [createAndNewMode, setCreateAndNewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setAssigneeIds([]);
    setDeadline(undefined);
    setDeadlineTime('18:00');
    setNoDeadline(false);
    setTitle('');
    setUrgency('normal');
    setProcess('');
    setObservations('');
    setImportant(false);
    setAttachments([]);
  };

  const buildDeadline = (): string => {
    if (noDeadline) return '';
    if (!deadline) return '';
    const [h, m] = deadlineTime.split(':').map(Number);
    const d = new Date(deadline);
    d.setHours(h || 18, m || 0, 0, 0);
    return d.toISOString();
  };

  const canSubmit = assigneeIds.length > 0 && (deadline || noDeadline) && title && process;

  const handleSubmit = () => {
    if (!canSubmit) return;
    addTask({
      title,
      assigneeIds,
      deadline: buildDeadline(),
      urgency,
      important,
      process,
      observations,
      completed: false,
      createdBy: currentUser?.id || 'u1',
    });
    toast.success('Atividade criada com sucesso!');

    if (createAndNewMode) {
      resetForm();
      setCreateAndNewMode(false);
    } else {
      resetForm();
      onOpenChange(false);
    }
  };

  const toggleAssignee = (userId: string) => {
    setAssigneeIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Show first + last name (first two words)
  const getDisplayName = (fullName: string) => {
    const parts = fullName.split(' ');
    return parts.length >= 2 ? `${parts[0]} ${parts[1]}` : parts[0];
  };

  const selectedNames = assigneeIds
    .map(id => {
      const u = users.find(u => u.id === id);
      return u ? getDisplayName(u.name) : null;
    })
    .filter(Boolean)
    .join(', ');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAttachments: Attachment[] = Array.from(files).map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
      file: f,
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const today = startOfToday();

  const buttonLabel = createAndNewMode ? 'Criar Atividade + Nova' : 'Criar Atividade';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Atividade</DialogTitle>
          <DialogDescription>Preencha os campos para criar uma nova atividade.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Responsáveis (multi-select with scroll) */}
          <div className="grid gap-1.5">
            <Label className="text-xs">Responsáveis</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 justify-start text-left text-xs font-normal truncate">
                  {assigneeIds.length > 0 ? selectedNames : <span className="text-muted-foreground">Selecione...</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-64 p-0" 
                align="start"
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="overflow-y-auto max-h-60 p-2">
                  {users.map(u => {
                    const dept = departments.find(d => d.id === u.departmentId);
                    return (
                      <label key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer text-xs">
                        <Checkbox
                          checked={assigneeIds.includes(u.id)}
                          onCheckedChange={() => toggleAssignee(u.id)}
                        />
                        <span>{getDisplayName(u.name)}</span>
                        <span className="text-muted-foreground ml-auto text-[10px]">{dept?.name}</span>
                      </label>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Data + Hora (24h) */}
          <div className="grid gap-1.5">
            <Label className="text-xs">Data e Hora de Entrega</Label>
            <div className="flex items-center gap-2">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={noDeadline}
                    className={cn('h-9 flex-1 justify-start text-left text-xs font-normal', !deadline && !noDeadline && 'text-muted-foreground')}
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
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={(day) => {
                      setDeadline(day);
                      setCalendarOpen(false);
                    }}
                    defaultMonth={today}
                    disabled={(date) => date < today}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={noDeadline}
                    className={cn(
                      "h-9 w-24 flex items-center gap-2 text-xs font-normal",
                      !deadlineTime && "text-muted-foreground"
                    )}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {deadlineTime}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-[120px] p-0" 
                  align="start"
                  onWheel={(e) => e.stopPropagation()}
                >
                  <div className="flex h-[200px] divide-x">
                    <ScrollArea className="flex-1">
                      <div className="flex flex-col p-1">
                        {Array.from({ length: 24 }).map((_, i) => {
                          const h = i.toString().padStart(2, '0');
                          return (
                            <Button
                              key={h}
                              variant="ghost"
                              className={cn(
                                "h-8 w-full text-[10px] px-2",
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
                                "h-8 w-full text-[10px] px-2",
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
                <Checkbox id="noDeadline" checked={noDeadline} onCheckedChange={c => { setNoDeadline(c === true); if (c) setDeadline(undefined); }} />
                <Label htmlFor="noDeadline" className="text-xs cursor-pointer whitespace-nowrap">Sem data</Label>
              </div>
            </div>
          </div>

          {/* Assunto */}
          <div className="grid gap-1.5">
            <Label htmlFor="title" className="text-xs">Assunto</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da atividade" className="h-9 text-xs" />
          </div>

          {/* Urgência + Processo */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs">Urgência</Label>
              <Select value={urgency} onValueChange={v => setUrgency(v as UrgencyLevel)}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
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
              <Label className="text-xs">Processo</Label>
              <Select value={process} onValueChange={setProcess}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {allProcesses.map(p => (
                    <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição + Anexos */}
          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="obs" className="text-xs">Descrição / Observações</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs gap-1 text-muted-foreground"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-3 w-3" />
                Anexar
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <Textarea id="obs" value={observations} onChange={e => setObservations(e.target.value)} placeholder="Detalhes adicionais..." className="text-xs min-h-[60px]" />
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {attachments.map((att, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground">
                    <Paperclip className="h-2.5 w-2.5" />
                    {att.name.length > 20 ? att.name.slice(0, 17) + '...' : att.name}
                    <button type="button" onClick={() => removeAttachment(i)} className="ml-0.5 hover:text-foreground">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Importante */}
          <div className="flex items-center gap-2">
            <Checkbox id="important" checked={important} onCheckedChange={c => setImportant(c === true)} />
            <Label htmlFor="important" className="text-xs cursor-pointer">Marcar como importante</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <div className="flex items-center gap-0">
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="rounded-r-none"
            >
              {buttonLabel}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="default"
                  className="rounded-l-none border-l border-l-primary-foreground/30 px-1.5"
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[100px]">
                <DropdownMenuItem
                  className="text-xs cursor-pointer"
                  onClick={() => setCreateAndNewMode(prev => !prev)}
                >
                  {createAndNewMode ? 'Criar apenas' : '+ Nova'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
