"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createGroup } from "@/actions/group";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Loader2, Users, ChevronLeft, Sparkles, Plus } from "lucide-react";
import { toast } from "sonner";
import { searchUsers } from "@/actions/member";

export default function NewGroupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      if (memberEmail.length >= 3) {
        setIsSearching(true);
        try {
          const results = await searchUsers(memberEmail);
          if (active) {
            setSuggestions(results.filter(u => u.email && !members.includes(u.email)));
          }
        } catch (error) {
          console.error(error);
        } finally {
          if (active) setIsSearching(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [memberEmail, members]);

  const addMember = (email?: string) => {
    const targetEmail = email || memberEmail;
    if (targetEmail && !members.includes(targetEmail)) {
      setMembers([...members, targetEmail]);
      setMemberEmail("");
      setSuggestions([]);
    }
  };

  const removeMember = (email: string) => {
    setMembers(members.filter(m => m !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createGroup({ name, description, members });
      toast.success("Group created successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-72 h-72 bg-orange-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 -right-20 w-72 h-72 bg-amber-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-[500px] z-10 space-y-8">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="group text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Button>

        <Card className="bento-card glass-card border-white/5 overflow-hidden shadow-2xl">
          <CardHeader className="space-y-4 pb-8 border-b border-white/5">
            <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-orange-500/20">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-2">
                Create New Group
                <Sparkles className="h-5 w-5 text-orange-500" />
              </CardTitle>
              <CardDescription className="text-lg font-medium text-muted-foreground/80">
                Organize your expenses with friends, family, or flatmates.
              </CardDescription>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 pt-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Group Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Europe Trip 2024, Flat No. 402"
                  className="h-14 text-lg font-bold rounded-2xl bg-white/5 border-white/10 focus:ring-orange-500/50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Description (Optional)
                </Label>
                <Input
                  id="description"
                  placeholder="What's this group for?"
                  className="h-14 text-sm font-medium rounded-2xl bg-white/5 border-white/10"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-8 rounded-full bg-orange-500" />
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Add Members (by Email)
                  </Label>
                </div>
                
                <div className="flex gap-2 relative">
                  <div className="relative flex-1">
                    <Input
                      placeholder="friend@example.com"
                      className="h-14 rounded-2xl bg-white/5 border-white/10 pr-10 focus:ring-orange-500/50"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addMember();
                        }
                      }}
                    />
                    
                    {suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in duration-200">
                        {suggestions.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => addMember(user.email)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-orange-500/10 rounded-xl transition-colors text-left group"
                          >
                            <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold uppercase text-[10px]">
                              {user.name?.[0] || user.email[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold truncate group-hover:text-orange-500">{user.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                            </div>
                            <Plus className="h-4 w-4 text-muted-foreground group-hover:text-orange-500" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    onClick={() => addMember()} 
                    className="h-14 px-8 rounded-2xl bg-white/10 hover:bg-white/20 font-bold transition-all active:scale-95"
                  >
                    Add
                  </Button>
                </div>

                {members.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <p className="text-[9px] font-black uppercase text-muted-foreground/50 tracking-tighter ml-1">Group Members List</p>
                    <div className="flex flex-wrap gap-2">
                      {members.map((email) => (
                        <div 
                          key={email} 
                          className="group flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 pl-4 pr-2 py-2 rounded-2xl text-sm font-bold text-orange-500 hover:bg-orange-500/20 transition-all"
                        >
                          {email}
                          <button 
                            type="button" 
                            onClick={() => removeMember(email)} 
                            className="h-6 w-6 rounded-lg bg-orange-500/20 flex items-center justify-center hover:bg-orange-500/40 transition-colors"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            
            <div className="h-8" /> {/* Extra Gap */}

            <CardFooter className="pt-6 pb-10 px-8">
              <Button 
                type="submit" 
                className="w-full h-16 text-xl font-black rounded-2xl bg-orange-500 hover:bg-orange-600 shadow-[0_0_30px_rgba(255,140,50,0.3)] transition-all active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                ) : (
                  "Create Group"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground/50 font-medium">
          Premium Expense Tracking &bull; Secure & Real-time
        </p>
      </div>
    </div>
  );
}
