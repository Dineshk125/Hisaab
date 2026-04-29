"use client";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Mic, Loader2, Edit2, Scale, ListTodo, Percent } from "lucide-react";
import { addExpense, updateExpense } from "@/actions/expense";
import { Checkbox } from "@/components/ui/checkbox";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { parseVoiceCommand } from "@/actions/voice";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type SplitMode = "equal" | "exact" | "percentage";

export function AddExpenseDialog({ 
  group, 
  currentUser, 
  expense = null 
}: { 
  group: any; 
  currentUser: any; 
  expense?: any;
}) {
  const isEdit = !!expense;
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(isEdit ? expense.amount.toString() : "");
  const [description, setDescription] = useState(isEdit ? expense.description : "");
  const [category, setCategory] = useState(isEdit ? expense.category : "Other");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [paidById, setPaidById] = useState(isEdit ? expense.paidById : currentUser.id);
  const [date, setDate] = useState(isEdit ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  
  // Custom split state: { userId: stringValue }
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    if (isEdit && expense.splits) {
      const initialValues: Record<string, string> = {};
      const initialSelected: string[] = [];
      expense.splits.forEach((s: any) => {
        initialValues[s.userId] = s.amount.toString();
        initialSelected.push(s.userId);
      });
      setCustomValues(initialValues);
      setSelectedUsers(initialSelected);
      
      // Heuristic to detect mode (simplified)
      setSplitMode("exact");
    } else {
      setSelectedUsers(group.members.map((m: any) => m.userId));
    }
  }, [isEdit, expense, group.members]);

  const { isListening, transcript, startListening } = useVoiceInput();

  useEffect(() => {
    if (transcript) {
      const parse = async () => {
        const result = await parseVoiceCommand(transcript, group.members);
        if (result) {
          if (result.amount) setAmount(result.amount.toString());
          if (result.description) setDescription(result.description);
          if (result.category) setCategory(result.category);
          if (result.mentionedUsers?.length > 0) {
            const userIds = result.mentionedUsers.map((u: any) => typeof u === 'string' ? u : u.id);
            setSelectedUsers(userIds);
          }
        }
      };
      parse();
    }
  }, [transcript, group.members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const totalAmount = parseFloat(amount);
    let splits: { userId: string; amount: number }[] = [];

    if (splitMode === "equal") {
      const splitAmount = totalAmount / selectedUsers.length;
      splits = selectedUsers.map((userId) => ({
        userId,
        amount: Number(splitAmount.toFixed(2)),
      }));
    } else if (splitMode === "exact") {
      splits = selectedUsers.map((userId) => ({
        userId,
        amount: parseFloat(customValues[userId] || "0"),
      }));
      
      const customTotal = splits.reduce((acc, s) => acc + s.amount, 0);
      if (Math.abs(customTotal - totalAmount) > 0.01) {
        toast.error(`Total split (₹${customTotal.toFixed(2)}) must equal Total amount (₹${totalAmount.toFixed(2)})`);
        setLoading(false);
        return;
      }
    } else if (splitMode === "percentage") {
      splits = selectedUsers.map((userId) => {
        const pct = parseFloat(customValues[userId] || "0");
        return {
          userId,
          amount: Number((totalAmount * pct / 100).toFixed(2)),
        };
      });

      const totalPct = selectedUsers.reduce((acc, id) => acc + parseFloat(customValues[id] || "0"), 0);
      if (Math.abs(totalPct - 100) > 0.01) {
        toast.error(`Total percentage must be 100% (currently ${totalPct}%)`);
        setLoading(false);
        return;
      }
    }

    try {
      if (isEdit) {
        await updateExpense(expense.id, {
          amount: totalAmount,
          description,
          category: isCustomCategory ? customCategory : category,
          groupId: group.id,
          paidById,
          splits,
          date,
        });
        toast.success("Expense updated!");
      } else {
        await addExpense({
          amount: totalAmount,
          description,
          category: isCustomCategory ? customCategory : category,
          groupId: group.id,
          paidById,
          splits,
          date,
        });
        toast.success("Expense added!");
      }
      setOpen(false);
      if (!isEdit) resetForm();
    } catch (error: any) {
      toast.error(error.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setCategory("Other");
    setPaidById(currentUser.id);
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedUsers(group.members.map((m: any) => m.userId));
    setCustomValues({});
    setSplitMode("equal");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        isEdit ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-orange-500">
            <Edit2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button size="sm" className="rounded-xl h-10 px-4 shadow-lg bg-orange-500 hover:bg-orange-600 transition-all hover:scale-105 active:scale-95">
            <Plus className="mr-1.5 h-4 w-4" />
            <span className="text-xs font-bold">Add Expense</span>
          </Button>
        )
      } />
      <DialogContent className="sm:max-w-[500px] bento-card glass-card">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEdit ? "Edit Expense" : "New Expense"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">₹</span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-7 text-lg font-black rounded-xl bg-white/5 border-white/10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</Label>
              <Select value={isCustomCategory ? "Custom" : category} onValueChange={(v) => {
                if (v === "Custom") {
                  setIsCustomCategory(true);
                } else {
                  setIsCustomCategory(false);
                  setCategory(v);
                }
              }}>
                <SelectTrigger className="rounded-xl bg-white/5 border-white/10">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="glass-card max-h-[300px]">
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                  <SelectItem value="Bills">Bills</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Medical">Medical</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Entertainment">Entertainment</SelectItem>
                  <SelectItem value="Investment">Investment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Custom" className="text-orange-500 font-bold italic">+ Custom...</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</Label>
              <Input
                type="date"
                className="rounded-xl bg-white/5 border-white/10"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {isCustomCategory && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Label className="text-[10px] font-black uppercase tracking-widest text-orange-500">Custom Category Name</Label>
              <Input
                placeholder="e.g. Subscription, Gym, etc."
                className="rounded-xl bg-orange-500/5 border-orange-500/20 focus:border-orange-500/50"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</Label>
            <div className="relative">
              <Input
                placeholder="What was this for?"
                className="rounded-xl bg-white/5 border-white/10 pr-10"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className={`absolute right-1 top-1/2 -translate-y-1/2 ${isListening ? 'text-orange-500 animate-pulse' : 'text-muted-foreground'}`}
                onClick={startListening}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Split Mode</Label>
              <Tabs value={splitMode} onValueChange={(v: any) => setSplitMode(v)}>
                <TabsList className="grid w-[240px] grid-cols-3 h-8 p-1 bg-muted/50 rounded-lg">
                  <TabsTrigger value="equal" className="text-[9px] uppercase font-bold py-1"><Scale className="h-3 w-3 mr-1" /> Equal</TabsTrigger>
                  <TabsTrigger value="exact" className="text-[9px] uppercase font-bold py-1"><ListTodo className="h-3 w-3 mr-1" /> Exact</TabsTrigger>
                  <TabsTrigger value="percentage" className="text-[9px] uppercase font-bold py-1"><Percent className="h-3 w-3 mr-1" /> %</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="space-y-3 p-4 rounded-2xl bg-muted/30 border border-white/5 max-h-[220px] overflow-y-auto custom-scrollbar">
              {group.members.map((member: any) => (
                <div key={member.userId} className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <Checkbox 
                      id={`user-${member.userId}`} 
                      checked={selectedUsers.includes(member.userId)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUsers([...selectedUsers, member.userId]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== member.userId));
                        }
                      }}
                    />
                    <Label htmlFor={`user-${member.userId}`} className="text-sm font-medium cursor-pointer truncate">
                      {member.user.name}
                    </Label>
                  </div>
                  
                  {splitMode !== "equal" && selectedUsers.includes(member.userId) && (
                    <div className="relative w-24">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-50">
                        {splitMode === "percentage" ? "%" : "₹"}
                      </span>
                      <Input
                        type="number"
                        placeholder="0"
                        className="h-8 pl-5 text-xs font-bold rounded-lg bg-white/5 border-white/10"
                        value={customValues[member.userId] || ""}
                        onChange={(e) => setCustomValues({ ...customValues, [member.userId]: e.target.value })}
                      />
                    </div>
                  )}
                  
                  {splitMode === "equal" && selectedUsers.includes(member.userId) && (
                    <div className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">
                      ₹{(parseFloat(amount || "0") / selectedUsers.length || 0).toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl bg-orange-500 hover:bg-orange-600 shadow-lg" disabled={loading || selectedUsers.length === 0}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Update Expense" : "Save Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
