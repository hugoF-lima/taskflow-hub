import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogIn, Eye, EyeOff, UserPlus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Department } from '@/types';

export default function Login() {
  const { login, addRegistration } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [departments, setDepartments] = useState<Department[]>([]);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDept, setRegDept] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  useEffect(() => {
    supabase.from('departments').select('*').then(({ data }) => {
      if (data) setDepartments(data.map(d => ({ id: d.id, name: d.name, color: d.color })));
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    if (!success) toast.error('Credenciais inválidas');
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regDept) {
      toast.error('Preencha todos os campos');
      return;
    }
    setRegLoading(true);
    await addRegistration(regName.trim(), regEmail.trim(), regDept);
    toast.success('Enviamos seu pedido, logo você receberá um retorno por email');
    setRegName('');
    setRegEmail('');
    setRegDept('');
    setMode('login');
    setRegLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <img src="/nevoni-logo.png" alt="Nevoni Logo" className="h-12 w-12 rounded-xl object-contain" />
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Gerenciamento de Atividades
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'login' ? 'Entre com suas credenciais para continuar' : 'Solicite acesso ao sistema'}
          </p>
        </div>

        {mode === 'login' ? (
          <>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Login</CardTitle>
                <CardDescription className="text-xs">
                  Use suas credenciais para acessar o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs">Senha</Label>
                    <div className="relative">
                      <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="h-9 text-sm pr-9" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-9 gap-2" disabled={loading}>
                    {loading ? <span className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" /> : <LogIn className="h-4 w-4" />}
                    Entrar
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="text-center">
              <button onClick={() => setMode('register')} className="text-sm text-primary underline hover:text-primary/80 transition-colors">
                Ainda não é usuário? Criar conta
              </button>
            </div>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Criar conta</CardTitle>
                <CardDescription className="text-xs">
                  Preencha seus dados para solicitar acesso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name" className="text-xs">Nome</Label>
                    <Input id="reg-name" value={regName} onChange={e => setRegName(e.target.value)} placeholder="Seu nome completo" className="h-9 text-sm" maxLength={100} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-dept" className="text-xs">Seu departamento</Label>
                    <Select value={regDept} onValueChange={setRegDept}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Selecione o departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="text-xs">Email</Label>
                    <Input id="reg-email" type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="seu@email.com" className="h-9 text-sm" maxLength={255} />
                  </div>
                  <Button type="submit" className="w-full h-9 gap-2" disabled={regLoading}>
                    {regLoading ? <span className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" /> : <UserPlus className="h-4 w-4" />}
                    Cadastrar
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="text-center">
              <button onClick={() => setMode('login')} className="text-sm text-primary underline hover:text-primary/80 transition-colors flex items-center gap-1 mx-auto">
                <ArrowLeft className="h-3 w-3" />
                Já tem conta? Entrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
