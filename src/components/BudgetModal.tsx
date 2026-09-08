import React, { useState, useEffect } from 'react';
import { X, Target, Check, PiggyBank, Sparkles } from 'lucide-react';
import { MonthlyBudget } from '../types';
import { formatThaiMonth } from '../constants/categories';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: string;
  currentBudget: MonthlyBudget | null;
  onSaveBudget: (budgetAmount: number, savingsGoal: number) => Promise<void>;
}

export const BudgetModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedMonth,
  currentBudget,
  onSaveBudget,
}) => {
  const [budgetAmount, setBudgetAmount] = useState<string>('');
  const [savingsGoal, setSavingsGoal] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentBudget) {
      setBudgetAmount(currentBudget.budgetAmount.toString());
      setSavingsGoal(currentBudget.savingsGoal ? currentBudget.savingsGoal.toString() : '');
    } else {
      setBudgetAmount('');
      setSavingsGoal('');
    }
    setError(null);
  }, [currentBudget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const budget = parseFloat(budgetAmount);
    if (isNaN(budget) || budget < 0) {
      setError('กรุณากรอกงบประมาณที่ถูกต้อง (0 หรือมากกว่า)');
      return;
    }

    const savings = savingsGoal ? parseFloat(savingsGoal) : 0;
    if (isNaN(savings) || savings < 0) {
      setError('กรุณากรอกเป้าหมายการออมที่ถูกต้อง');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveBudget(budget, savings);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกงบประมาณ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ตั้งงบประมาณรายจ่าย
              </h3>
              <p className="text-xs text-slate-500">
                ประจำเดือน {formatThaiMonth(selectedMonth)}
              </p>
            </div>
          </div>
          <button
            id="btn-close-budget-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Budget Amount */}
          <div className="space-y-1.5">
            <label htmlFor="input-budget-amount" className="block text-xs font-semibold text-slate-700">
              งบประมาณค่าใช้จ่ายสูงสุด (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                ฿
              </span>
              <input
                id="input-budget-amount"
                type="number"
                step="any"
                min="0"
                required
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="เช่น 15000"
                className="w-full pl-9 pr-4 py-2.5 text-base font-bold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              ระบบจะแจ้งเตือนเมื่อรายจ่ายของคุณเข้าใกล้หรือเกินกว่างบนี้
            </p>
          </div>

          {/* Savings Goal */}
          <div className="space-y-1.5">
            <label htmlFor="input-savings-goal" className="block text-xs font-semibold text-slate-700">
              เป้าหมายเงินออมประจำเดือน (บาท)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">
                ฿
              </span>
              <input
                id="input-savings-goal"
                type="number"
                step="any"
                min="0"
                value={savingsGoal}
                onChange={(e) => setSavingsGoal(e.target.value)}
                placeholder="เช่น 5000 (ไม่บังคับ)"
                className="w-full pl-9 pr-4 py-2.5 text-base font-bold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-slate-900"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              id="btn-save-budget"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-600/20 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกงบประมาณ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
