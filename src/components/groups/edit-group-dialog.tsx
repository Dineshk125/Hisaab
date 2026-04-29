"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Loader2 } from "lucide-react";
import { updateGroup } from "@/actions/group";
import { toast } from "sonner";

export function EditGroupDialog({ group }: { group: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateGroup(group.id, { name, description });
      setOpen(false);
      toast.success("Group updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-orange-500/10 hover:text-orange-500">
          <Settings className="h-5 w-5" />
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px] bento-card glass-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">Group Settings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Group Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl bg-white/5 border-white/10"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl bg-white/5 border-white/10"
              placeholder="e.g. Goa Trip, Flatmates"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 h-12 text-lg font-bold">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
