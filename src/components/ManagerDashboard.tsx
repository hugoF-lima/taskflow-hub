import { useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { users, departments } from '@/data/mockData';
import { FeedbackTopic } from '@/types';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const topics: FeedbackTopic[] = ['Organização', 'Comunicação', 'Pro atividade', 'Prioridades', 'ICC', 'KISS', 'Reportar problemas'];
const pieColors = ['hsl(217,91%,60%)', 'hsl(262,83%,58%)', 'hsl(25,95%,53%)', 'hsl(142,71%,45%)', 'hsl(174,72%,40%)', 'hsl(340,82%,52%)', 'hsl(45,93%,47%)'];

export function ManagerDashboard() {
  const { filteredTasks, toggleSetting } = useAppContext();

  const allFeedback = useMemo(() => filteredTasks.flatMap(t => t.feedback), [filteredTasks]);

  // Feedback per employee
  const perEmployee = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTasks.forEach(t => {
      if (t.feedback.length > 0) {
        counts[t.assigneeId] = (counts[t.assigneeId] || 0) + t.feedback.length;
      }
    });
    return users
      .map(u => ({ name: u.name.split(' ')[0], count: counts[u.id] || 0 }))
      .filter(e => e.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [filteredTasks]);

  // Feedback per topic
  const perTopic = useMemo(() => {
    const counts: Record<string, number> = {};
    allFeedback.forEach(fb => { counts[fb.topic] = (counts[fb.topic] || 0) + 1; });
    return topics.map(t => ({ name: t, value: counts[t] || 0 })).filter(e => e.value > 0);
  }, [allFeedback]);

  // Heatmap: employee x topic
  const heatmapData = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    filteredTasks.forEach(t => {
      if (!matrix[t.assigneeId]) matrix[t.assigneeId] = {};
      t.feedback.forEach(fb => {
        matrix[t.assigneeId][fb.topic] = (matrix[t.assigneeId][fb.topic] || 0) + 1;
      });
    });
    return matrix;
  }, [filteredTasks]);

  const maxHeat = useMemo(() => {
    let max = 0;
    Object.values(heatmapData).forEach(row => Object.values(row).forEach(v => { if (v > max) max = v; }));
    return max || 1;
  }, [heatmapData]);

  // Recurring issues
  const recurringIssues = useMemo(() => {
    const issues: { userId: string; topic: string; count: number }[] = [];
    Object.entries(heatmapData).forEach(([userId, topicCounts]) => {
      Object.entries(topicCounts).forEach(([topic, count]) => {
        if (count >= 2) issues.push({ userId, topic, count });
      });
    });
    return issues.sort((a, b) => b.count - a.count).slice(0, 5);
  }, [heatmapData]);

  const heatmapUsers = users.filter(u => heatmapData[u.id] && Object.keys(heatmapData[u.id]).length > 0);

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="absolute inset-4 bg-card rounded-2xl border shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-foreground">Dashboard do Gestor</h2>
          <Button variant="ghost" size="icon" onClick={() => toggleSetting('managerDashboard')}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {/* Bar chart: feedback per employee */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Feedback por Colaborador</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={perEmployee}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Pie chart: feedback per topic */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">Feedback por Tópico</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={perTopic} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false} style={{ fontSize: 9 }}>
                    {perTopic.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Heatmap */}
            <Card className="p-4 lg:col-span-2">
              <h3 className="text-sm font-semibold mb-3">Matriz de Feedback</h3>
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Header row */}
                  <div className="grid gap-1" style={{ gridTemplateColumns: `120px repeat(${topics.length}, 1fr)` }}>
                    <div></div>
                    {topics.map(t => (
                      <div key={t} className="text-[10px] text-center text-muted-foreground font-medium px-1 truncate">{t}</div>
                    ))}
                  </div>
                  {/* Data rows */}
                  {heatmapUsers.map(user => (
                    <div key={user.id} className="grid gap-1 mt-1" style={{ gridTemplateColumns: `120px repeat(${topics.length}, 1fr)` }}>
                      <div className="text-xs truncate flex items-center">{user.name.split(' ')[0]}</div>
                      {topics.map(topic => {
                        const count = heatmapData[user.id]?.[topic] || 0;
                        const intensity = count / maxHeat;
                        return (
                          <div
                            key={topic}
                            className="h-8 rounded-md flex items-center justify-center text-[10px] font-medium transition-colors"
                            style={{
                              background: count > 0 ? `hsl(217 91% 60% / ${0.1 + intensity * 0.6})` : 'hsl(var(--muted) / 0.3)',
                              color: count > 0 ? `hsl(217 91% 60%)` : 'transparent',
                            }}
                          >
                            {count > 0 ? count : ''}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Recurring issues */}
            <Card className="p-4 lg:col-span-2">
              <h3 className="text-sm font-semibold mb-3">Questões Recorrentes</h3>
              {recurringIssues.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhuma questão recorrente identificada</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {recurringIssues.map((issue, i) => {
                    const user = users.find(u => u.id === issue.userId);
                    return (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                        <div>
                          <p className="text-xs font-medium">{user?.name}</p>
                          <p className="text-[10px] text-muted-foreground">{issue.topic}</p>
                        </div>
                        <span className="text-sm font-bold text-primary">{issue.count}x</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
