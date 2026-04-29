"use client";

import { Card, CardContent } from "@/components/ui/card";
import { 
  Receipt, 
  Wallet, 
  UserPlus, 
  Settings, 
  Trash2, 
  Edit3, 
  History,
  CheckCircle2,
  XCircle,
  ArrowRight
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ACTION_ICONS: Record<string, any> = {
  ADD_EXPENSE: { icon: Receipt, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  UPDATE_EXPENSE: { icon: Edit3, color: "text-blue-500", bg: "bg-blue-500/10" },
  DELETE_EXPENSE: { icon: Trash2, color: "text-destructive", bg: "bg-destructive/10" },
  SETTLE: { icon: Wallet, color: "text-orange-500", bg: "bg-orange-500/10" },
  JOIN_GROUP: { icon: UserPlus, color: "text-purple-500", bg: "bg-purple-500/10" },
  DEFAULT: { icon: History, color: "text-muted-foreground", bg: "bg-muted/10" },
};

export function GroupTimeline({ logs }: { logs: any[] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="p-4 bg-muted rounded-full">
          <History className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold">No activity yet</h3>
          <p className="text-sm text-muted-foreground">Every expense and settlement will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-6 w-full">
      {logs.map((log, i) => {
        const config = ACTION_ICONS[log.action] || ACTION_ICONS.DEFAULT;
        const Icon = config.icon;

        return (
          <div key={log.id} className="relative flex items-start gap-4 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 50}ms` }}>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 shadow-xl ${config.bg} z-10`}>
              <Icon className={`h-5 w-5 ${config.color}`} />
            </div>
            
            <Card className="flex-1 bento-card glass-card border-white/5 hover:border-white/10 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[8px] font-bold uppercase bg-muted">
                        {log.user.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-bold">{log.user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {getActionText(log.action, log.metadata)}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                {log.metadata && (
                  <div className="mt-3 flex items-center gap-3">
                    {log.metadata.amount && (
                      <div className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-xs font-black text-orange-500">
                        ₹{log.metadata.amount.toLocaleString()}
                      </div>
                    )}
                    {log.metadata.description && (
                      <p className="text-xs text-muted-foreground italic truncate">
                        "{log.metadata.description}"
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

function getActionText(action: string, metadata: any) {
  switch (action) {
    case "ADD_EXPENSE": return "added a new expense";
    case "UPDATE_EXPENSE": return "updated an expense";
    case "DELETE_EXPENSE": return "deleted an expense";
    case "SETTLE": return "marked a payment as settled";
    case "JOIN_GROUP": return "joined the group";
    default: return "performed an action";
  }
}
