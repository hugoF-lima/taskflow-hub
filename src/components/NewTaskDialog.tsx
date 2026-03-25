import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewTaskDialog({ open, onOpenChange }: NewTaskDialogProps) {
  const { addTask } = useAppContext();

  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [deadlineTime, setDeadlineTime] = useState('18:00');
  const [noDeadline, setNoDeadline] = useState(false);
  const [title, setTitle] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');
  const [process, setProcess] = useState('');
  const [observations, setObservations] = useState('');
  const [important, setImportant] = useState(false);

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

  const handleSubmit = (keepOpen: boolean) => {
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
    });
    resetForm();
    if (!keepOpen) onOpenChange(false);
  };

  const toggleAssignee = (userId: string) => {
    setAssigneeIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const selectedNames = assigneeIds
    .map(id => users.find(u => u.id === id)?.name?.split(' ')[0])
    .filter(Boolean)
    .join(', ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Atividade</DialogTitle>
          <DialogDescription>Preencha os campos para criar uma nova atividade.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Responsáveis (multi-select) */}
          <div className="grid gap-1.5">
            <Label className="text-xs">Responsáveis</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-9 justify-start text-left text-xs font-normal">
                  {assigneeIds.length > 0 ? selectedNames : <span className="text-muted-foreground">Selecione...</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2 max-h-60 overflow-y-auto" align="start">
                {users.map(u => {
                  const dept = departments.find(d => d.id === u.departmentId);
                  return (
                    <label key={u.id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent cursor-pointer text-xs">
                      <Checkbox
                        checked={assigneeIds.includes(u.id)}
                        onCheckedChange={() => toggleAssignee(u.id)}
                      />
                      <span>{u.name}</span>
                      <span className="text-muted-foreground ml-auto text-[10px]">{dept?.name}</span>
                    </label>
                  );
                })}
              </PopoverContent>
            </Popover>
          </div>

          {/* Data + Hora */}
          <div className="grid gap-1.5">
            <Label className="text-xs">Data e Hora de Entrega</Label>
            <div className="flex items-center gap-2">
              <Popover>
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
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                value={deadlineTime}
                onChange={e => setDeadlineTime(e.target.value)}
                disabled={noDeadline}
                className="h-9 w-24 text-xs"
              />
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

          {/* Descrição */}
          <div className="grid gap-1.5">
            <Label htmlFor="obs" className="text-xs">Descrição / Observações</Label>
            <Textarea id="obs" value={observations} onChange={e => setObservations(e.target.value)} placeholder="Detalhes adicionais..." className="text-xs min-h-[60px]" />
          </div>

          {/* Importante */}
          <div className="flex items-center gap-2">
            <Checkbox id="important" checked={important} onCheckedChange={c => setImportant(c === true)} />
            <Label htmlFor="important" className="text-xs cursor-pointer">Marcar como importante</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <div className="flex items-center">
            <Button size="sm" onClick={() => handleSubmit(false)} disabled={!canSubmit} className="rounded-r-none">
              Criar Atividade
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" disabled={!canSubmit} className="rounded-l-none border-l border-l-primary-foreground/30 px-1.5">
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSubmit(true)} className="text-xs">
                  Criar Atividade + Nova
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
