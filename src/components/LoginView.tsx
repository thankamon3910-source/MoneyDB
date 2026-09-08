import React from 'react';
import {
  Wallet,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Database,
  ArrowRight,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { CollegeLogo } from './CollegeLogo';

interface Props {
  onSignIn: () => void;
  loading: boolean;
  error?: string | null;
}

export const LoginView: React.FC<Props> = ({ onSignIn, loading, error }) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/50">
        {/* Left Column: Brand & Value proposition */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>เชื่อมต่อกับฐานข้อมูล Firebase: MonyDB</span>
          </div>

          <div className="space-y-2">
            <CollegeLogo size="lg" className="shadow-lg shadow-blue-900/10" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Mony<span className="text-emerald-600">DB</span>
            </h1>
            <p className="text-slate-600 text-base leading-relaxed">
              จัดการรายรับ-รายจ่ายของคุณได้อย่างมีประสิทธิภาพ พร้อมระบบสรุปผลรายเดือน กราฟวิเคราะห์ข้อมูล และจัดเก็บข้อมูลอย่างปลอดภัยบน Firebase
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-sm text-slate-700">
                <strong className="font-semibold text-slate-900">สรุปผลแบบรายเดือน:</strong> ดูยอดรับ จ่าย และคงเหลือสุทธิ พร้อมตัวชี้วัดทางการเงิน
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-lg bg-teal-100 text-teal-700 mt-0.5">
                <PieChart className="w-4 h-4" />
              </div>
              <p className="text-sm text-slate-700">
                <strong className="font-semibold text-slate-900">กราฟวิเคราะห์ข้อมูล:</strong> แผนภูมิวงกลมและแท่งเปรียบเทียบสัดส่วนค่าใช้จ่ายชัดเจน
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-lg bg-sky-100 text-sky-700 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-sm text-slate-700">
                <strong className="font-semibold text-slate-900">ความปลอดภัยสูง:</strong> เก็บข้อมูลแยกเฉพาะผู้ใช้แต่ละคนในฐานข้อมูล MonyDB
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-center text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">
              เข้าสู่ระบบเพื่อเริ่มต้นใช้งาน
            </h2>
            <p className="text-sm text-slate-500">
              เข้าใช้งานง่าย รวดเร็ว และปลอดภัยด้วยบัญชี Gmail ของคุณ
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-left">
              {error}
            </div>
          )}

          <button
            id="btn-login-google"
            onClick={onSignIn}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-3 px-5 py-3.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-semibold rounded-xl shadow-sm hover:shadow transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {/* Google G Logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google / Gmail'}</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="pt-4 border-t border-slate-200/80 text-xs text-slate-500 space-y-1">
            <p>ฐานข้อมูล: <span className="font-mono text-emerald-600 font-medium">Firestore (MonyDB)</span></p>
            <p>ข้อมูลได้รับการป้องกันตามกฎความปลอดภัย Cloud Firestore Rules</p>
          </div>
        </div>
      </div>
    </div>
  );
};
