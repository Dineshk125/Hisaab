"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, Copy, Check, X } from "lucide-react";
import { addMemberByEmail, removeMember } from "@/actions/member";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

export function ManageMembers({ group, currentUser }: { group: any; currentUser: any }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addMemberByEmail(group.id, email);
      setEmail("");
      toast.success("Member added successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await removeMember(group.id, userId);
      toast.success("Member removed");
    } catch (error: any) {
      toast.error(error.message || "Failed to remove member");
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${group.inviteCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Invite link copied!");
  };

  const isAdmin = group.adminId === currentUser.id;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" className="rounded-xl border-orange-500/20 hover:bg-orange-500/5 text-orange-500">
          <UserPlus className="mr-2 h-4 w-4" />
          Members
        </Button>
      } />
      <DialogContent className="sm:max-w-[450px] bento-card glass-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Manage Members</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8 py-4">
          {/* Add Member Form */}
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Add by Email</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="friend@example.com"
                  className="rounded-xl bg-white/5 border-white/10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" disabled={loading} className="rounded-xl bg-orange-500 hover:bg-orange-600">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                </Button>
              </div>
            </div>
          </form>

          {/* Quick Invite Link */}
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Share Invite Link</Label>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 border border-white/5">
              <code className="flex-1 text-xs truncate opacity-50">
                {typeof window !== 'undefined' ? `${window.location.origin}/join/${group.inviteCode}` : '...'}
              </code>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={copyInviteLink}>
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Member List */}
          <div className="space-y-4">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Group Members ({group.members.length})</Label>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {group.members.map((m: any) => (
                <div key={m.userId} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-white/10">
                      <AvatarFallback className="bg-orange-500/10 text-orange-500 font-bold uppercase">
                        {m.user.name?.[0] || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold truncate max-w-[150px]">{m.user.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">
                        {m.role} {m.userId === group.adminId && "• ADMIN"}
                      </p>
                    </div>
                  </div>
                  
                  {isAdmin && m.userId !== currentUser.id && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveMember(m.userId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
