"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Loader2, FileText, ChevronDown } from "lucide-react";
import { exportExpensesCSV } from "@/actions/export";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function ExportButton({ group, expenses, balances }: { group: any; expenses: any[]; balances: any }) {
  const [loading, setLoading] = useState(false);

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      const csv = await exportExpensesCSV(group.id);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${group.name.replace(/\s+/g, "_")}_expenses.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Expenses exported to CSV!");
    } catch (error) {
      toast.error("Failed to export CSV.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text(`Hisaab - ${group.name} Report`, 14, 15);
      
      const tableData = expenses.map(e => [
        new Date(e.createdAt).toLocaleDateString(),
        e.description,
        e.category,
        e.paidBy.name,
        `INR ${e.amount.toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 20,
        head: [['Date', 'Description', 'Category', 'Paid By', 'Amount']],
        body: tableData,
      });

      doc.save(`${group.name.replace(/\s+/g, "_")}_report.pdf`);
      toast.success("Report exported to PDF!");
    } catch (error) {
      toast.error("Failed to generate PDF.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="outline" size="sm" className="rounded-xl border-white/10 hover:bg-white/5 font-bold h-9 gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      } />
      <DropdownMenuContent align="end" className="glass-card rounded-2xl border-white/5 p-2 min-w-[160px]">
        <DropdownMenuItem onClick={handleExportCSV} className="rounded-xl gap-2 font-medium cursor-pointer py-3">
          <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
          CSV Spreadsheet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF} className="rounded-xl gap-2 font-medium cursor-pointer py-3">
          <FileText className="h-4 w-4 text-red-500" />
          PDF Document
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
