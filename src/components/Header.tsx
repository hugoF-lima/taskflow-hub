import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { ViewSwitcher } from './ViewSwitcher';
import { SettingsPopover } from './SettingsPopover';
import { NewTaskDialog } from './NewTaskDialog';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BarChart3, Plus, ChevronDown, ClipboardList, FolderPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const { settings, toggleSetting } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1.5 h-8">
                <Plus className="h-4 w-4" />
                <span className="hidden md:inline">Novo</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setDialogOpen(true)} className="gap-2 text-xs">
                <ClipboardList className="h-4 w-4" />
                Nova Atividade
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDialogOpen(true)} className="gap-2 text-xs">
                <FolderPlus className="h-4 w-4" />
                Novo Processo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <SettingsPopover />
        </div>
      </header>

      <NewTaskDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
