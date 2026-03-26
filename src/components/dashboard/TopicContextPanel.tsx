import { useMemo, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { FeedbackTopic, Task } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building2, Workflow, Layers, Activity } from "lucide-react";

interface Props {
  topic: FeedbackTopic;
  onBack: () => void;
  onViewActivities: (tasks: Task[]) => void;
}

export function TopicContextPanel({ topic, onBack, onViewActivities }: Props) {
  const { filteredTasks, users, departments } = useAppContext();

  const analysis = useMemo(() => {
    const relevant = filteredTasks.filter((t) =>
      t.feedback.some((fb) => fb.topic === topic)
    );

    // Departments involved
    const deptMap = new Map<string, number>();
    relevant.forEach((t) => {
      t.assigneeIds.forEach(uid => {
        const user = users.find((u) => u.id === uid);
        if (user) {
          deptMap.set(user.departmentId, (deptMap.get(user.departmentId) || 0) + 1);
        }
      });
    });
    const departmentsInvolved = Array.from(deptMap.entries())
      .map(([id, count]) => ({
        dept: departments.find((d) => d.id === id),
        count,
      }))
      .filter((d) => d.dept)
      .sort((a, b) => b.count - a.count);

    // Workflow/process clusters
    const processMap = new Map<string, number>();
    relevant.forEach((t) => {
      processMap.set(t.process, (processMap.get(t.process) || 0) + 1);
    });
    const processClusters = Array.from(processMap.entries())
      .map(([process, count]) => ({ process, count }))
      .sort((a, b) => b.count - a.count);

    // Deadline proximity clusters
    const now = new Date(2026, 2, 25);
    let overdue = 0;
    let dueSoon = 0;
    let upcoming = 0;
    relevant.forEach((t) => {
      const dl = new Date(t.deadline);
      const diff = (dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (diff < 0) overdue++;
      else if (diff <= 3) dueSoon++;
      else upcoming++;
    });

    return {
      tasks: relevant,
      total: relevant.length,
      departmentsInvolved,
      processClusters,
      deadlineClusters: { overdue, dueSoon, upcoming },
    };
  }, [filteredTasks, topic]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-7 w-7">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-bold text-foreground">Contexto: {topic}</h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          {analysis.total} atividades
        </Badge>
      </div>

      <Separator />

      {/* Departments involved */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          Departamentos envolvidos
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {analysis.departmentsInvolved.map(({ dept, count }) => (
            <div
              key={dept!.id}
              className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5"
            >
              <span className="text-xs font-medium">{dept!.name}</span>
              <span className="text-xs text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Process clusters */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Workflow className="h-3.5 w-3.5" />
          Processos envolvidos
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {analysis.processClusters.map(({ process, count }) => (
            <div
              key={process}
              className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5"
            >
              <span className="text-xs font-medium">{process}</span>
              <span className="text-xs text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Deadline proximity */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Activity className="h-3.5 w-3.5" />
          Proximidade de prazo
        </div>
        <div className="flex gap-2">
          {analysis.deadlineClusters.overdue > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              {analysis.deadlineClusters.overdue} atrasadas
            </Badge>
          )}
          {analysis.deadlineClusters.dueSoon > 0 && (
            <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px]">
              {analysis.deadlineClusters.dueSoon} próximas
            </Badge>
          )}
          {analysis.deadlineClusters.upcoming > 0 && (
            <Badge variant="secondary" className="text-[10px]">
              {analysis.deadlineClusters.upcoming} futuras
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs"
        onClick={() => onViewActivities(analysis.tasks)}
      >
        <Layers className="h-3.5 w-3.5 mr-1.5" />
        Ver atividades de exemplo
      </Button>
    </div>
  );
}
