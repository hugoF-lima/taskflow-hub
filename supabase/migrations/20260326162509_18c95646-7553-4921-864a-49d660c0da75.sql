
-- Seed departments
INSERT INTO public.departments (id, name, color) VALUES
  ('comercial', 'Comercial', '217 91% 60%'),
  ('informatica', 'Informática', '262 83% 58%'),
  ('expedicao', 'Expedição', '25 95% 53%'),
  ('almoxarifado', 'Almoxarifado', '142 71% 45%'),
  ('processos', 'Processos', '174 72% 40%'),
  ('rh', 'RH', '340 82% 52%');

-- Seed profiles (fixed UUIDs for FK consistency)
INSERT INTO public.profiles (id, name, email, department_id) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Carlos Silva', 'carlos@silva.com', 'comercial'),
  ('00000000-0000-0000-0000-000000000002', 'Ana Oliveira', 'ana@oliveira.com', 'comercial'),
  ('00000000-0000-0000-0000-000000000003', 'Bruno Santos', 'bruno@santos.com', 'informatica'),
  ('00000000-0000-0000-0000-000000000004', 'Mariana Costa', 'mariana@costa.com', 'informatica'),
  ('00000000-0000-0000-0000-000000000005', 'Pedro Lima', 'pedro@lima.com', 'expedicao'),
  ('00000000-0000-0000-0000-000000000006', 'Juliana Alves', 'juliana@alves.com', 'expedicao'),
  ('00000000-0000-0000-0000-000000000007', 'Rafael Mendes', 'rafael@mendes.com', 'almoxarifado'),
  ('00000000-0000-0000-0000-000000000008', 'Fernanda Rocha', 'fernanda@rocha.com', 'almoxarifado'),
  ('00000000-0000-0000-0000-000000000009', 'Lucas Pereira', 'lucas@pereira.com', 'processos'),
  ('00000000-0000-0000-0000-000000000010', 'Camila Ferreira', 'camila@ferreira.com', 'processos'),
  ('00000000-0000-0000-0000-000000000011', 'Thiago Barbosa', 'thiago@barbosa.com', 'rh'),
  ('00000000-0000-0000-0000-000000000012', 'Isabela Martins', 'isabela@martins.com', 'rh');

-- User roles
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'user'),
  ('00000000-0000-0000-0000-000000000003', 'user'),
  ('00000000-0000-0000-0000-000000000004', 'user'),
  ('00000000-0000-0000-0000-000000000005', 'user'),
  ('00000000-0000-0000-0000-000000000006', 'user'),
  ('00000000-0000-0000-0000-000000000007', 'user'),
  ('00000000-0000-0000-0000-000000000008', 'user'),
  ('00000000-0000-0000-0000-000000000009', 'user'),
  ('00000000-0000-0000-0000-000000000010', 'user'),
  ('00000000-0000-0000-0000-000000000011', 'user'),
  ('00000000-0000-0000-0000-000000000012', 'user');

-- Department visibility: Carlos (admin) sees all, others see their own department
INSERT INTO public.user_department_visibility (user_id, department_id) VALUES
  -- Carlos sees all
  ('00000000-0000-0000-0000-000000000001', 'comercial'),
  ('00000000-0000-0000-0000-000000000001', 'informatica'),
  ('00000000-0000-0000-0000-000000000001', 'expedicao'),
  ('00000000-0000-0000-0000-000000000001', 'almoxarifado'),
  ('00000000-0000-0000-0000-000000000001', 'processos'),
  ('00000000-0000-0000-0000-000000000001', 'rh'),
  -- Others see own department
  ('00000000-0000-0000-0000-000000000002', 'comercial'),
  ('00000000-0000-0000-0000-000000000003', 'informatica'),
  ('00000000-0000-0000-0000-000000000004', 'informatica'),
  ('00000000-0000-0000-0000-000000000005', 'expedicao'),
  ('00000000-0000-0000-0000-000000000006', 'expedicao'),
  ('00000000-0000-0000-0000-000000000007', 'almoxarifado'),
  ('00000000-0000-0000-0000-000000000008', 'almoxarifado'),
  ('00000000-0000-0000-0000-000000000009', 'processos'),
  ('00000000-0000-0000-0000-000000000010', 'processos'),
  ('00000000-0000-0000-0000-000000000011', 'rh'),
  ('00000000-0000-0000-0000-000000000012', 'rh');

-- Tasks: base date April 10, 2026 (offsets from mockData)
-- Carlos Silva (u1)
INSERT INTO public.tasks (id, code, title, deadline, urgency, important, process, completed, created_at, created_by) VALUES
  ('10000000-0000-0000-0000-000000000001', 'GAP-0002', 'Elaborar proposta cliente Alfa', '2026-04-08T00:00:00Z', 'critical24h', true, 'Vendas', false, '2026-02-15T00:00:00Z', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'GAP-0003', 'Atualizar pipeline de vendas', '2026-04-13T00:00:00Z', 'normal', false, 'Vendas', false, '2026-02-10T00:00:00Z', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000003', 'GAP-0004', 'Reunião com fornecedor Beta', '2026-04-10T00:00:00Z', 'medium', true, 'Vendas', false, '2026-02-20T00:00:00Z', '00000000-0000-0000-0000-000000000001');

-- Ana Oliveira (u2)
INSERT INTO public.tasks (id, code, title, deadline, urgency, important, process, completed, completed_at, created_at, created_by) VALUES
  ('10000000-0000-0000-0000-000000000004', 'GAP-0005', 'Preparar relatório mensal', '2026-04-15T00:00:00Z', 'normal', false, 'Vendas', true, '2026-03-22T00:00:00Z', '2026-02-05T00:00:00Z', '00000000-0000-0000-0000-000000000002');
INSERT INTO public.tasks (id, code, title, deadline, urgency, important, process, completed, created_at, created_by) VALUES
  ('10000000-0000-0000-0000-000000000005', 'GAP-0006', 'Negociação contrato Delta', '2026-04-09T00:00:00Z', 'critical', true, 'Vendas', false, '2026-02-12T00:00:00Z', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000006', 'GAP-0007', 'Follow-up clientes inativos', '2026-04-17T00:00:00Z', 'report', false, 'Vendas', false, '2026-02-18T00:00:00Z', '00000000-0000-0000-0000-000000000002');

-- Bruno Santos (u3)
INSERT INTO public.tasks (id, code, title, deadline, urgency, important, process, completed, created_at, created_by) VALUES
  ('10000000-0000-0000-0000-000000000007', 'GAP-0008', 'Migração servidor de e-mails', '2026-04-07T00:00:00Z', 'critical24h', true, 'Suporte TI', false, '2026-02-08T00:00:00Z', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000008', 'GAP-0009', 'Atualizar firewall regras', '2026-04-12T00:00:00Z', 'critical', true, 'Suporte TI', false, '2026-02-22T00:00:00Z', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000009', 'GAP-0010', 'Documentar infraestrutura rede', '2026-04-20T00:00:00Z', 'normal', false, 'Desenvolvimento', false, '2026-02-14T00:00:00Z', '00000000-0000-0000-0000-000000000003');

-- Mariana Costa (u4)
INSERT INTO public.tasks (id, code, title, deadline, urgency, important, process, completed, created_at, created_by) VALUES
  ('10000000-0000-0000-0000-000000000010', 'GAP-0011', 'Desenvolver módulo relatórios', '2026-04-14T00:00:00Z', 'medium', true, 'Desenvolvimento', false, '2026-02-06T00:00:00Z', '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000011', 'GAP-0012', 'Corrigir bug sistema de login', '2026-04-09T00:00:00Z', 'critical24h', true, 'Desenvolvimento', false, '2026-02-19T00:00:00Z', '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000012', 'GAP-0013', 'Testar integração API parceiro', '2026-04-16T00:00:00Z', 'normal', false, 'Desenvolvimento', false, '2026-02-25T00:00:00Z', '00000000-0000-0000-0000-000000000004');

-- Pedro Lima (u5)
INSERT INTO public.tasks (id, code, title, deadline, urgency, important, process, completed, completed_at, created_at, created_by) VALUES
  ('10000000-0000-0000-0000-000000000014', 'GAP-0015', 'Inventário veículos frota', '2026-04-18T00:00:00Z', 'normal', false, 'Logística', true, '2026-03-22T00:00:00Z', '2026-02-11T00:00:00Z', '00000000-0000-0000-0000-000000000005');
INSERT INTO public.tasks (id, code, title, deadline, urgency, important, process, completed, created_at, created_by) VALUES
  ('10000000-0000-0000-0000-000000000013', 'GAP-0014', 'Organizar rota de entregas SP', '2026-04-10T00:00:00Z', 'medium', false, 'Logística', false, '2026-02-17T00:00:00Z', '00000000-0000-0000-0000-000000000005'),
  ('10000000-0000-0000-0000-000000000015', 'GAP-0016', 'Resolver pendência transportadora', '2026-04-08T00:00:00Z', 'critical', true, 'Expedição', false, '2026-02-03T00:00:00Z', '00000000-0000-0000-0000-000000000005');

-- Juliana Alves (u6)
INSERT INTO public.tasks (id, code, title, deadline, urgency, important, process, completed, created_at, created_by) VALUES
  ('10000000-0000-0000-0000-000000000016', 'GAP-0017', 'Conferir notas fiscais lote 47', '2026-04-11T00:00:00Z', 'medium', false, 'Expedição', false, '2026-02-21T00:00:00Z', '00000000-0000-0000-0000-000000000006'),
  ('10000000-0000-0000-0000-000000000017', 'GAP-0018', 'Agendar coleta internacional', '2026-04-09T00:00:00Z', 'critical24h', true, 'Logística', false, '2026-02-09T00:00:00Z', '00000000-0000-0000-0000-000000000006'),
  ('10000000-0000-0000-0000-000000000018', 'GAP-0019', 'Atualizar tabela de fretes', '2026-04-22T00:00:00Z', 'report', false, 'Logística', false, '2026-02-16T00:00:00Z', '00000000-0000-0000-0000-000000000006');

-- Rafael Mendes (u7)
INSERT INTO public.tasks (id, code, title, deadline, urgency, important, process, completed, completed_at, created_at, created_by) VALUES
  ('10000000-0000-0000-0000-000000000021', 'GAP-0022', 'Organizar área de recebimento', '2026-04-15T00:00:00Z', 'medium', false, 'Compras', true, '2026-03-22T00:00:00Z', '2026-02-07T00:00:00Z', '00000000-0000-0000-0000-000000000007');
INSERT INTO public.tasks (id, code, title, deadline, urgency, important, process, completed, created_at, created_by) VALUES
  ('10000000-0000-0000-0000-000000000019', 'GAP-0020', 'Contagem cíclica setor A', '2026-04-13T00:00:00Z', 'normal', false, 'Compras', false, '2026-02-23T00:00:00Z', '00000000-0000-0000-0000-000000000007'),
  ('10000000-0000-0000-0000-000000000020', 'GAP-0021', 'Solicitar reposição estoque', '2026-04-09T00:00:00Z', 'critical', true, 'Compras', false, '2026-02-13T00:00:00Z', '00000000-0000-0000-0000-000000000007');

-- Fernanda Rocha (u8)
INSERT INTO public.tasks (id, code, title, deadline, urgency, important, process, completed, created_at, created_by) VALUES
  ('10000000-0000-0000-0000-000000000022', 'GAP-0023', 'Cadastrar novos fornecedores', '2026-04-14T00:00:00Z', 'normal', false, 'Compras', false, '2026-02-04T00:00:00Z', '00000000-0000-0000-0000-000000000008'),
  ('10000000-0000-0000-0000-000000000023', 'GAP-0024', 'Auditar validade materiais', '2026-04-07T00:00:00Z', 'critical24h', true, 'Qualidade', false, '2026-02-26T00:00:00Z', '00000000-0000-0000-0000-000000000008'),
  ('10000000-0000-0000-0000-000000000024', 'GAP-0025', 'Relatório de perdas mensal', '2026-04-17T00:00:00Z', 'report', false, 'Qualidade', false, '2026-02-02T00:00:00Z', '00000000-0000-0000-0000-000000000008');

-- Lucas Pereira (u9)
INSERT INTO public.tasks (id, code, title, deadline, urgency, important, process, completed, created_at, created_by) VALUES
  ('10000000-0000-0000-0000-000000000025', 'GAP-0026', 'Mapear fluxo atendimento', '2026-04-16T00:00:00Z', 'normal', true, 'Qualidade', false, '2026-02-24T00:00:00Z', '00000000-0000-0000-0000-000000000009'),
  ('10000000-0000-0000-0000-000000000026', 'GAP-0027', 'Revisar SLA contratos ativos', '2026-04-08T00:00:00Z', 'critical', true, 'Qualidade', false, '2026-02-01T00:00:00Z', '00000000-0000-0000-0000-000000000009'),
  ('10000000-0000-0000-0000-000000000027', 'GAP-0028', 'Implantar checklist qualidade', '2026-04-19T00:00:00Z', 'medium', false, 'Qualidade', false, '2026-02-27T00:00:00Z', '00000000-0000-0000-0000-000000000009');

-- Camila Ferreira (u10)
INSERT INTO public.tasks (id, code, title, deadline, urgency, important, process, completed, created_at, created_by) VALUES
  ('10000000-0000-0000-0000-000000000028', 'GAP-0029', 'Analisar indicadores KPI', '2026-04-12T00:00:00Z', 'medium', true, 'Qualidade', false, '2026-02-28T00:00:00Z', '00000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000029', 'GAP-0030', 'Treinar equipe novo sistema', '2026-04-10T00:00:00Z', 'critical', true, 'Qualidade', false, '2026-02-19T00:00:00Z', '00000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000030', 'GAP-0031', 'Documentar processos internos', '2026-04-24T00:00:00Z', 'normal', false, 'Qualidade', false, '2026-02-10T00:00:00Z', '00000000-0000-0000-0000-000000000010');

-- Thiago Barbosa (u11)
INSERT INTO public.tasks (id, code, title, deadline, urgency, important, process, completed, created_at, created_by) VALUES
  ('10000000-0000-0000-0000-000000000031', 'GAP-0032', 'Processo seletivo dev pleno', '2026-04-13T00:00:00Z', 'medium', false, 'Recrutamento', false, '2026-02-15T00:00:00Z', '00000000-0000-0000-0000-000000000011'),
  ('10000000-0000-0000-0000-000000000032', 'GAP-0033', 'Organizar integração novatos', '2026-04-09T00:00:00Z', 'critical', true, 'Recrutamento', false, '2026-02-22T00:00:00Z', '00000000-0000-0000-0000-000000000011'),
  ('10000000-0000-0000-0000-000000000033', 'GAP-0034', 'Atualizar políticas internas', '2026-04-20T00:00:00Z', 'normal', false, 'Recrutamento', false, '2026-02-08T00:00:00Z', '00000000-0000-0000-0000-000000000011');

-- Isabela Martins (u12)
INSERT INTO public.tasks (id, code, title, deadline, urgency, important, process, completed, completed_at, created_at, created_by) VALUES
  ('10000000-0000-0000-0000-000000000035', 'GAP-0036', 'Agendar treinamento liderança', '2026-04-15T00:00:00Z', 'normal', false, 'Recrutamento', true, '2026-03-22T00:00:00Z', '2026-02-11T00:00:00Z', '00000000-0000-0000-0000-000000000012');
INSERT INTO public.tasks (id, code, title, deadline, urgency, important, process, completed, created_at, created_by) VALUES
  ('10000000-0000-0000-0000-000000000034', 'GAP-0035', 'Calcular folha de pagamento', '2026-04-08T00:00:00Z', 'critical24h', true, 'Financeiro', false, '2026-02-20T00:00:00Z', '00000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000036', 'GAP-0037', 'Pesquisa de clima organizacional', '2026-04-18T00:00:00Z', 'report', false, 'Recrutamento', false, '2026-02-14T00:00:00Z', '00000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000037', 'GAP-0038', 'Revisar benefícios funcionários', '2026-04-11T00:00:00Z', 'medium', false, 'Financeiro', false, '2026-02-25T00:00:00Z', '00000000-0000-0000-0000-000000000012');

-- Task assignees (one per task, matching mock data)
INSERT INTO public.task_assignees (task_id, user_id) VALUES
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002'),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000003'),
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000004'),
  ('10000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000005'),
  ('10000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000005'),
  ('10000000-0000-0000-0000-000000000015', '00000000-0000-0000-0000-000000000005'),
  ('10000000-0000-0000-0000-000000000016', '00000000-0000-0000-0000-000000000006'),
  ('10000000-0000-0000-0000-000000000017', '00000000-0000-0000-0000-000000000006'),
  ('10000000-0000-0000-0000-000000000018', '00000000-0000-0000-0000-000000000006'),
  ('10000000-0000-0000-0000-000000000019', '00000000-0000-0000-0000-000000000007'),
  ('10000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000007'),
  ('10000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000007'),
  ('10000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000008'),
  ('10000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000008'),
  ('10000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000008'),
  ('10000000-0000-0000-0000-000000000025', '00000000-0000-0000-0000-000000000009'),
  ('10000000-0000-0000-0000-000000000026', '00000000-0000-0000-0000-000000000009'),
  ('10000000-0000-0000-0000-000000000027', '00000000-0000-0000-0000-000000000009'),
  ('10000000-0000-0000-0000-000000000028', '00000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000029', '00000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000010'),
  ('10000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000011'),
  ('10000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000011'),
  ('10000000-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000011'),
  ('10000000-0000-0000-0000-000000000034', '00000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000035', '00000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000036', '00000000-0000-0000-0000-000000000012'),
  ('10000000-0000-0000-0000-000000000037', '00000000-0000-0000-0000-000000000012');

-- Feedback seed (sampled from mock patterns)
INSERT INTO public.feedback (task_id, topic, type, comment, anonymous, author_id, created_at) VALUES
  -- Task 1: 3 feedbacks
  ('10000000-0000-0000-0000-000000000001', 'Organização', 'precisa mais atenção', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000005', '2026-03-10T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000001', 'Comunicação', 'mandou bem!', NULL, true, '00000000-0000-0000-0000-000000000003', '2026-03-12T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000001', 'Prioridades', 'cooperação', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000008', '2026-03-15T00:00:00Z'),
  -- Task 2: 1 feedback
  ('10000000-0000-0000-0000-000000000002', 'ICC', 'precisa um pouco mais de atenção', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000011', '2026-03-08T00:00:00Z'),
  -- Task 4: 2 feedbacks
  ('10000000-0000-0000-0000-000000000004', 'KISS', 'mandou bem!', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000001', '2026-03-05T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000004', 'Reportar problemas', 'cooperação', NULL, true, '00000000-0000-0000-0000-000000000007', '2026-03-14T00:00:00Z'),
  -- Task 5: 1 feedback
  ('10000000-0000-0000-0000-000000000005', 'Pro atividade', 'precisa mais atenção', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000009', '2026-03-11T00:00:00Z'),
  -- Task 7: 4 feedbacks
  ('10000000-0000-0000-0000-000000000007', 'Organização', 'mandou bem!', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000002', '2026-03-03T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000007', 'Comunicação', 'precisa um pouco mais de atenção', NULL, true, '00000000-0000-0000-0000-000000000006', '2026-03-06T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000007', 'Prioridades', 'cooperação', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000010', '2026-03-09T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000007', 'ICC', 'precisa mais atenção', NULL, true, '00000000-0000-0000-0000-000000000012', '2026-03-13T00:00:00Z'),
  -- Task 8: 1 feedback
  ('10000000-0000-0000-0000-000000000008', 'KISS', 'mandou bem!', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000004', '2026-03-07T00:00:00Z'),
  -- Task 10: 2 feedbacks
  ('10000000-0000-0000-0000-000000000010', 'Reportar problemas', 'precisa um pouco mais de atenção', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000001', '2026-03-04T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000010', 'Organização', 'cooperação', NULL, true, '00000000-0000-0000-0000-000000000005', '2026-03-16T00:00:00Z'),
  -- Task 11: 1 feedback
  ('10000000-0000-0000-0000-000000000011', 'Pro atividade', 'precisa mais atenção', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000008', '2026-03-10T00:00:00Z'),
  -- Task 13: 1 feedback
  ('10000000-0000-0000-0000-000000000013', 'Comunicação', 'mandou bem!', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000003', '2026-03-11T00:00:00Z'),
  -- Task 14: 2 feedbacks
  ('10000000-0000-0000-0000-000000000014', 'Prioridades', 'cooperação', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000011', '2026-03-02T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000014', 'ICC', 'precisa um pouco mais de atenção', NULL, true, '00000000-0000-0000-0000-000000000007', '2026-03-18T00:00:00Z'),
  -- Task 15: 3 feedbacks
  ('10000000-0000-0000-0000-000000000015', 'KISS', 'precisa mais atenção', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000009', '2026-03-01T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000015', 'Reportar problemas', 'mandou bem!', NULL, true, '00000000-0000-0000-0000-000000000002', '2026-03-08T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000015', 'Organização', 'cooperação', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000006', '2026-03-19T00:00:00Z'),
  -- Task 17: 2 feedbacks
  ('10000000-0000-0000-0000-000000000017', 'Comunicação', 'precisa um pouco mais de atenção', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000010', '2026-03-05T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000017', 'Pro atividade', 'mandou bem!', NULL, true, '00000000-0000-0000-0000-000000000004', '2026-03-17T00:00:00Z'),
  -- Task 20: 1 feedback
  ('10000000-0000-0000-0000-000000000020', 'Prioridades', 'precisa mais atenção', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000012', '2026-03-09T00:00:00Z'),
  -- Task 21: 1 feedback
  ('10000000-0000-0000-0000-000000000021', 'ICC', 'cooperação', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000001', '2026-03-13T00:00:00Z'),
  -- Task 23: 2 feedbacks
  ('10000000-0000-0000-0000-000000000023', 'KISS', 'precisa um pouco mais de atenção', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000003', '2026-03-07T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000023', 'Reportar problemas', 'mandou bem!', NULL, true, '00000000-0000-0000-0000-000000000011', '2026-03-15T00:00:00Z'),
  -- Task 24: 1 feedback
  ('10000000-0000-0000-0000-000000000024', 'Organização', 'precisa mais atenção', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000005', '2026-03-12T00:00:00Z'),
  -- Task 26: 2 feedbacks
  ('10000000-0000-0000-0000-000000000026', 'Comunicação', 'cooperação', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000008', '2026-03-04T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000026', 'Pro atividade', 'precisa um pouco mais de atenção', NULL, true, '00000000-0000-0000-0000-000000000002', '2026-03-16T00:00:00Z'),
  -- Task 28: 1 feedback
  ('10000000-0000-0000-0000-000000000028', 'Prioridades', 'mandou bem!', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000006', '2026-03-10T00:00:00Z'),
  -- Task 32: 2 feedbacks
  ('10000000-0000-0000-0000-000000000032', 'ICC', 'precisa mais atenção', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000004', '2026-03-06T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000032', 'KISS', 'cooperação', NULL, true, '00000000-0000-0000-0000-000000000010', '2026-03-14T00:00:00Z'),
  -- Task 34: 1 feedback
  ('10000000-0000-0000-0000-000000000034', 'Reportar problemas', 'precisa um pouco mais de atenção', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000007', '2026-03-11T00:00:00Z'),
  -- Task 35: 2 feedbacks
  ('10000000-0000-0000-0000-000000000035', 'Organização', 'mandou bem!', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000009', '2026-03-03T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000035', 'Comunicação', 'precisa mais atenção', NULL, true, '00000000-0000-0000-0000-000000000012', '2026-03-18T00:00:00Z'),
  -- Task 31: 1 feedback
  ('10000000-0000-0000-0000-000000000031', 'Pro atividade', 'cooperação', 'Comentário de exemplo sobre o desempenho nesta tarefa.', true, '00000000-0000-0000-0000-000000000001', '2026-03-09T00:00:00Z');
