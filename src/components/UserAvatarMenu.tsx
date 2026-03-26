import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAppContext } from '@/context/AppContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { LogOut, Moon, Users } from 'lucide-react';
import { departments } from '@/data/mockData';
import { ManageAccessDialog } from '@/components/ManageAccessDialog';

function getInitials(name: string) {
  const parts = name.split(' ');
  return (parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '');
}

export function UserAvatarMenu() {
  const { currentUser, logout, permissions } = useAuth();
  const { settings, toggleSetting } = useAppContext();
  const [accessOpen, setAccessOpen] = useState(false);

  if (!currentUser) return null;

  const dept = departments.find(d => d.id === currentUser.departmentId);
  const deptColor = dept?.color ?? '0 0% 50%';

  return (
    <>
    <Popover>
      <PopoverTrigger asChild>
        <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ring-offset-background">
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarFallback
              className="text-xs font-semibold text-white"
              style={{ backgroundColor: `hsl(${deptColor})` }}
            >
              {getInitials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback
                className="text-sm font-semibold text-white"
                style={{ backgroundColor: `hsl(${deptColor})` }}
              >
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{currentUser.name}</p>
              <p className="text-xs text-muted-foreground">{dept?.name}</p>
            </div>
          </div>

          <Separator />

          {permissions?.role === 'admin' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => setAccessOpen(true)}
              >
                <Users className="h-4 w-4" />
                Gerenciar acessos
              </Button>
              <Separator />
            </>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="dark-mode-avatar" className="text-sm cursor-pointer">Modo escuro</Label>
            </div>
            <Switch
              id="dark-mode-avatar"
              checked={settings.darkMode}
              onCheckedChange={() => toggleSetting('darkMode')}
            />
          </div>

          <Separator />

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </PopoverContent>
    </Popover>
    {permissions?.role === 'admin' && <ManageAccessDialog open={accessOpen} onOpenChange={setAccessOpen} />}
    </>
  );
}
