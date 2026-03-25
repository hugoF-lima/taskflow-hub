import { useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { users, departments } from "@/data/mockData";
import { FeedbackTopic, Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building2, Workflow, Layers, AlertTriangle } from "lucide-react";

interface Props {
  topic: string;
  count: number;
  onBack: () => void;
  onViewActivities: (tasks: Task[]) => void;
}

export function SignalExplanationPanel({ topic, count, onBack, onViewActivities }: Props) {
  const { filteredTasks } = useAppContext();

  const analysis = useMemo(() => {
    const relevant = filteredTasks.filter((t) =>
      t.feedback.some((fb) => fb.topic === topic)
    );

    // Departments most involved
    const deptMap = new Map<string, number>();
    relevant.forEach((t) => {
      const user = users.find((u) => u.id === t.assigneeId);
      if (user) {
        deptMap.set(user.departmentId, (deptMap.get(user.departmentId) || 0) + 1);
      }
    });
    const departmentsInvolved = Array.from(deptMap.entries())
      .map(([id, cnt]) => ({
        dept: departments.find((d) => d.id === id),
        count: cnt,
      }))
      .filter((d) => d.dept)
      .sort((a, b) => b.count - a.count);

    // Process/workflow stages
    const processMap = new Map<string, number>();
    relevant.forEach((t) => {
      processMap.set(t.process, (processMap.get(t.process) || 0) + 1);
    });
    const processClusters = Array.from(processMap.entries())
      .map(([process, cnt]) => ({ process, count: cnt }))
      .sort((a, b) => b.count - a.count);

    // Contexts where signal appears (feedback type breakdown)
    const contextMap = new Map<string, number>();
    relevant.forEach((t) => {
      t.feedback
        .filter((fb) => fb.topic === topic)
        .forEach((fb) => {
          contextMap.set(fb.type, (contextMap.get(fb.type) || 0) + 1);
        });
    });
    const contexts = Array.from(contextMap.entries())
      .map(([type, cnt]) => ({ type, count: cnt }))
      .sort((a, b) => b.count - a.count);

    return {
      tasks: relevant,
      total: relevant.length,
      departmentsInvolved,
      processClusters,
      contexts,
    };
  }, [filteredTasks, topic]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-7 w-7">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground truncate">
            Sinal: {topic}
          </h3>
        </div>
        <Badge variant="secondary" className="text-xs shrink-0">
          {count}× ocorrências
        </Badge>
      </div>

      <Separator />

      {/* Contexts where signal appears */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <AlertTriangle className="h-3.5 w-3.5" />
          Contextos de ocorrência
        </div>
        <div className="space-y-1">
          {analysis.contexts.map(({ type, count: cnt }) => (
            <div
              key={type}
              className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5"
            >
              <span className="text-xs font-medium capitalize">{type}</span>
              <span className="text-xs text-muted-foreground">{cnt}×</span>
            </div>
          ))}
        </div>
      </div>

      {/* Departments most involved */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          Departamentos mais envolvidos
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {analysis.departmentsInvolved.map(({ dept, count: cnt }) => (
            <div
              key={dept!.id}
              className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5"
            >
              <span className="text-xs font-medium">{dept!.name}</span>
              <span className="text-xs text-muted-foreground">{cnt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Workflow stages */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Workflow className="h-3.5 w-3.5" />
          Processos mais envolvidos
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {analysis.processClusters.map(({ process, count: cnt }) => (
            <div
              key={process}
              className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5"
            >
              <span className="text-xs font-medium">{process}</span>
              <span className="text-xs text-muted-foreground">{cnt}</span>
            </div>
          ))}
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
