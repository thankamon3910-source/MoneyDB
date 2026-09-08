import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Target,
  Percent,
  Edit3,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Layers
} from 'lucide-react';
import { formatCurrency, formatThaiMonth } from '../constants/categories';
import { MonthlyBudget } from '../types';

interface Props {
  selectedMonth: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  transactionCount: number;
  budget: MonthlyBudget | null;
  onOpenBudgetModal: () => void;
}

export const MonthlyOverview: React.FC<Props> = ({
  selectedMonth,
  totalIncome,
  totalExpense,
  netBalance,
  transactionCount,
  budget,
  onOpenBudgetModal,
}) => {
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netBalance / totalIncome) * 100)) : 0;
  
  // Calculate days in month & average daily expense
  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();
  const avgDailyExpense = daysInMonth > 0 ? totalExpense / daysInMonth : 0;

  // Budget calculations
  const budgetAmount = budget?.budgetAmount || 0;
  const budgetPercent = budgetAmount > 0 ? Math.min(100, Math.round((totalExpense / budgetAmount) * 100)) : 0;
  const remainingBudget = Math.max(0, budgetAmount - totalExpense);
  const isBudgetExceeded = budgetAmount > 0 && totalExpense > budgetAmount;
  const isBudgetWarning = budgetAmount > 0 && budgetPercent >= 80 && !isBudgetExceeded;

  return (
    <div className="space-y-4">
      {/* Overview Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Income */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">รายรับทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-600 font-['Plus_Jakarta_Sans',sans-serif]">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span>{transactionCount > 0 ? `จาก ${transactionCount} รายการ` : 'ยังไม่มีรายการ'}</span>
            </p>
          </div>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500 rounded-r-2xl" />
        </div>

        {/* Card 2: Total Expense */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">รายจ่ายทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-rose-600 font-['Plus_Jakarta_Sans',sans-serif]">
              {formatCurrency(totalExpense)}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              เฉลี่ย {formatCurrency(avgDailyExpense)} / วัน
            </p>
          </div>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-500 rounded-r-2xl" />
        </div>

        {/* Card 3: Net Balance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">คงเหลือสุทธิ</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              netBalance >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-2xl font-bold font-['Plus_Jakarta_Sans',sans-serif] ${
              netBalance >= 0 ? 'text-blue-600' : 'text-amber-600'
            }`}>
              {formatCurrency(netBalance)}
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Percent className="w-3 h-3 text-slate-400" />
              <span>อัตราการออม {savingsRate}% ของรายรับ</span>
            </p>
          </div>
          <div className={`absolute top-0 right-0 w-1.5 h-full rounded-r-2xl ${
            netBalance >= 0 ? 'bg-blue-500' : 'bg-amber-500'
          }`} />
        </div>

        {/* Card 4: Monthly Budget */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-violet-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">งบประมาณรายเดือน</span>
            <button
              id="btn-open-budget-modal"
              onClick={onOpenBudgetModal}
              title="ตั้งค่างบประมาณ"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-2">
            {budgetAmount > 0 ? (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
                    {formatCurrency(totalExpense)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    / {formatCurrency(budgetAmount)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isBudgetExceeded
                        ? 'bg-rose-500'
                        : isBudgetWarning
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (totalExpense / budgetAmount) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2 text-[11px]">
                  <span className={isBudgetExceeded ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                    {isBudgetExceeded ? 'เกินงบแล้ว' : `เหลือ ${formatCurrency(remainingBudget)}`}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {Math.round((totalExpense / budgetAmount) * 100)}%
                  </span>
                </div>
              </>
            ) : (
              <div className="py-2">
                <p className="text-xs text-slate-500 mb-2">ยังไม่ได้ตั้งเป้าหมายงบ</p>
                <button
                  id="btn-set-budget-card"
                  onClick={onOpenBudgetModal}
                  className="w-full py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors inline-flex items-center justify-center gap-1"
                >
                  <Target className="w-3.5 h-3.5 text-violet-600" />
                  <span>กำหนดงบประมาณ</span>
                </button>
              </div>
            )}
          </div>
          <div className="absolute top-0 right-0 w-1.5 h-full bg-violet-500 rounded-r-2xl" />
        </div>
      </div>
    </div>
  );
};
