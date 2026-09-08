export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  note?: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt?: string;
}

export interface MonthlyBudget {
  userId: string;
  month: string; // YYYY-MM
  budgetAmount: number;
  savingsGoal?: number;
  updatedAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  bgColor: string;
}

export interface MonthSummary {
  month: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  transactionCount: number;
  categoryBreakdown: {
    category: string;
    amount: number;
    percentage: number;
    type: TransactionType;
    count: number;
  }[];
  dailyBreakdown: {
    date: string;
    day: number;
    income: number;
    expense: number;
    balance: number;
  }[];
}
