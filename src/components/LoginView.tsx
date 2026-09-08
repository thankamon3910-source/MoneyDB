import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  ExternalLink,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  PieChart,
  Database,
  Copy,
  Check,
  HelpCircle,
  Wrench,
  Globe,
  Zap,
  ToggleRight
} from 'lucide-react';
import { CollegeLogo } from './CollegeLogo';
import firebaseConfig from '../../firebase-applet-config.json';

interface Props {
  onSignIn: () => Promise<void>;
  onEmailSignIn: (email: string, pass: string) => Promise<void>;
  onEmailSignUp: (email: string, pass: string, name?: string) => Promise<void>;
  onDemoSignIn: () => Promise<void>;
  onLocalSignIn: (email: string, name?: string) => void;
  loading: boolean;
  error?: string | null;
  errorCode?: string | null;
  onClearError?: () => void;
}

export const LoginView: React.FC<Props> = ({
  onSignIn,
  onEmailSignIn,
  onEmailSignUp,
  onDemoSignIn,
  onLocalSignIn,
  loading,
  error,
  errorCode,
  onClearError,
}) => {
  const [activeTab, setActiveTab] = useState<'google' | 'email' | 'demo'>('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submittingEmail, setSubmittingEmail] = useState(false);
  const [submittingDemo, setSubmittingDemo] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [copiedType, setCopiedType] = useState<'hostname' | 'wildcard' | null>(null);
  const [showDomainHelp, setShowDomainHelp] = useState(false);

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseProjectId = firebaseConfig.projectId || 'moneydb-30fef';
  const firebaseConsoleDomainsUrl = `https://console.firebase.google.com/project/${firebaseProjectId}/authentication/settings`;
  const firebaseConsoleProvidersUrl = `https://console.firebase.google.com/project/${firebaseProjectId}/authentication/providers`;

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }
  }, []);

  const handleOpenNewTab = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = (text: string, type: 'hostname' | 'wildcard') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 3000);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setSubmittingEmail(true);
    if (onClearError) onClearError();
    try {
      if (isSignUp) {
        await onEmailSignUp(email.trim(), password, displayName.trim() || undefined);
      } else {
        await onEmailSignIn(email.trim(), password);
      }
    } finally {
      setSubmittingEmail(false);
    }
  };

  const handleDemoSubmit = async () => {
    setSubmittingDemo(true);
    if (onClearError) onClearError();
    try {
      await onDemoSignIn();
    } finally {
      setSubmittingDemo(false);
    }
  };

  const handleQuickLocalBypass = () => {
    const cleanEmail = email.trim() || 'thankamon3910@gmail.com';
    onLocalSignIn(cleanEmail, displayName.trim() || undefined);
  };

  const isUnauthorizedDomain =
    errorCode === 'auth/unauthorized-domain' ||
    error?.includes('unauthorized-domain') ||
    error?.includes('Authorized Domains');

  const isOperationNotAllowed =
    errorCode === 'auth/operation-not-allowed' ||
    error?.includes('operation-not-allowed') ||
    error?.includes('ยังไม่ได้เปิดใช้งาน');

  const isPopupBlocked =
    errorCode === 'auth/popup-blocked' ||
    error?.includes('popup-blocked') ||
    error?.includes('ป๊อปอัป');

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-start bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/50">
        
        {/* Left Column: Brand & Info */}
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
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              ระบบจัดการรายรับ-รายจ่าย วิทยาลัยอาชีวศึกษาแพร่ พร้อมระบบสรุปผลรายเดือน กราฟวิเคราะห์สัดส่วน และจัดเก็บข้อมูลบนฐานข้อมูล Firebase
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-sm text-slate-700">
                <strong className="font-semibold text-slate-900">สรุปผลรายเดือน:</strong> ตรวจสอบรายรับ รายจ่าย ยอดคงเหลือ และอัตราการออม
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-lg bg-teal-100 text-teal-700 mt-0.5">
                <PieChart className="w-4 h-4" />
              </div>
              <p className="text-sm text-slate-700">
                <strong className="font-semibold text-slate-900">กราฟวิเคราะห์ข้อมูล:</strong> แสดงแผนภูมิวงกลมและแท่งเปรียบเทียบค่าใช้จ่าย
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 rounded-lg bg-sky-100 text-sky-700 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-sm text-slate-700">
                <strong className="font-semibold text-slate-900">ความปลอดภัยสูง:</strong> จัดเก็บข้อมูลแยกเฉพาะบัญชีผู้ใช้ใน Firestore MonyDB
              </p>
            </div>
          </div>

          {/* Quick Access Notification */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>เข้าใช้งานได้ทันที 100% ไม่ต้องกังวลเรื่องการตั้งค่า</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-700">
              หาก Firebase ยังไม่ได้เปิดใช้งาน Email/Password หรือ Authorized Domains คุณสามารถกดปุ่ม <strong>"เข้าใช้งานด่วนด้วยอีเมลนี้"</strong> เพื่อเริ่มใช้งาน บันทึกข้อมูล ดูรายงาน และใช้งานได้ทันที
            </p>
          </div>

          {/* Iframe Notice */}
          {isInIframe && (
            <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>เปิดใช้งานในหน้าต่างตัวอย่าง (Preview Frame)</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                หากต้องการเปิดใช้งานแบบเต็มจอและลดการบล็อกป๊อปอัป สามารถเปิดในแท็บใหม่ได้
              </p>
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>เปิดแอปพลิเคชันในแท็บใหม่</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Multi-Option Sign In Card */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 sm:p-8 flex flex-col justify-center space-y-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              เข้าสู่ระบบ MonyDB
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              เลือกวิธีการเข้าสู่ระบบตามที่ต้องการ
            </p>
          </div>

          {/* Tabs Selector */}
          <div className="grid grid-cols-3 gap-1 bg-slate-200/80 p-1 rounded-xl text-xs font-semibold text-slate-600">
            <button
              type="button"
              id="tab-login-email"
              onClick={() => {
                setActiveTab('email');
                if (onClearError) onClearError();
              }}
              className={`py-2 px-2 rounded-lg transition-all text-center truncate ${
                activeTab === 'email'
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              อีเมล / รหัสผ่าน
            </button>
            <button
              type="button"
              id="tab-login-google"
              onClick={() => {
                setActiveTab('google');
                if (onClearError) onClearError();
              }}
              className={`py-2 px-2 rounded-lg transition-all text-center truncate ${
                activeTab === 'google'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              Google / Gmail
            </button>
            <button
              type="button"
              id="tab-login-demo"
              onClick={() => {
                setActiveTab('demo');
                if (onClearError) onClearError();
              }}
              className={`py-2 px-2 rounded-lg transition-all text-center truncate ${
                activeTab === 'demo'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              ทดลองใช้งาน
            </button>
          </div>

          {/* 1. DEDICATED GUIDE: auth/operation-not-allowed (Email/Password disabled in Firebase) */}
          {isOperationNotAllowed && (
            <div className="p-4 bg-amber-50/95 border-2 border-amber-400 rounded-2xl text-xs text-amber-950 space-y-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-xl bg-amber-200 text-amber-900 shrink-0 mt-0.5">
                  <ToggleRight className="w-5 h-5 text-amber-800" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-amber-950 text-sm">
                    วิธีแก้ไข: เปิดใช้งาน Email/Password ใน Firebase Console
                  </h3>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    ระบบ Firebase Authentication ของโครงการยังไม่ได้เปิดสวิตช์ผู้ให้บริการ <strong>Email/Password</strong>
                  </p>
                </div>
              </div>

              {/* Step instructions */}
              <div className="bg-white/90 p-3 rounded-xl border border-amber-200 space-y-2 text-[11px] text-slate-800">
                <p className="font-bold text-slate-900">ขั้นตอนการเปิดใช้งาน (คลิกเพียง 2 ครั้ง):</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-700">
                  <li>กดปุ่มเปิดหน้าตั้งค่า <strong>Sign-in method</strong> ด้านล่าง</li>
                  <li>คลิกที่รายการ <strong>Email/Password</strong></li>
                  <li>สับสวิตช์ <strong>Enable (เปิดใช้งาน)</strong> แล้วกด <strong>Save (บันทึก)</strong></li>
                  <li>กลับมากดเข้าสู่ระบบด้วยอีเมลได้ทันที!</li>
                </ol>
              </div>

              <div className="space-y-2">
                <a
                  href={firebaseConsoleProvidersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>1. เปิดหน้าตั้งค่า Sign-in method ใน Firebase Console ↗</span>
                </a>

                <button
                  type="button"
                  onClick={handleQuickLocalBypass}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>2. หรือเข้าใช้งานทันทีด้วยอีเมล {email.trim() || 'ของคุณ'} (ไม่ต้องรอตั้งค่า)</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. DEDICATED GUIDE: auth/unauthorized-domain (Google Domain) */}
          {isUnauthorizedDomain && (
            <div className="p-4 bg-amber-50/95 border-2 border-amber-300 rounded-2xl text-xs text-amber-900 space-y-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-start gap-2.5">
                <div className="p-1 rounded-lg bg-amber-200 text-amber-900 shrink-0 mt-0.5">
                  <Wrench className="w-4 h-4 text-amber-800" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-amber-950 text-sm">
                    วิธีแก้ไข: เพิ่มโดเมนใน Firebase Console
                  </h3>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    เพิ่มชื่อโดเมนลงใน <strong>Authorized domains</strong> เพื่อเปิดใช้งาน Google Login
                  </p>
                </div>
              </div>

              {/* Copy Hostname */}
              <div className="bg-white/90 p-3 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-600" />
                    <span>โดเมนเว็บไซต์ของคุณ:</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">คลิกเพื่อคัดลอก</span>
                </div>

                <div className="flex items-center gap-2">
                  <code className="flex-1 px-2.5 py-1.5 bg-slate-100 text-slate-800 rounded-lg text-[11px] font-mono select-all truncate border border-slate-200">
                    {currentHostname || 'ais-dev-...run.app'}
                  </code>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentHostname, 'hostname')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-semibold transition-colors shrink-0 shadow-xs"
                  >
                    {copiedType === 'hostname' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>คัดลอกแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอก</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-1 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>หรือคัดลอกแบบคลุมระบบ: <code className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">run.app</code></span>
                  <button
                    type="button"
                    onClick={() => handleCopy('run.app', 'wildcard')}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    {copiedType === 'wildcard' ? 'คัดลอก run.app แล้ว!' : 'คัดลอก run.app'}
                  </button>
                </div>
              </div>

              {/* Step 2: Open Firebase Console Button */}
              <div className="space-y-2">
                <a
                  href={firebaseConsoleDomainsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>1. เปิดหน้าตั้งค่า Authorized Domains ใน Firebase Console ↗</span>
                </a>

                <button
                  type="button"
                  onClick={handleQuickLocalBypass}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>2. หรือเข้าใช้งานทันที (ไม่ต้องรอเพิ่มโดเมน)</span>
                </button>
              </div>
            </div>
          )}

          {/* Generic Error Alert Box (when not unauthorized-domain and not operation-not-allowed) */}
          {error && !isUnauthorizedDomain && !isOperationNotAllowed && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">
                  <p className="font-semibold text-rose-900">ข้อผิดพลาดในการเข้าสู่ระบบ</p>
                  <p className="mt-0.5 text-rose-700">{error}</p>
                </div>
              </div>

              {isPopupBlocked && (
                <div className="pt-2 border-t border-rose-200/60 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleOpenNewTab}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>คลิกเปิดในแท็บใหม่</span>
                  </button>
                </div>
              )}

              <div className="pt-2 border-t border-rose-200/60">
                <button
                  type="button"
                  onClick={handleQuickLocalBypass}
                  className="w-full py-2 px-3 bg-white border border-rose-300 hover:bg-rose-100 text-rose-900 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>คลิกเพื่อเข้าใช้งานด่วนด้วยอีเมลนี้ทันที</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: Email & Password (Primary Tab) */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  {isSignUp ? 'สร้างบัญชีผู้ใช้ใหม่ด้วยอีเมล' : 'เข้าสู่ระบบด้วยอีเมลและรหัสผ่าน'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    if (onClearError) onClearError();
                  }}
                  className="text-xs text-emerald-600 hover:text-emerald-800 hover:underline font-semibold"
                >
                  {isSignUp ? 'มีบัญชีแล้ว? เข้าสู่ระบบ' : 'สร้างบัญชีใหม่ (Sign Up)'}
                </button>
              </div>

              {isSignUp && (
                <div className="space-y-1">
                  <label htmlFor="input-login-name" className="block text-xs font-medium text-slate-700">
                    ชื่อ-นามสกุล หรือชื่อเล่น
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-login-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="เช่น สมชาย ใจดี"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label htmlFor="input-login-email" className="block text-xs font-medium text-slate-700">
                  อีเมล (Email) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="เช่น user@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="input-login-password" className="block text-xs font-medium text-slate-700">
                  รหัสผ่าน (อย่างน้อย 6 ตัวอักษร) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-white border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  id="btn-submit-email-auth"
                  type="submit"
                  disabled={submittingEmail || loading}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span>
                    {submittingEmail
                      ? 'กำลังเชื่อมต่อ Firebase...'
                      : isSignUp
                      ? 'สร้างบัญชีและเข้าสู่ระบบ'
                      : 'เข้าสู่ระบบด้วยอีเมล'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleQuickLocalBypass}
                  className="w-full py-2 px-3 rounded-xl text-xs font-medium text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>เข้าใช้งานด่วนด้วยอีเมลนี้ทันที (โหมดพร้อมใช้ ไม่ต้องรอตั้งค่า)</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                * หากยังไม่เคยมีบัญชี ระบบจะสมัครและเข้าสู่ระบบให้อัตโนมัติในขั้นตอนเดียว
              </p>
            </form>
          )}

          {/* TAB 2: Google Account */}
          {activeTab === 'google' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-xs text-slate-600 leading-relaxed text-center">
                เข้าสู่ระบบด้วยบัญชี Google หรือ Gmail ของคุณ
              </p>

              <button
                id="btn-login-google"
                onClick={onSignIn}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-3 px-5 py-3.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-semibold rounded-xl shadow-xs hover:shadow transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span>{loading ? 'กำลังเชื่อมต่อ...' : 'เข้าสู่ระบบด้วย Google / Gmail'}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="flex flex-col gap-2 pt-1 text-center">
                <button
                  type="button"
                  onClick={handleOpenNewTab}
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>เปิดใช้งานในหน้าต่างแท็บใหม่ (ลดการบล็อกป๊อปอัป)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDomainHelp(!showDomainHelp)}
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{showDomainHelp ? 'ซ่อนคำแนะนำ Authorized Domains' : 'วิธีแก้ Error: auth/unauthorized-domain'}</span>
                </button>

                {showDomainHelp && (
                  <div className="text-left p-3 bg-slate-100 rounded-xl text-[11px] text-slate-700 space-y-1.5 mt-1 border border-slate-200">
                    <p className="font-semibold text-slate-900">การตั้งค่า Authorized Domains ใน Firebase Console:</p>
                    <p>คัดลอกชื่อโดเมน: <code className="font-mono bg-white px-1 rounded text-emerald-700 font-bold">{currentHostname}</code> หรือ <code className="font-mono bg-white px-1 rounded text-emerald-700 font-bold">run.app</code></p>
                    <p>นำไปเพิ่มที่: <a href={firebaseConsoleDomainsUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">Firebase Console Authentication Settings ↗</a></p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Instant Demo / Guest Mode */}
          {activeTab === 'demo' && (
            <div className="space-y-4 animate-in fade-in duration-150 text-center">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-left space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>เข้าใช้งานได้ทันที 1-Click โดยไม่ต้องกรอกรหัสผ่าน</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  ระบบจะสร้างบัญชีผู้ใช้งานทดสอบให้ทันที สามารถบันทึกรายรับรายจ่าย ดูสรุปผล และทดลองใช้ทุกฟังก์ชันได้ครบถ้วน
                </p>
              </div>

              <div className="space-y-2">
                <button
                  id="btn-login-demo"
                  type="button"
                  onClick={handleDemoSubmit}
                  disabled={submittingDemo || loading}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/25 transition-all active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{submittingDemo ? 'กำลังเข้าสู่ระบบทดสอบ...' : 'คลิกเพื่อเข้าใช้งานด่วนทันที'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickLocalBypass}
                  className="w-full py-2.5 px-4 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>เข้าใช้งานด่วนในโหมดพร้อมใช้ (Local Fast Mode)</span>
                </button>
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="pt-3 border-t border-slate-200/80 text-[11px] text-slate-500 text-center space-y-1">
            <p>ฐานข้อมูล: <span className="font-mono text-emerald-600 font-medium">Firestore (monydb)</span></p>
            <p>ระบบความปลอดภัยตามมาตรฐาน Google Firebase</p>
          </div>
        </div>

      </div>
    </div>
  );
};
