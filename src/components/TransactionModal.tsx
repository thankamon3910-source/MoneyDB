import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, FileText, DollarSign, Plus } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  formatCurrency
} from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    category: string;
    note: string;
    date: string;
  }) => Promise<void>;
  editData?: Transaction | null;
  defaultMonth: string;
}

export const TransactionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
  defaultMonth,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('อาหารและเครื่องดื่ม');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form when opening or changing editData
  useEffect(() => {
    if (editData) {
      setType(editData.type);
      setAmount(editData.amount.toString());
      setCategory(editData.category);
      setNote(editData.note || '');
      setDate(editData.date);
    } else {
      setType('expense');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0].name);
      setNote('');
      // Default to today if within defaultMonth, or 1st of defaultMonth
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      if (todayStr.startsWith(defaultMonth)) {
        setDate(todayStr);
      } else {
        setDate(`${defaultMonth}-01`);
      }
    }
    setError(null);
  }, [editData, isOpen, defaultMonth]);

  // When type changes, reset default category if current not matching type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      const exists = EXPENSE_CATEGORIES.some(c => c.name === category);
      if (!exists) setCategory(EXPENSE_CATEGORIES[0].name);
    } else {
      const exists = INCOME_CATEGORIES.some(c => c.name === category);
      if (!exists) setCategory(INCOME_CATEGORIES[0].name);
    }
  };

  const handleQuickAdd = (value: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + value).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('กรุณากรอกจำนวนเงินที่ถูกต้อง (มากกว่า 0)');
      return;
    }

    if (!category.trim()) {
      setError('กรุณาเลือกหมวดหมู่');
      return;
    }

    if (!date) {
      setError('กรุณาเลือกวันที่');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        type,
        amount: numAmount,
        category,
        note: note.trim(),
        date,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            {editData ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
          </h3>
          <button
            id="btn-close-transaction-modal"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Type Toggle: Expense vs Income */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              id="btn-select-type-expense"
              onClick={() => handleTypeChange('expense')}
              className={`py-2.5 text-sm font-semibold rounded-xl transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย (Expense)
            </button>
            <button
              type="button"
              id="btn-select-type-income"
              onClick={() => handleTypeChange('income')}
              className={`py-2.5 text-sm font-semibold rounded-xl transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ (Income)
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label htmlFor="input-amount" className="block text-xs font-semibold text-slate-700">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                ฿
              </span>
              <input
                id="input-amount"
                type="number"
                step="any"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-3 text-xl font-bold rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-slate-900"
                autoFocus
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
              {[50, 100, 300, 500, 1000].map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleQuickAdd(val)}
                  className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors shrink-0"
                >
                  +{val}
                </button>
              ))}
            </div>
          </div>

          {/* Category Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              หมวดหมู่ *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {categories.map(cat => {
                const isSelected = category === cat.name;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? type === 'expense'
                          ? 'border-rose-500 bg-rose-50/70 text-rose-900 ring-2 ring-rose-500/20'
                          : 'border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: cat.bgColor, color: cat.color }}
                    >
                      <CategoryIcon iconName={cat.icon} size={15} />
                    </div>
                    <span className="text-xs font-medium truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Note Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div className="space-y-1.5">
              <label htmlFor="input-date" className="block text-xs font-semibold text-slate-700">
                วันที่ *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="input-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label htmlFor="input-note" className="block text-xs font-semibold text-slate-700">
                บันทึกช่วยจำ (ไม่บังคับ)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="input-note"
                  type="text"
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="เช่น ข้าวกะเพราไก่, ชาเขียว"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              id="btn-submit-transaction"
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 text-sm font-semibold rounded-2xl text-white shadow-md transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'กำลังบันทึกลง MonyDB...' : editData ? 'อัปเดตข้อมูล' : 'บันทึกรายการ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
