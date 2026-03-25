import { Task } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { urgencyConfig } from "@/data/mockData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Props {
  tasks: Task[];
  title: string;
  onBack: () => void;
  onOpenTask: (task: Task) => void;
}

export function ActivityListPanel({ tasks, title, onBack, onOpenTask }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-7 w-7">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-sm font-bold text-foreground">Atividades de exemplo</h3>
        <Badge variant="secondary" className="ml-auto text-xs">
          {tasks.length}
        </Badge>
      </div>

      <p className="text-[10px] text-muted-foreground">
        {title} — clique em uma atividade para ver detalhes completos.
      </p>

      <Separator />

      <div className="space-y-1.5">
        {tasks.slice(0, 10).map((task) => {
          const urg = urgencyConfig[task.urgency];
          return (
            <button
              key={task.id}
              onClick={() => onOpenTask(task)}
              className="w-full text-left rounded-md bg-muted/40 hover:bg-muted/70 transition-colors px-3 py-2 space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium truncate">{task.title}</span>
                <Badge
                  variant="outline"
                  className="text-[9px] shrink-0"
                  style={{ borderColor: `hsl(${urg.color})`, color: `hsl(${urg.color})` }}
                >
                  {urg.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <span>{task.code}</span>
                <span>·</span>
                <span>{task.process}</span>
                <span>·</span>
                <span>{format(new Date(task.deadline), "dd/MM", { locale: ptBR })}</span>
              </div>
            </button>
          );
        })}
        {tasks.length > 10 && (
          <p className="text-[10px] text-muted-foreground text-center pt-1">
            +{tasks.length - 10} atividades adicionais
          </p>
        )}
      </div>
    </div>
  );
}
