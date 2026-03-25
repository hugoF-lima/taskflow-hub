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
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewTaskDialog({ open, onOpenChange }: NewTaskDialogProps) {
  const { addTask } = useAppContext();

  const [assigneeId, setAssigneeId] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [title, setTitle] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('normal');
  const [process, setProcess] = useState('');
  const [observations, setObservations] = useState('');
  const [important, setImportant] = useState(false);

  const resetForm = () => {
    setAssigneeId('');
    setDeadline(undefined);
    setTitle('');
    setUrgency('normal');
    setProcess('');
    setObservations('');
    setImportant(false);
  };

  const handleSubmit = () => {
    if (!assigneeId || !deadline || !title || !process) return;
    addTask({
      title,
      assigneeId,
      deadline: deadline.toISOString(),
      urgency,
      important,
      process,
      observations,
      completed: false,
    });
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Atividade</DialogTitle>
          <DialogDescription>Preencha os campos para criar uma nova atividade.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Responsável */}
          <div className="grid gap-1.5">
            <Label htmlFor="assignee" className="text-xs">Responsável</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {users.map(u => {
                  const dept = departments.find(d => d.id === u.departmentId);
                  return (
                    <SelectItem key={u.id} value={u.id} className="text-xs">
                      {u.name} ({dept?.name})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Data */}
          <div className="grid gap-1.5">
            <Label className="text-xs">Data de Entrega</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn('h-9 justify-start text-left text-xs font-normal', !deadline && 'text-muted-foreground')}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {deadline ? format(deadline, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
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
          </div>

          {/* Assunto */}
          <div className="grid gap-1.5">
            <Label htmlFor="title" className="text-xs">Assunto</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da atividade" className="h-9 text-xs" />
          </div>

          {/* Urgência + Processo side by side */}
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
          <Button size="sm" onClick={handleSubmit} disabled={!assigneeId || !deadline || !title || !process}>
            Criar Atividade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
