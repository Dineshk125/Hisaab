import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { PlusCircle, CreditCard, UserPlus, Settings, Info, BellRing, UserCheck, RefreshCw, Trash2 } from "lucide-react";

interface ActivityTimelineProps {
  logs: any[];
}

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
  const getIcon = (action: string) => {
    switch (action) {
      case "ADD_EXPENSE": return <PlusCircle className="h-4 w-4 text-orange-500" />;
      case "SETTLE": return <CreditCard className="h-4 w-4 text-emerald-500" />;
      case "ADD_MEMBER":
      case "JOIN_GROUP": return <UserPlus className="h-4 w-4 text-blue-500" />;
      case "CREATE_GROUP": return <Settings className="h-4 w-4 text-slate-500" />;
      case "UPDATE_GROUP":
      case "UPDATE_EXPENSE": return <RefreshCw className="h-4 w-4 text-amber-500" />;
      case "DELETE_EXPENSE": return <Trash2 className="h-4 w-4 text-destructive" />;
      case "REMIND": return <BellRing className="h-4 w-4 text-pink-500" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMessage = (log: any) => {
    switch (log.action) {
      case "ADD_EXPENSE": return `added "${log.metadata.description}" - ₹${log.metadata.amount}`;
      case "UPDATE_EXPENSE": return `updated expense "${log.metadata.description}" - ₹${log.metadata.amount}`;
      case "DELETE_EXPENSE": return `deleted expense "${log.metadata.description}"`;
      case "SETTLE": return `settled ₹${log.metadata.amount}`;
      case "CREATE_GROUP": return `created the group "${log.metadata.groupName}"`;
      case "UPDATE_GROUP": return `updated group settings`;
      case "JOIN_GROUP": return `joined the group via invite link`;
      case "ADD_MEMBER": return `added ${log.metadata.newMember} to the group`;
      case "REMIND": return `sent a payment reminder`;
      default: return log.action.toLowerCase().replace('_', ' ');
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="text-xl font-black tracking-tight">Timeline</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-orange-500/20 before:via-muted before:to-transparent">
          {logs.map((log) => (
            <div key={log.id} className="relative flex items-start gap-4 group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border bg-card shadow-sm z-10 transition-all group-hover:scale-110 group-hover:border-orange-500/50">
                {getIcon(log.action)}
              </div>
              <div className="flex flex-col pt-1">
                <p className="text-sm font-medium leading-tight">
                  <span className="font-bold text-foreground">{log.user.name}</span>{" "}
                  <span className="text-muted-foreground">{getMessage(log)}</span>
                </p>
                <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/40 mt-1">
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-white/5">
              <p className="text-sm text-muted-foreground font-medium">No activity recorded yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
