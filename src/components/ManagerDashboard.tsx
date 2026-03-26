import { useMemo, useState, useCallback } from "react";
import { useAppContext } from "@/context/AppContext";
import { FeedbackTopic, Task } from "@/types";
import { FeedbackTopic, Task } from "@/types";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isSameDay, parseISO, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TopicContextPanel } from "@/components/dashboard/TopicContextPanel";
import { DepartmentTopicContextPanel } from "@/components/dashboard/DepartmentTopicContextPanel";
import { SignalExplanationPanel } from "@/components/dashboard/SignalExplanationPanel";
import { ActivityListPanel } from "@/components/dashboard/ActivityListPanel";

const topics: FeedbackTopic[] = [
  "Organização",
  "Comunicação",
  "Pro atividade",
  "Prioridades",
  "ICC",
  "KISS",
  "Reportar problemas",
];
const pieColors = [
  "hsl(217,91%,60%)",
  "hsl(262,83%,58%)",
  "hsl(25,95%,53%)",
  "hsl(142,71%,45%)",
  "hsl(174,72%,40%)",
  "hsl(340,82%,52%)",
  "hsl(45,93%,47%)",
];

type DrillDownState =
  | { type: "none" }
  | { type: "topic"; topic: FeedbackTopic }
  | { type: "dept-topic"; departmentId: string; topic: FeedbackTopic }
  | { type: "signal"; topic: string; count: number }
  | { type: "activities"; tasks: Task[]; title: string; parentState: DrillDownState };

export function ManagerDashboard() {
  const { filteredTasks, toggleSetting, users, departments } = useAppContext();
  const [drillDown, setDrillDown] = useState<DrillDownState>({ type: "none" });
  const [hoveredTopic, setHoveredTopic] = useState<string | null>(null);
  const [tooltipLocked, setTooltipLocked] = useState(false);
  const [lockedPayload, setLockedPayload] = useState<any>(null);

  const handleDotClick = useCallback((e: any) => {
    e?.stopPropagation?.();
    setTooltipLocked(true);
  }, []);

  const handleChartClick = useCallback(() => {
    if (tooltipLocked) {
      setTooltipLocked(false);
      setLockedPayload(null);
      setHoveredTopic(null);
    }
  }, [tooltipLocked]);

  const CustomTrendTooltip = useCallback(({ active, payload, label }: any) => {
    // When locked, use locked data; otherwise use live data
    const displayPayload = tooltipLocked && lockedPayload ? lockedPayload.payload : payload;
    const displayLabel = tooltipLocked && lockedPayload ? lockedPayload.label : label;
    const isActive = tooltipLocked || active;

    if (!isActive || !displayPayload?.length) return null;

    // Store payload when tooltip becomes active for locking
    if (active && payload?.length && !tooltipLocked) {
      // Will be captured on click
    }

    return (
      <div
        className="rounded-lg border border-border bg-card p-2 text-xs shadow-xl"
        style={{ color: 'hsl(var(--foreground))', pointerEvents: tooltipLocked ? 'auto' : 'none' }}
        onMouseLeave={() => {
          if (tooltipLocked) {
            setHoveredTopic(null);
          }
        }}
      >
        <p className="font-medium mb-1">{displayLabel}</p>
        {displayPayload.map((entry: any) => (
          <div key={entry.dataKey}
               onMouseEnter={() => tooltipLocked && setHoveredTopic(entry.dataKey)}
               onMouseLeave={() => tooltipLocked && setHoveredTopic(null)}
               className="flex items-center gap-2 px-1 py-0.5 rounded cursor-default transition-opacity"
               style={{ opacity: hoveredTopic && hoveredTopic !== entry.dataKey ? 0.3 : 1 }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: entry.color }} />
            <span>{entry.dataKey}</span>
            <span className="ml-auto font-medium">{entry.value}</span>
          </div>
        ))}
        {tooltipLocked && (
          <p className="text-[9px] text-muted-foreground mt-1 text-center">Passe o mouse para destacar</p>
        )}
      </div>
    );
  }, [hoveredTopic, tooltipLocked, lockedPayload]);

  const allFeedback = useMemo(() => filteredTasks.flatMap((t) => t.feedback), [filteredTasks]);

  const perTopicTotal = useMemo(() => {
    const counts: Record<string, number> = {};
    allFeedback.forEach((fb) => {
      counts[fb.topic] = (counts[fb.topic] || 0) + 1;
    });
    return topics
      .map((t) => ({ name: t, count: counts[t] || 0 }))
      .filter((e) => e.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [allFeedback]);

  const trendData = useMemo(() => {
    const today = new Date(2026, 2, 25);
    const days = Array.from({ length: 15 }, (_, i) => subDays(today, 14 - i));
    return days.map((day) => {
      const data: any = { date: format(day, "dd/MM", { locale: ptBR }) };
      topics.forEach((topic) => {
        data[topic] = allFeedback.filter((fb) => isSameDay(parseISO(fb.createdAt), day) && fb.topic === topic).length;
      });
      return data;
    });
  }, [allFeedback]);

  const heatmapData = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    filteredTasks.forEach((t) => {
      const taskUsers = t.assigneeIds.map(id => users.find(u => u.id === id)).filter(Boolean);
      taskUsers.forEach(user => {
        if (!user) return;
        const deptId = user.departmentId;
        if (!matrix[deptId]) matrix[deptId] = {};
        t.feedback.forEach((fb) => {
          matrix[deptId][fb.topic] = (matrix[deptId][fb.topic] || 0) + 1;
        });
      });
    });
    return matrix;
  }, [filteredTasks]);

  const maxHeat = useMemo(() => {
    let max = 0;
    Object.values(heatmapData).forEach((row) =>
      Object.values(row).forEach((v) => {
        if (v > max) max = v;
      }),
    );
    return max || 1;
  }, [heatmapData]);

  const recurringSignals = useMemo(() => {
    const topicCounts: Record<string, number> = {};
    allFeedback.forEach((fb) => {
      topicCounts[fb.topic] = (topicCounts[fb.topic] || 0) + 1;
    });
    return Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .filter((s) => s.count >= 3)
      .sort((a, b) => b.count - a.count);
  }, [allFeedback]);

  const activeDepartments = departments.filter((d) => heatmapData[d.id]);

  const handleBarClick = useCallback((data: any) => {
    if (data?.activePayload?.[0]) {
      const topic = data.activePayload[0].payload.name as FeedbackTopic;
      setDrillDown({ type: "topic", topic });
    }
  }, []);

  const handleCellClick = useCallback((deptId: string, topic: FeedbackTopic, count: number) => {
    if (count > 0) {
      setDrillDown({ type: "dept-topic", departmentId: deptId, topic });
    }
  }, []);

  const handleSignalClick = useCallback((topic: string, count: number) => {
    setDrillDown({ type: "signal", topic, count });
  }, []);

  const handleViewActivities = useCallback((tasks: Task[], title: string) => {
    setDrillDown((prev) => ({ type: "activities", tasks, title, parentState: prev }));
  }, []);

  const handleBack = useCallback(() => {
    setDrillDown((prev) => {
      if (prev.type === "activities") return prev.parentState;
      return { type: "none" };
    });
  }, []);

  const handleOpenTask = useCallback((_task: Task) => {
    // Task detail is opened via the main view's TaskCard/TaskDetailDialog
    // Close dashboard so user can interact with the task
    toggleSetting("managerDashboard");
  }, [toggleSetting]);

  const showDrillPanel = drillDown.type !== "none";

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="absolute inset-4 bg-card rounded-2xl border shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-foreground">Dashboard de Insights</h2>
          <Button variant="ghost" size="icon" onClick={() => toggleSetting("managerDashboard")}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Main charts area */}
          <ScrollArea className={showDrillPanel ? "flex-1 border-r" : "flex-1"}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
              {/* Bar chart: total feedback per topic */}
              <Card className="p-4 cursor-pointer hover:ring-1 hover:ring-primary/20 transition-shadow">
                <h3 className="text-sm font-semibold mb-3">Feedback por Tópico</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={perTopicTotal} onClick={handleBarClick}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ fontSize: 12, backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                    <Bar dataKey="count" fill="hsl(217,91%,60%)" radius={[4, 4, 0, 0]} className="cursor-pointer" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-muted-foreground mt-1">Clique em uma barra para explorar</p>
              </Card>

              {/* Line chart: topic trend over time */}
              <Card className="p-4">
                <h3 className="text-sm font-semibold mb-3">Tendência de Tópicos (15 dias)</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData} onClick={handleChartClick}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      offset={8}
                      content={<CustomTrendTooltip />}
                      isAnimationActive={false}
                      allowEscapeViewBox={{ x: true, y: true }}
                      trigger={tooltipLocked ? "click" : "hover"}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 9 }} />
                    {topics.map((topic, i) => (
                      <Line
                        key={topic}
                        type="monotone"
                        dataKey={topic}
                        stroke={pieColors[i % pieColors.length]}
                        strokeWidth={2}
                        dot={{ r: 3, cursor: 'pointer', strokeWidth: 0, fill: pieColors[i % pieColors.length] }}
                        activeDot={{ r: 5, cursor: 'pointer', onClick: handleDotClick }}
                        strokeOpacity={hoveredTopic === null || hoveredTopic === topic ? 1 : 0.15}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Heatmap: Department x Topic */}
              <Card className="p-4 lg:col-span-2">
                <h3 className="text-sm font-semibold mb-3">Matriz de Feedback por Departamento</h3>
                <p className="text-[10px] text-muted-foreground mb-2">Clique em uma célula para explorar</p>
                <div className="overflow-x-auto">
                  <div className="min-w-[600px]">
                    <div className="grid gap-1" style={{ gridTemplateColumns: `140px repeat(${topics.length}, 1fr)` }}>
                      <div></div>
                      {topics.map((t) => (
                        <div key={t} className="text-[10px] text-center text-muted-foreground font-medium px-1 truncate">
                          {t}
                        </div>
                      ))}
                    </div>
                    {activeDepartments.map((dept) => (
                      <div
                        key={dept.id}
                        className="grid gap-1 mt-1"
                        style={{ gridTemplateColumns: `140px repeat(${topics.length}, 1fr)` }}
                      >
                        <div className="text-xs truncate flex items-center font-medium">{dept.name}</div>
                        {topics.map((topic) => {
                          const count = heatmapData[dept.id]?.[topic] || 0;
                          const intensity = count / maxHeat;
                          return (
                            <div
                              key={topic}
                              onClick={() => handleCellClick(dept.id, topic, count)}
                              className={`h-8 rounded-md flex items-center justify-center text-[10px] font-medium transition-colors ${
                                count > 0 ? "cursor-pointer hover:ring-1 hover:ring-primary/30" : ""
                              }`}
                              style={{
                                background:
                                  count > 0 ? `hsl(217 91% 60% / ${0.1 + intensity * 0.6})` : "hsl(var(--muted) / 0.3)",
                                color: count > 0 ? `hsl(217 91% 60%)` : "transparent",
                              }}
                            >
                              {count > 0 ? count : ""}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Recurring signals per topic */}
              <Card className="p-4 lg:col-span-2">
                <h3 className="text-sm font-semibold mb-3">Sinais Recorrentes</h3>
                {recurringSignals.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhum sinal recorrente identificado</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {recurringSignals.map((signal, i) => (
                      <div
                        key={i}
                        onClick={() => handleSignalClick(signal.topic, signal.count)}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted/80 hover:ring-1 hover:ring-primary/20 transition-all"
                      >
                        <div>
                          <p className="text-xs font-medium">{signal.topic}</p>
                          <p className="text-[10px] text-muted-foreground">Frequência no período</p>
                        </div>
                        <span className="text-sm font-bold text-primary">{signal.count}×</span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </ScrollArea>

          {/* Drill-down side panel */}
          {showDrillPanel && (
            <div className="w-80 shrink-0 p-4 overflow-y-auto">
              {drillDown.type === "topic" && (
                <TopicContextPanel
                  topic={drillDown.topic}
                  onBack={handleBack}
                  onViewActivities={(tasks) =>
                    handleViewActivities(tasks, `Tópico: ${drillDown.topic}`)
                  }
                />
              )}
              {drillDown.type === "dept-topic" && (
                <DepartmentTopicContextPanel
                  departmentId={drillDown.departmentId}
                  topic={drillDown.topic}
                  onBack={handleBack}
                  onViewActivities={(tasks) =>
                    handleViewActivities(
                      tasks,
                      `${departments.find((d) => d.id === drillDown.departmentId)?.name} × ${drillDown.topic}`
                    )
                  }
                />
              )}
              {drillDown.type === "signal" && (
                <SignalExplanationPanel
                  topic={drillDown.topic}
                  count={drillDown.count}
                  onBack={handleBack}
                  onViewActivities={(tasks) =>
                    handleViewActivities(tasks, `Sinal: ${drillDown.topic}`)
                  }
                />
              )}
              {drillDown.type === "activities" && (
                <ActivityListPanel
                  tasks={drillDown.tasks}
                  title={drillDown.title}
                  onBack={handleBack}
                  onOpenTask={handleOpenTask}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
