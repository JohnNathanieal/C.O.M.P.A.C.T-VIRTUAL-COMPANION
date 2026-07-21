import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Zap, CheckCircle2, AlertCircle, Loader2, ChevronRight, Clock, FileText, Volume2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { speak } from "@/lib/tts";

const FunctionDisplay = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false);
  const name = toolCall?.name || 'Function';
  const status = toolCall?.status || 'pending';
  const results = toolCall?.results;
  const displayProjection = toolCall?.display_projection;
  const hideDetails = !!displayProjection?.hide_details && !!displayProjection?.details_redacted;

  const parsedResults = (() => {
    if (!results) return null;
    try { return typeof results === 'string' ? JSON.parse(results) : results; } catch { return results; }
  })();

  const isError = results && (
    (typeof results === 'string' && /error|failed/i.test(results)) ||
    (parsedResults?.success === false)
  );

  const statusConfig = {
    pending: { icon: Clock, color: 'text-muted-foreground', text: 'Pending' },
    running: { icon: Loader2, color: 'text-primary', text: 'Processing...', spin: true },
    in_progress: { icon: Loader2, color: 'text-primary', text: 'Processing...', spin: true },
    completed: isError
      ? { icon: AlertCircle, color: 'text-destructive', text: 'Failed' }
      : { icon: CheckCircle2, color: 'text-primary', text: 'Done' },
    success: { icon: CheckCircle2, color: 'text-primary', text: 'Done' },
    failed: { icon: AlertCircle, color: 'text-destructive', text: 'Failed' },
    error: { icon: AlertCircle, color: 'text-destructive', text: 'Failed' }
  }[status] || { icon: Zap, color: 'text-muted-foreground', text: '' };

  const Icon = statusConfig.icon;
  const formattedName = name.split('.').reverse().join(' ').toLowerCase();

  if (hideDetails) {
    const isActive = status === 'running' || status === 'pending' || status === 'in_progress';
    const isFailed = status === 'failed' || status === 'error' || isError;
    const StateIcon = isActive ? Loader2 : isFailed ? AlertCircle : CheckCircle2;
    const label = isActive ? displayProjection.active_label : isFailed ? displayProjection.error_label : displayProjection.label;
    return (
      <div className="mt-2 text-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-secondary text-muted-foreground">
          <FileText className="h-3 w-3" />
          <span>{label || statusConfig.text || formattedName}</span>
          <StateIcon className={cn("h-3 w-3", isActive && "animate-spin text-primary", isFailed && "text-destructive", !isActive && !isFailed && "text-primary")} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 text-xs">
      <button onClick={() => setExpanded(!expanded)} className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all hover:bg-secondary", expanded ? "bg-secondary border-primary/30" : "bg-card border-border")}>
        <Icon className={cn("h-3 w-3", statusConfig.color, statusConfig.spin && "animate-spin")} />
        <span className="text-foreground">{formattedName}</span>
        {statusConfig.text && <span className={cn("text-muted-foreground", isError && "text-destructive")}>• {statusConfig.text}</span>}
        {!statusConfig.spin && (toolCall.arguments_string || results) && <ChevronRight className={cn("h-3 w-3 text-muted-foreground transition-transform ml-auto", expanded && "rotate-90")} />}
      </button>
      {expanded && !statusConfig.spin && (
        <div className="mt-1.5 ml-3 pl-3 border-l-2 border-border space-y-2">
          {toolCall.arguments_string && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Parameters:</div>
              <pre className="bg-secondary rounded-md p-2 text-xs text-foreground/80 whitespace-pre-wrap">
                {(() => { try { return JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2); } catch { return toolCall.arguments_string; } })()}
              </pre>
            </div>
          )}
          {parsedResults && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Result:</div>
              <pre className="bg-secondary rounded-md p-2 text-xs text-foreground/80 whitespace-pre-wrap max-h-48 overflow-auto">
                {typeof parsedResults === 'object' ? JSON.stringify(parsedResults, null, 2) : parsedResults}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center mt-0.5 shrink-0">
          <Zap className="h-4 w-4 text-primary" />
        </div>
      )}
      <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
        {message.content && (
          <div className={cn("rounded-2xl px-4 py-2.5", isUser ? "bg-primary text-primary-foreground" : "bg-card border border-border")}>
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <ReactMarkdown className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                components={{
                  p: ({ children }) => <p className="my-1 leading-relaxed text-foreground">{children}</p>,
                  ul: ({ children }) => <ul className="my-1 ml-4 list-disc text-foreground">{children}</ul>,
                  ol: ({ children }) => <ol className="my-1 ml-4 list-decimal text-foreground">{children}</ol>,
                  li: ({ children }) => <li className="my-0.5 text-foreground">{children}</li>,
                  strong: ({ children }) => <strong className="text-primary font-semibold">{children}</strong>,
                  code: ({ inline, children }) => inline
                    ? <code className="px-1 py-0.5 rounded bg-secondary text-primary text-xs">{children}</code>
                    : <pre className="bg-secondary rounded-lg p-3 overflow-x-auto my-2"><code className="text-xs text-foreground">{children}</code></pre>,
                  a: ({ children, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline">{children}</a>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        )}
        {!isUser && message.content && (
          <button onClick={() => speak(message.content)} className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
            <Volume2 className="h-3 w-3" /> Speak
          </button>
        )}
        {message.tool_calls?.length > 0 && (
          <div className="space-y-1">
            {message.tool_calls.map((tc, i) => <FunctionDisplay key={i} toolCall={tc} />)}
          </div>
        )}
      </div>
    </div>
  );
}