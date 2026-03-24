import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';
import { Label } from '@/components/ui/label';

export function SettingsPopover() {
  const { settings, toggleSetting } = useAppContext();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72" align="end">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground">Configurações</h4>

          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="text-sm">Modo escuro</Label>
            <Switch id="dark-mode" checked={settings.darkMode} onCheckedChange={() => toggleSetting('darkMode')} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="fb-required" className="text-sm">Feedback obrigatório</Label>
              <p className="text-xs text-muted-foreground">Exigir antes de concluir tarefa</p>
            </div>
            <Switch id="fb-required" checked={settings.feedbackRequired} onCheckedChange={() => toggleSetting('feedbackRequired')} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
