import { useAppContext } from '@/context/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutGrid, List, Grid2x2 } from 'lucide-react';
import { ViewMode } from '@/types';

const views: { value: ViewMode; label: string; icon: React.ReactNode }[] = [
  { value: 'card', label: 'Card View', icon: <LayoutGrid className="h-3.5 w-3.5" /> },
  { value: 'list', label: 'List View', icon: <List className="h-3.5 w-3.5" /> },
  { value: 'eisenhower', label: 'Eisenhower', icon: <Grid2x2 className="h-3.5 w-3.5" /> },
];

export function ViewSwitcher() {
  const { viewMode, setViewMode } = useAppContext();
  const current = views.find(v => v.value === viewMode)!;

  return (
    <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
      <SelectTrigger className="h-8 w-[150px] text-xs gap-1.5 bg-secondary/50 border-none">
        <div className="flex items-center gap-1.5">
          {current.icon}
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {views.map(v => (
          <SelectItem key={v.value} value={v.value} className="text-xs">
            <div className="flex items-center gap-2">
              {v.icon}
              {v.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
