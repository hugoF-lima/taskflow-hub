import React, { useState } from 'react';
import { useAuth, PendingRegistration } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';
import { UserCheck, Inbox, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function RegistrationItem({ reg, onApprove, departments }: { reg: PendingRegistration; onApprove: (id: string, depts: string[], pw: string) => void; departments: { id: string; name: string }[] }) {
  const [selectedDepts, setSelectedDepts] = useState<string[]>([reg.departmentId]);
  const [password, setPassword] = useState('123newuser');

  const dept = departments.find(d => d.id === reg.departmentId);

  const toggleDept = (deptId: string) => {
    setSelectedDepts(prev => prev.includes(deptId) ? prev.filter(d => d !== deptId) : [...prev, deptId]);
  };

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div>
        <p className="text-sm font-medium text-foreground">{reg.name}</p>
        <p className="text-xs text-muted-foreground">{reg.email}</p>
        <p className="text-xs text-muted-foreground">Departamento: {dept?.name ?? reg.departmentId}</p>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">Departamentos visíveis</Label>
        <div className="grid grid-cols-2 gap-2">
          {departments.map(d => (
            <label key={d.id} className="flex items-center gap-2 text-xs cursor-pointer">
              <Checkbox
                checked={selectedDepts.includes(d.id)}
                onCheckedChange={() => toggleDept(d.id)}
              />
              {d.name}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-xs font-medium">Senha inicial</Label>
        <Input value={password} onChange={e => setPassword(e.target.value)} className="h-8 text-sm" maxLength={50} />
      </div>

      <Button
        size="sm"
        className="w-full gap-2"
        disabled={selectedDepts.length === 0 || !password.trim()}
        onClick={() => onApprove(reg.id, selectedDepts, password)}
      >
        <UserCheck className="h-4 w-4" />
        Aprovar Acesso
      </Button>
    </div>
  );
}

export function ManageAccessDialog({ open, onOpenChange }: Props) {
  const { pendingRegistrations, approveRegistration, registeredUsers, fetchPendingRegistrations, fetchRegisteredUsers } = useAuth();
  const { departments } = useAppContext();

  // Fetch data when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchPendingRegistrations();
      fetchRegisteredUsers();
    }
  }, [open, fetchPendingRegistrations, fetchRegisteredUsers]);

  const handleApprove = (id: string, depts: string[], pw: string) => {
    approveRegistration(id, depts, pw);
    toast.success('Acesso aprovado com sucesso');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar acessos</DialogTitle>
          <DialogDescription>Solicitações de novos usuários aguardando aprovação</DialogDescription>
        </DialogHeader>

        {pendingRegistrations.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
            <Inbox className="h-10 w-10" />
            <p className="text-sm">Nenhuma solicitação pendente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRegistrations.map(reg => (
              <RegistrationItem key={reg.id} reg={reg} onApprove={handleApprove} departments={departments} />
            ))}
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Acessos existentes</h3>
          </div>
          {registeredUsers.map(u => {
            const dept = departments.find(d => d.id === u.departmentId);
            return (
              <div key={u.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                  <p className="text-xs text-muted-foreground">{dept?.name ?? u.departmentId}</p>
                </div>
                <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                  {u.role === 'admin' ? 'Admin' : 'Usuário'}
                </Badge>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
