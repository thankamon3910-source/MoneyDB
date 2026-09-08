import React, { useState } from 'react';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  HelpCircle,
  Calendar,
  AlertCircle,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatCurrency, formatThaiMonth, getCategoryInfo } from '../constants/categories';
import { MonthSummary, Transaction } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface Props {
  selectedMonth: string;
  summary: MonthSummary;
  transactions: Transaction[];
}

export const AnalyticsCharts: React.FC<Props> = ({
  selectedMonth,
  summary,
  transactions,
}) => {
  const [activeTab, setActiveTab] = useState<'category' | 'daily' | 'trend'>('category');

  // Filter expense breakdown for pie chart
  const expenseCategories = summary.categoryBreakdown.filter(c => c.type === 'expense' && c.amount > 0);
  const incomeCategories = summary.categoryBreakdown.filter(c => c.type === 'income' && c.amount > 0);

  // Colors palette for pie chart slices
  const COLORS = [
    '#EF4444', '#F97316', '#8B5CF6', '#EAB308', '#EC4899',
    '#06B6D4', '#10B981', '#6366F1', '#14B8A6', '#64748B',
    '#3B82F6', '#84CC16', '#A855F7', '#F43F5E'
  ];

  // Daily data formatted for Bar & Area charts
  const dailyChartData = summary.dailyBreakdown.map(d => ({
    name: `วันที่ ${d.day}`,
    day: d.day,
    รายรับ: d.income,
    รายจ่าย: d.expense,
    ยอดคงเหลือ: d.balance,
  }));

  // Cumulative expense trend data
  let cumulativeExpense = 0;
  const cumulativeData = summary.dailyBreakdown.map(d => {
    cumulativeExpense += d.expense;
    return {
      name: `${d.day}`,
      day: d.day,
      รายจ่ายสะสม: cumulativeExpense,
      รายจ่ายประจำวัน: d.expense,
    };
  });

  // Insights calculations
  const highestExpenseDay = [...summary.dailyBreakdown].sort((a, b) => b.expense - a.expense)[0];
  const topExpenseCategory = expenseCategories.length > 0
    ? [...expenseCategories].sort((a, b) => b.amount - a.amount)[0]
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
      {/* Header and Chart Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>กราฟวิเคราะห์ข้อมูลประจำเดือน</span>
          </h2>
          <p className="text-xs text-slate-500">
            แสดงแนวโน้มและสัดส่วนรายรับ-รายจ่าย ประจำเดือน {formatThaiMonth(selectedMonth)}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto text-xs font-medium">
          <button
            id="tab-chart-category"
            onClick={() => setActiveTab('category')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'category'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>สัดส่วนหมวดหมู่</span>
          </button>
          <button
            id="tab-chart-daily"
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'daily'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>รายรับ vs รายจ่าย</span>
          </button>
          <button
            id="tab-chart-trend"
            onClick={() => setActiveTab('trend')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'trend'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>แนวโน้มสะสม</span>
          </button>
        </div>
      </div>

      {/* Chart Views */}
      {transactions.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-600">ยังไม่มีข้อมูลสำหรับเดือนนี้</p>
          <p className="text-xs text-slate-400">เริ่มต้นโดยการคลิกปุ่ม &quot;เพิ่มรายการ&quot; เพื่อบันทึกรายรับหรือรายจ่าย</p>
        </div>
      ) : (
        <>
          {/* 1. Category Distribution (Pie / Donut) */}
          {activeTab === 'category' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Donut Chart */}
              <div className="lg:col-span-6 h-64 sm:h-72 w-full flex items-center justify-center">
                {expenseCategories.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={expenseCategories}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="amount"
                        nameKey="category"
                      >
                        {expenseCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: number | string | undefined) => [formatCurrency(Number(val || 0)), 'จำนวนเงิน']}
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          borderRadius: '0.75rem',
                          color: '#fff',
                          border: 'none',
                          fontSize: '12px',
                        }}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-slate-400">ยังไม่มีรายการค่าใช้จ่ายในเดือนนี้</p>
                )}
              </div>

              {/* Category Ranking List */}
              <div className="lg:col-span-6 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pb-1 border-b border-slate-100">
                  <span>หมวดหมู่ค่าใช้จ่าย</span>
                  <span>จำนวนเงิน (% ของรายจ่าย)</span>
                </div>
                {expenseCategories.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {expenseCategories.map((item, index) => {
                      const catInfo = getCategoryInfo(item.category, 'expense');
                      const sliceColor = COLORS[index % COLORS.length];
                      return (
                        <div
                          key={item.category}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{ backgroundColor: sliceColor }}
                            />
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white shadow-xs">
                              <CategoryIcon iconName={catInfo.icon} size={15} />
                            </div>
                            <span className="text-xs font-medium text-slate-800">
                              {item.category}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                              {formatCurrency(item.amount)}
                            </span>
                            <span className="text-[11px] text-slate-500 ml-1.5">
                              ({item.percentage}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-4 text-center">ไม่มีค่าใช้จ่ายในเดือนนี้</p>
                )}
              </div>
            </div>
          )}

          {/* 2. Daily Comparison Bar Chart */}
          {activeTab === 'daily' && (
            <div className="space-y-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickFormatter={(val) => `${val}`}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip
                      formatter={(val: number | string | undefined) => [formatCurrency(Number(val || 0))]}
                      labelFormatter={(label) => `วันที่ ${label} ${formatThaiMonth(selectedMonth)}`}
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                    <Bar dataKey="รายรับ" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="รายจ่าย" fill="#F43F5E" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                * กราฟแท่งเปรียบเทียบแสดงรายรับ (สีเขียว) และรายจ่าย (สีแดง) ในแต่ละวันตลอดทั้งเดือน
              </p>
            </div>
          )}

          {/* 3. Cumulative Expense Area Chart */}
          {activeTab === 'trend' && (
            <div className="space-y-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cumulativeData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="expenseTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={{ stroke: '#CBD5E1' }}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickFormatter={(val) => `${val}`}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                    />
                    <Tooltip
                      formatter={(val: number | string | undefined) => [formatCurrency(Number(val || 0))]}
                      labelFormatter={(label) => `วันที่ ${label} ${formatThaiMonth(selectedMonth)}`}
                      contentStyle={{
                        backgroundColor: '#1E293B',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        border: 'none',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="รายจ่ายสะสม"
                      stroke="#F43F5E"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#expenseTrend)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] text-slate-400 text-center">
                * เส้นกราฟแสดงการเติบโตของรายจ่ายสะสมตั้งแต่วันที่ 1 จนถึงสิ้นเดือน
              </p>
            </div>
          )}

          {/* Key Insights Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {topExpenseCategory && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">หมวดหมู่ใช้จ่ายสูงสุด</p>
                  <p className="text-xs font-bold text-slate-800">
                    {topExpenseCategory.category} ({formatCurrency(topExpenseCategory.amount)})
                  </p>
                </div>
              </div>
            )}

            {highestExpenseDay && highestExpenseDay.expense > 0 && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">วันที่จ่ายมากที่สุดในเดือนนี้</p>
                  <p className="text-xs font-bold text-slate-800">
                    วันที่ {highestExpenseDay.day} ({formatCurrency(highestExpenseDay.expense)})
                  </p>
                </div>
              </div>
            )}

            {summary.totalIncome > 0 && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">อัตราส่วนการออม</p>
                  <p className="text-xs font-bold text-slate-800">
                    {summary.savingsRate}% จากรายรับทั้งหมด
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
