"use client";

import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export function ExportPDFButton({ 
  expenses, 
  groupName,
  balances
}: { 
  expenses: any[]; 
  groupName: string;
  balances?: any[];
}) {
  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(22);
      doc.setTextColor(255, 140, 50); // Orange color
      doc.text("Hisaab Expense Report", 14, 22);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Group: ${groupName}`, 14, 30);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 37);
      
      // Expense Table
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text("Expense Details", 14, 50);
      
      const expenseData = expenses.map((exp) => [
        new Date(exp.createdAt).toLocaleDateString(),
        exp.description,
        exp.category,
        exp.paidBy?.name || "Unknown",
        `Rs. ${exp.amount.toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 55,
        head: [["Date", "Description", "Category", "Paid By", "Amount"]],
        body: expenseData,
        theme: 'grid',
        headStyles: { fillColor: [255, 140, 50] }
      });

      // Balances Section
      if (balances && balances.length > 0) {
        const finalY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(16);
        doc.text("Settlement Summary", 14, finalY);
        
        const balanceData = balances.map((b) => [
          `${b.fromName} owes ${b.toName}`,
          `Rs. ${b.amount.toFixed(2)}`
        ]);

        autoTable(doc, {
          startY: finalY + 5,
          head: [["Debt Description", "Amount"]],
          body: balanceData,
          theme: 'striped',
          headStyles: { fillColor: [50, 50, 50] }
        });
      }

      doc.save(`Hisaab_${groupName}_Report.pdf`);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={exportPDF} className="rounded-xl border-orange-500/20 hover:bg-orange-500/5 text-orange-500">
      <FileText className="mr-2 h-4 w-4" />
      PDF Report
    </Button>
  );
}
