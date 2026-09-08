import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import {
  formatCurrency,
  getCategoryInfo,
  ALL_CATEGORIES,
  THAI_MONTHS
} from '../constants/categories';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  transactions: Transaction[];
  onOpenAddModal: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  selectedMonth: string;
}

export const TransactionList: React.FC<Props> = ({
  transactions,
  onOpenAddModal,
  onEditTransaction,
  onDeleteTransaction,
  selectedMonth,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      // Category filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const noteMatch = t.note?.toLowerCase().includes(query);
        const catMatch = t.category.toLowerCase().includes(query);
        const amountMatch = t.amount.toString().includes(query);
        if (!noteMatch && !catMatch && !amountMatch) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, categoryFilter, searchTerm]);

  // Group by date (YYYY-MM-DD)
  const groupedTransactions = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    for (const tx of filteredTransactions) {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    }
    // Sort dates descending
    return Object.keys(groups)
      .sort((a, b) => b.localeCompare(a))
      .map(date => ({
        date,
        items: groups[date],
        dailyIncome: groups[date].filter(i => i.type === 'income').reduce((s, i) => s + i.amount, 0),
        dailyExpense: groups[date].filter(i => i.type === 'expense').reduce((s, i) => s + i.amount, 0),
      }));
  }, [filteredTransactions]);

  const formatDateDisplay = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const thaiYear = year + 543;
      const monthName = THAI_MONTHS[month - 1] || '';
      
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      if (dateStr === todayStr) {
        return `วันนี้, ${day} ${monthName} ${thaiYear}`;
      }
      return `${day} ${monthName} ${thaiYear}`;
    } catch {
      return dateStr;
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) return;
    const headers = ['วันที่', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'บันทึกช่วยจำ'];
    const rows = filteredTransactions.map(t => [
      t.date,
      t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
      `"${t.category.replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.note || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `monydb_transactions_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>รายการบันทึกทั้งหมด</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
              {filteredTransactions.length} รายการ
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            แสดงรายการรายรับ-รายจ่ายที่บันทึกไว้ในระบบ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {transactions.length > 0 && (
            <button
              id="btn-export-csv"
              onClick={handleExportCSV}
              title="ดาวน์โหลดเป็นไฟล์ CSV"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>ส่งออก CSV</span>
            </button>
          )}

          <button
            id="btn-add-transaction-list"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>เพิ่มรายการ</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="input-search-transaction"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาหมวดหมู่ หรือ บันทึก..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="sm:col-span-3 flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium">
          <button
            id="filter-type-all"
            onClick={() => setTypeFilter('all')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              typeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            id="filter-type-income"
            onClick={() => setTypeFilter('income')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              typeFilter === 'income'
                ? 'bg-white text-emerald-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รายรับ
          </button>
          <button
            id="filter-type-expense"
            onClick={() => setTypeFilter('expense')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              typeFilter === 'expense'
                ? 'bg-white text-rose-600 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            รายจ่าย
          </button>
        </div>

        {/* Category Filter dropdown */}
        <div className="sm:col-span-3">
          <select
            id="select-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-slate-700"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {ALL_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.type === 'income' ? '[รับ] ' : '[จ่าย] '} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List Grouped by Date */}
      {groupedTransactions.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-600">
            {transactions.length === 0 ? 'ยังไม่มีรายการสำหรับเดือนนี้' : 'ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา'}
          </p>
          {transactions.length === 0 && (
            <button
              id="btn-add-first-transaction"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึกรายการแรก</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {groupedTransactions.map(group => (
            <div key={group.date} className="space-y-1.5">
              {/* Date Header */}
              <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-slate-500 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDateDisplay(group.date)}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  {group.dailyIncome > 0 && (
                    <span className="text-emerald-600 font-medium">
                      + {formatCurrency(group.dailyIncome)}
                    </span>
                  )}
                  {group.dailyExpense > 0 && (
                    <span className="text-rose-600 font-medium">
                      - {formatCurrency(group.dailyExpense)}
                    </span>
                  )}
                </div>
              </div>

              {/* Items in this date */}
              <div className="space-y-1">
                {group.items.map(tx => {
                  const catInfo = getCategoryInfo(tx.category, tx.type);
                  const isIncome = tx.type === 'income';

                  return (
                    <div
                      key={tx.id}
                      className="group flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100/90 border border-slate-100 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                          style={{ backgroundColor: catInfo.bgColor, color: catInfo.color }}
                        >
                          <CategoryIcon iconName={catInfo.icon} size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {tx.category}
                          </p>
                          {tx.note && (
                            <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
                              {tx.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Amount and Actions */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p
                            className={`text-sm font-bold font-['Plus_Jakarta_Sans',sans-serif] ${
                              isIncome ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                          </p>
                        </div>

                        {/* Action buttons (Edit / Delete) */}
                        <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            id={`btn-edit-tx-${tx.id}`}
                            onClick={() => onEditTransaction(tx)}
                            title="แก้ไขรายการ"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {deleteConfirmId === tx.id ? (
                            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-rose-200 shadow-xs">
                              <span className="text-[10px] text-rose-600 px-1">ลบ?</span>
                              <button
                                id={`btn-confirm-delete-${tx.id}`}
                                onClick={() => {
                                  onDeleteTransaction(tx.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="px-2 py-0.5 bg-rose-600 text-white text-[10px] rounded font-medium hover:bg-rose-700"
                              >
                                ยืนยัน
                              </button>
                              <button
                                id={`btn-cancel-delete-${tx.id}`}
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-0.5 text-slate-600 text-[10px] hover:bg-slate-100 rounded"
                              >
                                ยกเลิก
                              </button>
                            </div>
                          ) : (
                            <button
                              id={`btn-delete-tx-${tx.id}`}
                              onClick={() => setDeleteConfirmId(tx.id)}
                              title="ลบรายการ"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
