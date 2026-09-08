import React from 'react';
import { User } from 'firebase/auth';
import {
  Wallet,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Database,
  Calendar,
  Sparkles,
  Plus,
  ExternalLink
} from 'lucide-react';
import { formatThaiMonth } from '../constants/categories';
import { CollegeLogo } from './CollegeLogo';

interface Props {
  user: User | null;
  selectedMonth: string; // YYYY-MM
  onMonthChange: (newMonth: string) => void;
  onOpenAddModal: () => void;
  onSignOut: () => void;
  onSignIn: () => void;
  loadingAuth: boolean;
}

export const Navbar: React.FC<Props> = ({
  user,
  selectedMonth,
  onMonthChange,
  onOpenAddModal,
  onSignOut,
  onSignIn,
  loadingAuth,
}) => {
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onMonthChange(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(currentMonth);
  };

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const isCurrentMonth = selectedMonth === currentMonthStr;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Database Badge */}
          <div className="flex items-center gap-3">
            <CollegeLogo size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Mony<span className="text-emerald-600">DB</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Database className="w-3 h-3 text-emerald-500" />
                  <span className="hidden sm:inline">Firebase:</span> MonyDB
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                ระบบจัดการรายรับรายจ่าย & วิเคราะห์ข้อมูล
              </p>
            </div>
          </div>

          {/* Month Selector in Header */}
          {user && (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                id="btn-prev-month"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2 text-sm font-semibold text-slate-800 min-w-[130px] sm:min-w-[160px] justify-center">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>{formatThaiMonth(selectedMonth)}</span>
              </div>

              <button
                id="btn-next-month"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {!isCurrentMonth && (
                <button
                  id="btn-reset-current-month"
                  onClick={handleCurrentMonth}
                  className="hidden sm:inline-flex text-xs px-2 py-1 rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 font-medium transition-colors"
                >
                  เดือนนี้
                </button>
              )}
            </div>
          )}

          {/* User Profile / Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  id="btn-nav-add-transaction"
                  onClick={onOpenAddModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span className="hidden sm:inline">เพิ่มรายการ</span>
                </button>

                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
                      {user.displayName || 'ผู้ใช้งาน'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate max-w-[130px]">
                      {user.email}
                    </p>
                  </div>
                  <button
                    id="btn-signout"
                    onClick={onSignOut}
                    title="ออกจากระบบ"
                    aria-label="ออกจากระบบ"
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="btn-nav-open-new-tab"
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank', 'noopener,noreferrer')}
                  title="เปิดในแท็บใหม่ เพื่อเลี่ยงการบล็อกป๊อปอัปในหน้าต่างตัวอย่าง"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>เปิดในแท็บใหม่</span>
                </button>
                <button
                  id="btn-nav-signin"
                  onClick={onSignIn}
                  disabled={loadingAuth}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>เข้าสู่ระบบ</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
