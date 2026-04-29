"use server";

import prisma from "../lib/prisma";

export async function exportExpensesCSV(groupId: string) {
  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: { paidBy: true },
    orderBy: { date: "desc" },
  });

  const headers = ["Date", "Description", "Category", "Amount", "Paid By"];
  const rows = expenses.map(e => [
    e.date.toISOString().split('T')[0],
    e.description,
    e.category,
    e.amount.toString(),
    e.paidBy.name
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(r => r.join(","))
  ].join("\n");

  return csvContent;
}
