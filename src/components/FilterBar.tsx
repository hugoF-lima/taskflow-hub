import { useAppContext } from '@/context/AppContext';
import { departments, allProcesses } from '@/data/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { UrgencyLevel, FeedbackTopic, TaskStatus } from '@/types';

const feedbackTopics: FeedbackTopic[] = ['Organização', 'Comunicação', 'Pro atividade', 'Prioridades', 'ICC', 'KISS', 'Reportar problemas'];
const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'active', label: 'Ativa' },
  { value: 'completed', label: 'Concluída' },
  { value: 'overdue', label: 'Atrasada' },
];
const urgencyOptions: { value: UrgencyLevel; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Média' },
  { value: 'critical', label: 'Crítica' },
  { value: 'critical24h', label: 'Crítica 24h' },
  { value: 'report', label: 'Reportar' },
];

export function FilterBar() {
  const { filters, setFilter, resetFilters } = useAppContext();

  const hasFilters = Object.values(filters).some(v => {
    if (v && typeof v === 'object' && 'from' in v) return v.from || v.to;
    return v !== null;
  });

  return (
    <div className="flex items-center gap-2 flex-wrap px-4 py-2 bg-card/50 border-b">
      <Select value={filters.departmentId ?? '__all'} onValueChange={v => setFilter('departmentId', v === '__all' ? null : v)}>
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue placeholder="Setor" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">Todos os setores</SelectItem>
          {departments.map(d => (
            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.process ?? '__all'} onValueChange={v => setFilter('process', v === '__all' ? null : v)}>
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue placeholder="Processo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">Todos processos</SelectItem>
          {allProcesses.map(p => (
            <SelectItem key={p} value={p}>{p}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.urgency ?? '__all'} onValueChange={v => setFilter('urgency', v === '__all' ? null : (v as UrgencyLevel))}>
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue placeholder="Urgência" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">Todas urgências</SelectItem>
          {urgencyOptions.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.status ?? '__all'} onValueChange={v => setFilter('status', v === '__all' ? null : (v as TaskStatus))}>
        <SelectTrigger className="h-8 w-[120px] text-xs">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">Todos status</SelectItem>
          {statusOptions.map(o => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.feedbackTopic ?? '__all'} onValueChange={v => setFilter('feedbackTopic', v === '__all' ? null : (v as FeedbackTopic))}>
        <SelectTrigger className="h-8 w-[150px] text-xs">
          <SelectValue placeholder="Tópico feedback" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all">Todos tópicos</SelectItem>
          {feedbackTopics.map(t => (
            <SelectItem key={t} value={t}>{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs gap-1 text-muted-foreground">
          <X className="h-3 w-3" /> Limpar
        </Button>
      )}
    </div>
  );
}
