import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FeedbackTopic, FeedbackType } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageSquare, Send } from 'lucide-react';

const topics: FeedbackTopic[] = ['Organização', 'Comunicação', 'Pro atividade', 'Prioridades', 'ICC', 'KISS', 'Reportar problemas'];
const types: FeedbackType[] = ['precisa mais atenção', 'precisa um pouco mais de atenção', 'mandou bem!', 'cooperação'];

interface FeedbackModalProps {
  taskId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackModal({ taskId, open, onOpenChange }: FeedbackModalProps) {
  const { tasks, addFeedback } = useAppContext();
  const task = tasks.find(t => t.id === taskId);
  const [topic, setTopic] = useState<FeedbackTopic | ''>('');
  const [type, setType] = useState<FeedbackType | ''>('');
  const [comment, setComment] = useState('');
  const [anonymous, setAnonymous] = useState(true);

  if (!task) return null;

  const handleSubmit = () => {
    if (!topic || !type) return;
    addFeedback(taskId, { topic, type, comment: comment || undefined, anonymous, authorId: anonymous ? undefined : 'u1' });
    setTopic('');
    setType('');
    setComment('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="h-4 w-4 text-primary" />
            Feedback — {task.title}
          </DialogTitle>
        </DialogHeader>

        {/* New feedback form */}
        <div className="space-y-3 py-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Tópico</Label>
              <Select value={topic} onValueChange={v => setTopic(v as FeedbackTopic)}>
                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  {topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Tipo</Label>
              <Select value={type} onValueChange={v => setType(v as FeedbackType)}>
                <SelectTrigger className="h-8 text-xs mt-1"><SelectValue placeholder="Selecionar..." /></SelectTrigger>
                <SelectContent>
                  {types.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Comentário (opcional)</Label>
            <Textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              maxLength={450}
              className="mt-1 text-xs resize-none h-16"
              placeholder="Observações sobre o feedback..."
            />
            <p className="text-[10px] text-muted-foreground text-right mt-0.5">{comment.length}/450</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="anon" checked={anonymous} onCheckedChange={setAnonymous} />
              <Label htmlFor="anon" className="text-xs">Anônimo</Label>
            </div>
            <Button size="sm" onClick={handleSubmit} disabled={!topic || !type} className="gap-1.5 h-7 text-xs">
              <Send className="h-3 w-3" /> Incluir
            </Button>
          </div>
        </div>

        <Separator />

        {/* Feedback history */}
        <div className="flex-1 min-h-0">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Histórico ({task.feedback.length})</p>
          <ScrollArea className="h-[200px]">
            {task.feedback.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">Nenhum feedback registrado</p>
            ) : (
              <div className="space-y-2 pr-3">
                {[...task.feedback].reverse().map(fb => (
                  <div key={fb.id} className="p-2 rounded-md bg-muted/50 space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px] h-4">{fb.topic}</Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(fb.createdAt), "dd/MM/yy", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-xs">{fb.type}</p>
                    {fb.comment && <p className="text-[11px] text-muted-foreground">{fb.comment}</p>}
                    <p className="text-[10px] text-muted-foreground/60">{fb.anonymous ? 'Anônimo' : 'Identificado'}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
