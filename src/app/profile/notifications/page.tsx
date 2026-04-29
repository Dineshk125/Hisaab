"use client";

import { useEffect, useState } from "react";
import { getNotifications, markAsRead, markAllAsRead } from "@/actions/notification";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, ChevronLeft, CheckCheck, Loader2, Receipt, Wallet, Users } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id: string) {
    await markAsRead(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  }

  async function handleMarkAllRead() {
    await markAllAsRead();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success("All marked as read");
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "EXPENSE": return <Receipt className="h-4 w-4" />;
      case "SETTLE": return <Wallet className="h-4 w-4" />;
      case "GROUP": return <Users className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 pb-32">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/profile">
            <Button variant="ghost" className="pl-0 hover:bg-transparent text-muted-foreground hover:text-orange-500 transition-colors">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          {notifications.some(n => !n.read) && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-orange-500 font-bold hover:text-orange-600">
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
            <Bell className="h-8 w-8 text-orange-500" />
            Notifications
          </h1>
          <p className="text-muted-foreground font-medium">Stay updated with your group activities.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 rounded-3xl border-2 border-dashed border-white/5 flex flex-col items-center text-center space-y-4 bg-white/5">
            <div className="p-4 bg-orange-500/10 rounded-2xl">
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <Card 
                key={n.id} 
                className={`bento-card glass-card overflow-hidden transition-all duration-300 ${!n.read ? 'border-orange-500/30 bg-orange-500/5' : 'border-white/5'}`}
                onClick={() => !n.read && handleMarkRead(n.id)}
              >
                <CardContent className="p-5 flex gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${!n.read ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-bold truncate ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                      <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
