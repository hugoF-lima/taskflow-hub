import { useAppContext } from '@/context/AppContext';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { LayoutGrid, List, Grid2x2 } from 'lucide-react';
import { ViewMode } from '@/types';

export function ViewSwitcher() {
  const { viewMode, setViewMode } = useAppContext();

  return (
    <ToggleGroup
      type="single"
      value={viewMode}
      onValueChange={(v) => v && setViewMode(v as ViewMode)}
      className="bg-secondary/50 rounded-lg p-0.5"
    >
      <ToggleGroupItem value="card" aria-label="Card view" className="h-7 w-7 data-[state=on]:bg-card data-[state=on]:shadow-sm">
        <LayoutGrid className="h-3.5 w-3.5" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view" className="h-7 w-7 data-[state=on]:bg-card data-[state=on]:shadow-sm">
        <List className="h-3.5 w-3.5" />
      </ToggleGroupItem>
      <ToggleGroupItem value="eisenhower" aria-label="Eisenhower view" className="h-7 w-7 data-[state=on]:bg-card data-[state=on]:shadow-sm">
        <Grid2x2 className="h-3.5 w-3.5" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
