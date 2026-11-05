import { Category, CategorySummaryItem, MonthlyStats, Transaction } from '../types/finance';

export function filterTransactionsByMonth(
  transactions: Transaction[],
  month: number, // 0-11
  year: number
): Transaction[] {
  return transactions.filter((t) => {
    if (!t.date) return false;
    const parts = t.date.split('-');
    if (parts.length < 3) return false;
    const tYear = parseInt(parts[0], 10);
    const tMonth = parseInt(parts[1], 10) - 1; // 0-indexed
    return tYear === year && tMonth === month;
  });
}

export function computeMonthlyStats(
  transactions: Transaction[],
  categories: Category[],
  month: number,
  year: number
): MonthlyStats {
  const monthTransactions = filterTransactionsByMonth(transactions, month, year);

  let totalIncome = 0;
  let totalExpense = 0;

  const incomeMap: Record<string, { total: number; count: number; name: string; color: string }> = {};
  const expenseMap: Record<string, { total: number; count: number; name: string; color: string }> = {};

  // Build category color lookup
  const categoryLookup = new Map<string, Category>();
  categories.forEach((c) => {
    categoryLookup.set(c.id, c);
    categoryLookup.set(c.name.toLowerCase(), c);
  });

  const getCatColor = (id: string, name: string, fallback: string) => {
    const found = categoryLookup.get(id) || categoryLookup.get(name.toLowerCase());
    return found?.color || fallback;
  };

  monthTransactions.forEach((t) => {
    const amt = Math.max(0, Number(t.amount) || 0);
    if (t.type === 'income') {
      totalIncome += amt;
      const key = t.categoryId || t.categoryName;
      if (!incomeMap[key]) {
        incomeMap[key] = {
          total: 0,
          count: 0,
          name: t.categoryName || 'Pemasukan Lainnya',
          color: getCatColor(t.categoryId, t.categoryName, '#059669'),
        };
      }
      incomeMap[key].total += amt;
      incomeMap[key].count += 1;
    } else {
      totalExpense += amt;
      const key = t.categoryId || t.categoryName;
      if (!expenseMap[key]) {
        expenseMap[key] = {
          total: 0,
          count: 0,
          name: t.categoryName || 'Pengeluaran Lainnya',
          color: getCatColor(t.categoryId, t.categoryName, '#e11d48'),
        };
      }
      expenseMap[key].total += amt;
      expenseMap[key].count += 1;
    }
  });

  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  // Transform income map to sorted list
  const incomeCategories: CategorySummaryItem[] = Object.entries(incomeMap)
    .map(([id, item]) => ({
      id,
      name: item.name,
      total: item.total,
      count: item.count,
      percentage: totalIncome > 0 ? (item.total / totalIncome) * 100 : 0,
      color: item.color,
    }))
    .sort((a, b) => b.total - a.total);

  // Transform expense map to sorted list
  const expenseCategories: CategorySummaryItem[] = Object.entries(expenseMap)
    .map(([id, item]) => ({
      id,
      name: item.name,
      total: item.total,
      count: item.count,
      percentage: totalExpense > 0 ? (item.total / totalExpense) * 100 : 0,
      color: item.color,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    month,
    year,
    totalIncome,
    totalExpense,
    netBalance,
    savingsRate,
    transactionCount: monthTransactions.length,
    incomeCategories,
    expenseCategories,
  };
}
