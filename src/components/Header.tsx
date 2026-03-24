import { useAppContext } from '@/context/AppContext';
import { ViewSwitcher } from './ViewSwitcher';
import { SettingsPopover } from './SettingsPopover';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BarChart3, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const { settings, toggleSetting } = useAppContext();

  return (
    <header className="h-14 shrink-0 flex items-center justify-between border-b bg-card px-4 gap-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-muted-foreground" />
        <h1 className="text-base font-bold tracking-tight text-foreground hidden sm:block">
          Gerenciamento de Atividades
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <ViewSwitcher />
        <Button
          variant={settings.managerDashboard ? 'default' : 'outline'}
          size="sm"
          onClick={() => toggleSetting('managerDashboard')}
          className={cn('gap-1.5 h-8', settings.managerDashboard && 'bg-primary text-primary-foreground')}
        >
          <BarChart3 className="h-4 w-4" />
          <span className="hidden md:inline">Dashboard</span>
        </Button>
        <Button size="sm" className="gap-1.5 h-8">
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">Nova Atividade</span>
        </Button>
        <SettingsPopover />
      </div>
    </header>
  );
}
