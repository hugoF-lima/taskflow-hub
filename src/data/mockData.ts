import { Department, User, Task, Feedback, FeedbackTopic, FeedbackType, UrgencyLevel } from '@/types';

export const departments: Department[] = [
  { id: 'comercial', name: 'Comercial', color: '217 91% 60%' },
  { id: 'informatica', name: 'Informática', color: '262 83% 58%' },
  { id: 'expedicao', name: 'Expedição', color: '25 95% 53%' },
  { id: 'almoxarifado', name: 'Almoxarifado', color: '142 71% 45%' },
  { id: 'processos', name: 'Processos', color: '174 72% 40%' },
  { id: 'rh', name: 'RH', color: '340 82% 52%' },
];

export const users: User[] = [
  { id: 'u1', name: 'Carlos Silva', departmentId: 'comercial' },
  { id: 'u2', name: 'Ana Oliveira', departmentId: 'comercial' },
  { id: 'u3', name: 'Bruno Santos', departmentId: 'informatica' },
  { id: 'u4', name: 'Mariana Costa', departmentId: 'informatica' },
  { id: 'u5', name: 'Pedro Lima', departmentId: 'expedicao' },
  { id: 'u6', name: 'Juliana Alves', departmentId: 'expedicao' },
  { id: 'u7', name: 'Rafael Mendes', departmentId: 'almoxarifado' },
  { id: 'u8', name: 'Fernanda Rocha', departmentId: 'almoxarifado' },
  { id: 'u9', name: 'Lucas Pereira', departmentId: 'processos' },
  { id: 'u10', name: 'Camila Ferreira', departmentId: 'processos' },
  { id: 'u11', name: 'Thiago Barbosa', departmentId: 'rh' },
  { id: 'u12', name: 'Isabela Martins', departmentId: 'rh' },
];

const topics: FeedbackTopic[] = ['Organização', 'Comunicação', 'Pro atividade', 'Prioridades', 'ICC', 'KISS', 'Reportar problemas'];
const types: FeedbackType[] = ['precisa mais atenção', 'precisa um pouco mais de atenção', 'mandou bem!', 'cooperação'];
const processes = ['Vendas', 'Suporte TI', 'Logística', 'Compras', 'Qualidade', 'Recrutamento', 'Desenvolvimento', 'Expedição', 'Financeiro'];
const urgencies: UrgencyLevel[] = ['normal', 'medium', 'critical', 'critical24h', 'report'];

let feedbackId = 1;
function makeFeedback(taskId: string, count: number): Feedback[] {
  const result: Feedback[] = [];
  for (let i = 0; i < count; i++) {
    result.push({
      id: `fb${feedbackId++}`,
      taskId,
      topic: topics[Math.floor(Math.random() * topics.length)],
      type: types[Math.floor(Math.random() * types.length)],
      comment: i % 2 === 0 ? 'Comentário de exemplo sobre o desempenho nesta tarefa.' : undefined,
      anonymous: true,
      authorId: users[Math.floor(Math.random() * users.length)].id,
      createdAt: new Date(2026, 2, Math.floor(Math.random() * 20) + 1).toISOString(),
    });
  }
  return result;
}

let taskId = 1;
function makeTask(assigneeId: string, title: string, daysOffset: number, urgency: UrgencyLevel, process: string, important: boolean, completed: boolean, fbCount: number): Task {
  const id = `t${taskId++}`;
  const deadline = new Date(2026, 2, 24 + daysOffset);
  return {
    id,
    code: `GAP-${String(taskId).padStart(4, '0')}`,
    title,
    assigneeIds: [assigneeId],
    deadline: deadline.toISOString(),
    urgency,
    important,
    process,
    observations: '',
    completed,
    completedAt: completed ? new Date(2026, 2, 22).toISOString() : undefined,
    createdAt: new Date(2026, 1, Math.floor(Math.random() * 28) + 1).toISOString(),
    feedback: makeFeedback(id, fbCount),
  };
}

export const tasks: Task[] = [
  // Carlos Silva (u1) - Comercial
  makeTask('u1', 'Elaborar proposta cliente Alfa', -2, 'critical24h', 'Vendas', true, false, 3),
  makeTask('u1', 'Atualizar pipeline de vendas', 3, 'normal', 'Vendas', false, false, 1),
  makeTask('u1', 'Reunião com fornecedor Beta', 0, 'medium', 'Vendas', true, false, 0),

  // Ana Oliveira (u2) - Comercial
  makeTask('u2', 'Preparar relatório mensal', 5, 'normal', 'Vendas', false, true, 2),
  makeTask('u2', 'Negociação contrato Delta', -1, 'critical', 'Vendas', true, false, 1),
  makeTask('u2', 'Follow-up clientes inativos', 7, 'report', 'Vendas', false, false, 0),

  // Bruno Santos (u3) - Informática
  makeTask('u3', 'Migração servidor de e-mails', -3, 'critical24h', 'Suporte TI', true, false, 4),
  makeTask('u3', 'Atualizar firewall regras', 2, 'critical', 'Suporte TI', true, false, 1),
  makeTask('u3', 'Documentar infraestrutura rede', 10, 'normal', 'Desenvolvimento', false, false, 0),

  // Mariana Costa (u4) - Informática
  makeTask('u4', 'Desenvolver módulo relatórios', 4, 'medium', 'Desenvolvimento', true, false, 2),
  makeTask('u4', 'Corrigir bug sistema de login', -1, 'critical24h', 'Desenvolvimento', true, false, 1),
  makeTask('u4', 'Testar integração API parceiro', 6, 'normal', 'Desenvolvimento', false, false, 0),

  // Pedro Lima (u5) - Expedição
  makeTask('u5', 'Organizar rota de entregas SP', 0, 'medium', 'Logística', false, false, 1),
  makeTask('u5', 'Inventário veículos frota', 8, 'normal', 'Logística', false, true, 2),
  makeTask('u5', 'Resolver pendência transportadora', -2, 'critical', 'Expedição', true, false, 3),

  // Juliana Alves (u6) - Expedição
  makeTask('u6', 'Conferir notas fiscais lote 47', 1, 'medium', 'Expedição', false, false, 0),
  makeTask('u6', 'Agendar coleta internacional', -1, 'critical24h', 'Logística', true, false, 2),
  makeTask('u6', 'Atualizar tabela de fretes', 12, 'report', 'Logística', false, false, 0),

  // Rafael Mendes (u7) - Almoxarifado
  makeTask('u7', 'Contagem cíclica setor A', 3, 'normal', 'Compras', false, false, 0),
  makeTask('u7', 'Solicitar reposição estoque', -1, 'critical', 'Compras', true, false, 1),
  makeTask('u7', 'Organizar área de recebimento', 5, 'medium', 'Compras', false, true, 1),

  // Fernanda Rocha (u8) - Almoxarifado
  makeTask('u8', 'Cadastrar novos fornecedores', 4, 'normal', 'Compras', false, false, 0),
  makeTask('u8', 'Auditar validade materiais', -3, 'critical24h', 'Qualidade', true, false, 2),
  makeTask('u8', 'Relatório de perdas mensal', 7, 'report', 'Qualidade', false, false, 1),

  // Lucas Pereira (u9) - Processos
  makeTask('u9', 'Mapear fluxo atendimento', 6, 'normal', 'Qualidade', true, false, 0),
  makeTask('u9', 'Revisar SLA contratos ativos', -2, 'critical', 'Qualidade', true, false, 2),
  makeTask('u9', 'Implantar checklist qualidade', 9, 'medium', 'Qualidade', false, false, 0),

  // Camila Ferreira (u10) - Processos
  makeTask('u10', 'Analisar indicadores KPI', 2, 'medium', 'Qualidade', true, false, 1),
  makeTask('u10', 'Treinar equipe novo sistema', 0, 'critical', 'Qualidade', true, false, 0),
  makeTask('u10', 'Documentar processos internos', 14, 'normal', 'Qualidade', false, false, 0),

  // Thiago Barbosa (u11) - RH
  makeTask('u11', 'Processo seletivo dev pleno', 3, 'medium', 'Recrutamento', false, false, 1),
  makeTask('u11', 'Organizar integração novatos', -1, 'critical', 'Recrutamento', true, false, 2),
  makeTask('u11', 'Atualizar políticas internas', 10, 'normal', 'Recrutamento', false, false, 0),

  // Isabela Martins (u12) - RH
  makeTask('u12', 'Calcular folha de pagamento', -2, 'critical24h', 'Financeiro', true, false, 1),
  makeTask('u12', 'Agendar treinamento liderança', 5, 'normal', 'Recrutamento', false, true, 2),
  makeTask('u12', 'Pesquisa de clima organizacional', 8, 'report', 'Recrutamento', false, false, 0),
  makeTask('u12', 'Revisar benefícios funcionários', 1, 'medium', 'Financeiro', false, false, 0),
];

export const allProcesses = [...new Set(tasks.map(t => t.process))].sort();

export const urgencyConfig: Record<UrgencyLevel, { label: string; color: string }> = {
  normal: { label: 'Normal', color: '142 71% 45%' },
  medium: { label: 'Média', color: '45 93% 47%' },
  critical: { label: 'Crítica', color: '25 95% 53%' },
  critical24h: { label: 'Crítica 24h', color: '0 84% 60%' },
  report: { label: 'Reportar', color: '220 9% 46%' },
};
