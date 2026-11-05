export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  amount: number; // in Rupiah (positive integer)
  wallet: string; // e.g. "Tunai / Kas", "BCA", "Mandiri", "GoPay"
  notes: string;
  createdAt: number;
}

export interface CategorySummaryItem {
  id: string;
  name: string;
  total: number;
  count: number;
  percentage: number;
  color: string;
}

export interface MonthlyStats {
  month: number; // 0-11
  year: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number; // percentage
  transactionCount: number;
  incomeCategories: CategorySummaryItem[];
  expenseCategories: CategorySummaryItem[];
}
