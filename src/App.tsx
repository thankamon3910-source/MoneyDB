import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut,
  formatAuthErrorMessage,
  testConnection,
  handleFirestoreError,
  OperationType
} from './firebase';
import { Transaction, MonthlyBudget, MonthSummary, TransactionType, AppUser } from './types';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { MonthlyOverview } from './components/MonthlyOverview';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Sparkles, Database, PlusCircle, RefreshCw, Zap } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | AppUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);

  // Current selected month: 'YYYY-MM'
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // State data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<MonthlyBudget | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // 1. Initial connection test
  useEffect(() => {
    testConnection();
  }, []);

  // 2. Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.removeItem('monydb_local_user');
      } else {
        const saved = localStorage.getItem('monydb_local_user');
        if (saved) {
          try {
            setUser(JSON.parse(saved));
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // 3. Transactions Listener / Loader
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setLoadingData(false);
      return;
    }

    // A) If user is in Local Mode
    if ('isLocal' in user && user.isLocal) {
      setLoadingData(true);
      const stored = localStorage.getItem(`monydb_tx_${user.uid}`);
      if (stored) {
        try {
          setTransactions(JSON.parse(stored));
        } catch {
          setTransactions([]);
        }
      } else {
        setTransactions([]);
      }
      setLoadingData(false);
      return;
    }

    // B) If user is authenticated via Firebase
    setLoadingData(true);
    const txPath = `users/${user.uid}/transactions`;
    const q = query(collection(db, 'users', user.uid, 'transactions'), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          list.push({
            id: docSnap.id,
            userId: d.userId,
            type: d.type,
            amount: Number(d.amount),
            category: d.category,
            note: d.note || '',
            date: d.date,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
          });
        });
        setTransactions(list);
        setLoadingData(false);
      },
      (error) => {
        setLoadingData(false);
        handleFirestoreError(error, OperationType.LIST, txPath);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // 4. Monthly Budget Listener / Loader
  useEffect(() => {
    if (!user) {
      setBudget(null);
      return;
    }

    // A) If user is in Local Mode
    if ('isLocal' in user && user.isLocal) {
      const stored = localStorage.getItem(`monydb_budget_${user.uid}_${selectedMonth}`);
      if (stored) {
        try {
          setBudget(JSON.parse(stored));
        } catch {
          setBudget(null);
        }
      } else {
        setBudget(null);
      }
      return;
    }

    // B) If user is authenticated via Firebase
    const budgetPath = `users/${user.uid}/budgets/${selectedMonth}`;
    const budgetDocRef = doc(db, 'users', user.uid, 'budgets', selectedMonth);

    const unsubscribe = onSnapshot(
      budgetDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const d = docSnap.data();
          setBudget({
            userId: d.userId,
            month: d.month,
            budgetAmount: Number(d.budgetAmount),
            savingsGoal: d.savingsGoal ? Number(d.savingsGoal) : undefined,
            updatedAt: d.updatedAt,
          });
        } else {
          setBudget(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, budgetPath);
      }
    );

    return () => unsubscribe();
  }, [user, selectedMonth]);

  // Filter transactions by selectedMonth (YYYY-MM)
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  // Compute month summary
  const summary: MonthSummary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    const catMap: { [key: string]: { amount: number; type: TransactionType; count: number } } = {};

    // Days in month
    const [y, m] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const dailyMap: { [day: number]: { income: number; expense: number } } = {};
    for (let day = 1; day <= daysInMonth; day++) {
      dailyMap[day] = { income: 0, expense: 0 };
    }

    for (const tx of monthTransactions) {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }

      // Category breakdown
      if (!catMap[tx.category]) {
        catMap[tx.category] = { amount: 0, type: tx.type, count: 0 };
      }
      catMap[tx.category].amount += tx.amount;
      catMap[tx.category].count += 1;

      // Daily breakdown
      const txDay = parseInt(tx.date.split('-')[2], 10);
      if (dailyMap[txDay]) {
        if (tx.type === 'income') {
          dailyMap[txDay].income += tx.amount;
        } else {
          dailyMap[txDay].expense += tx.amount;
        }
      }
    }

    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netBalance / totalIncome) * 100)) : 0;

    const categoryBreakdown = Object.entries(catMap).map(([category, info]) => {
      const base = info.type === 'income' ? totalIncome : totalExpense;
      const percentage = base > 0 ? Math.round((info.amount / base) * 100) : 0;
      return {
        category,
        amount: info.amount,
        percentage,
        type: info.type,
        count: info.count,
      };
    }).sort((a, b) => b.amount - a.amount);

    const dailyBreakdown = Object.entries(dailyMap).map(([dayStr, data]) => {
      const day = Number(dayStr);
      return {
        date: `${selectedMonth}-${String(day).padStart(2, '0')}`,
        day,
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense,
      };
    });

    return {
      month: selectedMonth,
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      transactionCount: monthTransactions.length,
      categoryBreakdown,
      dailyBreakdown,
    };
  }, [monthTransactions, selectedMonth]);

  // Handle Google Sign-in
  const handleSignIn = async () => {
    try {
      setAuthError(null);
      setAuthErrorCode(null);
      await signInWithPopup(auth, googleProvider);
      addToast('success', 'เข้าสู่ระบบด้วย Google สำเร็จ ยินดีต้อนรับสู่ MonyDB');
    } catch (err: unknown) {
      console.error('Sign-in error:', err);
      const errDetail = formatAuthErrorMessage(err);
      setAuthError(errDetail.message);
      setAuthErrorCode(errDetail.code || null);
      addToast('error', errDetail.message);
    }
  };

  // Handle Smart Email Sign-in (Auto register if not registered)
  const handleEmailSignIn = async (email: string, pass: string) => {
    try {
      setAuthError(null);
      setAuthErrorCode(null);
      await signInWithEmailAndPassword(auth, email, pass);
      addToast('success', 'เข้าสู่ระบบสำเร็จ ยินดีต้อนรับสู่ MonyDB');
    } catch (err: unknown) {
      console.error('Email sign-in error:', err);
      const errDetail = formatAuthErrorMessage(err);

      // Smart auto-signup if user account doesn't exist yet
      if (errDetail.code === 'auth/user-not-found' || errDetail.code === 'auth/invalid-credential') {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email, pass);
          const defaultName = email.split('@')[0];
          await updateProfile(cred.user, { displayName: defaultName });
          addToast('success', 'สร้างบัญชีผู้ใช้ใหม่และเข้าสู่ระบบสำเร็จ');
          return;
        } catch (signUpErr: unknown) {
          console.error('Auto sign-up error:', signUpErr);
          const signUpErrDetail = formatAuthErrorMessage(signUpErr);
          setAuthError(signUpErrDetail.message);
          setAuthErrorCode(signUpErrDetail.code || null);
          addToast('error', signUpErrDetail.message);
          return;
        }
      }

      setAuthError(errDetail.message);
      setAuthErrorCode(errDetail.code || null);
      addToast('error', errDetail.message);
    }
  };

  // Handle Explicit Email Sign-up
  const handleEmailSignUp = async (email: string, pass: string, name?: string) => {
    try {
      setAuthError(null);
      setAuthErrorCode(null);
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name && cred.user) {
        await updateProfile(cred.user, { displayName: name });
      }
      addToast('success', 'สร้างบัญชีและเข้าสู่ระบบสำเร็จ');
    } catch (err: unknown) {
      console.error('Email sign-up error:', err);
      const errDetail = formatAuthErrorMessage(err);
      setAuthError(errDetail.message);
      setAuthErrorCode(errDetail.code || null);
      addToast('error', errDetail.message);
    }
  };

  // Handle Demo / Guest Sign-in
  const handleDemoSignIn = async () => {
    try {
      setAuthError(null);
      setAuthErrorCode(null);
      const cred = await signInAnonymously(auth);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: 'ผู้ใช้งานทั่วไป (ทดสอบ)' });
      }
      addToast('success', 'เข้าสู่ระบบโหมดทดสอบสำเร็จ (MonyDB พร้อมใช้งาน)');
    } catch (err: unknown) {
      console.error('Demo sign-in error:', err);
      const errDetail = formatAuthErrorMessage(err);
      setAuthError(errDetail.message);
      setAuthErrorCode(errDetail.code || null);
      addToast('error', errDetail.message);
    }
  };

  // Handle Instant Local User Sign-in (Offline / Fast Access)
  const handleLocalSignIn = (emailInput: string, name?: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const safeId = 'local_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const localUser: AppUser = {
      uid: safeId,
      email: cleanEmail,
      displayName: name || cleanEmail.split('@')[0],
      isLocal: true,
    };
    localStorage.setItem('monydb_local_user', JSON.stringify(localUser));
    setUser(localUser);
    setAuthError(null);
    setAuthErrorCode(null);
    addToast('success', `เข้าใช้งานสำเร็จด้วยอีเมล ${cleanEmail}`);
  };

  // Handle Sign-out
  const handleSignOut = async () => {
    try {
      localStorage.removeItem('monydb_local_user');
      if (auth.currentUser) {
        await signOut(auth);
      } else {
        setUser(null);
      }
      addToast('info', 'ออกจากระบบเรียบร้อยแล้ว');
    } catch (err) {
      console.error('Sign-out error:', err);
      setUser(null);
    }
  };

  // Add / Edit Transaction
  const handleSaveTransaction = async (data: {
    type: TransactionType;
    amount: number;
    category: string;
    note: string;
    date: string;
  }) => {
    if (!user) return;
    const nowIso = new Date().toISOString();

    // A) If user is in Local Mode
    if ('isLocal' in user && user.isLocal) {
      if (editingTx) {
        const updatedList = transactions.map(t =>
          t.id === editingTx.id ? { ...t, ...data, updatedAt: nowIso } : t
        );
        setTransactions(updatedList);
        localStorage.setItem(`monydb_tx_${user.uid}`, JSON.stringify(updatedList));
        addToast('success', 'อัปเดตรายการเรียบร้อยแล้ว');
        setEditingTx(null);
      } else {
        const newTx: Transaction = {
          id: 'tx_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          userId: user.uid,
          type: data.type,
          amount: data.amount,
          category: data.category,
          note: data.note,
          date: data.date,
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        const updatedList = [newTx, ...transactions];
        setTransactions(updatedList);
        localStorage.setItem(`monydb_tx_${user.uid}`, JSON.stringify(updatedList));
        addToast('success', 'บันทึกรายการสำเร็จ');
      }
      return;
    }

    // B) If user is in Firebase Mode
    if (editingTx) {
      const docPath = `users/${user.uid}/transactions/${editingTx.id}`;
      try {
        await updateDoc(doc(db, 'users', user.uid, 'transactions', editingTx.id), {
          userId: user.uid,
          type: data.type,
          amount: data.amount,
          category: data.category,
          note: data.note,
          date: data.date,
          updatedAt: nowIso,
        });
        addToast('success', 'อัปเดตรายการเรียบร้อยแล้ว');
        setEditingTx(null);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, docPath);
      }
    } else {
      const colPath = `users/${user.uid}/transactions`;
      try {
        await addDoc(collection(db, 'users', user.uid, 'transactions'), {
          userId: user.uid,
          type: data.type,
          amount: data.amount,
          category: data.category,
          note: data.note,
          date: data.date,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
        addToast('success', 'บันทึกรายการลง MonyDB สำเร็จ');
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, colPath);
      }
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;

    if ('isLocal' in user && user.isLocal) {
      const updatedList = transactions.filter(t => t.id !== id);
      setTransactions(updatedList);
      localStorage.setItem(`monydb_tx_${user.uid}`, JSON.stringify(updatedList));
      addToast('info', 'ลบรายการเรียบร้อยแล้ว');
      return;
    }

    const docPath = `users/${user.uid}/transactions/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'transactions', id));
      addToast('info', 'ลบรายการเรียบร้อยแล้ว');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  };

  // Save Monthly Budget
  const handleSaveBudget = async (budgetAmount: number, savingsGoal: number) => {
    if (!user) return;
    const nowIso = new Date().toISOString();

    if ('isLocal' in user && user.isLocal) {
      const newBudget: MonthlyBudget = {
        userId: user.uid,
        month: selectedMonth,
        budgetAmount,
        savingsGoal,
        updatedAt: nowIso,
      };
      setBudget(newBudget);
      localStorage.setItem(`monydb_budget_${user.uid}_${selectedMonth}`, JSON.stringify(newBudget));
      addToast('success', 'บันทึกงบประมาณประจำเดือนเรียบร้อย');
      return;
    }

    const docPath = `users/${user.uid}/budgets/${selectedMonth}`;
    try {
      await setDoc(doc(db, 'users', user.uid, 'budgets', selectedMonth), {
        userId: user.uid,
        month: selectedMonth,
        budgetAmount,
        savingsGoal,
        updatedAt: nowIso,
      });
      addToast('success', 'บันทึกงบประมาณประจำเดือนเรียบร้อย');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  };

  // Quick Seed Sample Data (Helpful for fresh databases or testing)
  const handleAddSampleData = async () => {
    if (!user) return;
    const nowIso = new Date().toISOString();
    const samples = [
      { type: 'income' as const, amount: 45000, category: 'เงินเดือนประจำ', note: 'เงินเดือนประจำเดือนนี้', day: '01' },
      { type: 'income' as const, amount: 6500, category: 'งานเสริม / ฟรีแลนซ์', note: 'รับงานออกแบบกราฟิก', day: '05' },
      { type: 'expense' as const, amount: 6500, category: 'ค่าที่พัก / ค่าเช่า', note: 'ค่าห้องพักรายเดือน', day: '02' },
      { type: 'expense' as const, amount: 1450, category: 'ค่าน้ำ ค่าไฟ อินเทอร์เน็ต', note: 'บิลค่าไฟและเน็ตบ้าน', day: '03' },
      { type: 'expense' as const, amount: 350, category: 'อาหารและเครื่องดื่ม', note: 'มื้อเที่ยงกับเพื่อนร่วมงาน', day: '04' },
      { type: 'expense' as const, amount: 800, category: 'การเดินทาง / น้ำมัน', note: 'เติมน้ำมันรถยนต์', day: '06' },
      { type: 'expense' as const, amount: 1200, category: 'ช้อปปิ้งและของใช้', note: 'ซื้อของใช้ในบ้านและซูเปอร์มาร์เก็ต', day: '07' },
      { type: 'expense' as const, amount: 299, category: 'ความบันเทิงและสังสรรค์', note: 'ดูภาพยนตร์วันหยุด', day: '07' },
    ];

    if ('isLocal' in user && user.isLocal) {
      const newSampleTxs: Transaction[] = samples.map((item, idx) => ({
        id: `sample_${Date.now()}_${idx}`,
        userId: user.uid,
        type: item.type,
        amount: item.amount,
        category: item.category,
        note: item.note,
        date: `${selectedMonth}-${item.day}`,
        createdAt: nowIso,
        updatedAt: nowIso,
      }));
      const merged = [...newSampleTxs, ...transactions];
      setTransactions(merged);
      localStorage.setItem(`monydb_tx_${user.uid}`, JSON.stringify(merged));
      if (!budget) {
        const defaultBudget: MonthlyBudget = {
          userId: user.uid,
          month: selectedMonth,
          budgetAmount: 20000,
          savingsGoal: 10000,
          updatedAt: nowIso,
        };
        setBudget(defaultBudget);
        localStorage.setItem(`monydb_budget_${user.uid}_${selectedMonth}`, JSON.stringify(defaultBudget));
      }
      addToast('success', 'เพิ่มชุดข้อมูลตัวอย่างเรียบร้อยแล้ว');
      return;
    }

    try {
      for (const item of samples) {
        await addDoc(collection(db, 'users', user.uid, 'transactions'), {
          userId: user.uid,
          type: item.type,
          amount: item.amount,
          category: item.category,
          note: item.note,
          date: `${selectedMonth}-${item.day}`,
          createdAt: nowIso,
          updatedAt: nowIso,
        });
      }
      if (!budget) {
        await setDoc(doc(db, 'users', user.uid, 'budgets', selectedMonth), {
          userId: user.uid,
          month: selectedMonth,
          budgetAmount: 20000,
          savingsGoal: 10000,
          updatedAt: nowIso,
        });
      }
      addToast('success', 'เพิ่มข้อมูลตัวอย่างลง MonyDB เรียบร้อยแล้ว');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/transactions`);
    }
  };

  const isUserLocal = user && 'isLocal' in user && user.isLocal;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Navigation Header */}
      <Navbar
        user={user}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onOpenAddModal={() => {
          setEditingTx(null);
          setIsTxModalOpen(true);
        }}
        onSignOut={handleSignOut}
        onSignIn={handleSignIn}
        loadingAuth={loadingAuth}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loadingAuth ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin" />
            <p className="text-sm font-medium text-slate-500">กำลังตรวจสอบการเข้าสู่ระบบ...</p>
          </div>
        ) : !user ? (
          <LoginView
            onSignIn={handleSignIn}
            onEmailSignIn={handleEmailSignIn}
            onEmailSignUp={handleEmailSignUp}
            onDemoSignIn={handleDemoSignIn}
            onLocalSignIn={handleLocalSignIn}
            loading={loadingAuth}
            error={authError}
            errorCode={authErrorCode}
            onClearError={() => {
              setAuthError(null);
              setAuthErrorCode(null);
            }}
          />
        ) : (
          <div className="space-y-6">
            {/* Top Bar for Logged-In User */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                  isUserLocal ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {isUserLocal ? <Zap className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm sm:text-base font-bold text-slate-900">
                      ภาพรวมรายรับรายจ่ายประจำเดือน
                    </h1>
                    {isUserLocal && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        Local Mode
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {isUserLocal
                      ? `บัญชี: ${user.email} • จัดเก็บข้อมูลในเครื่องพร้อมใช้งานได้ทันที`
                      : 'ซิงก์ข้อมูลอัตโนมัติกับฐานข้อมูล Firebase MonyDB แบบเรียลไทม์'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {monthTransactions.length === 0 && (
                  <button
                    id="btn-add-sample-data"
                    onClick={handleAddSampleData}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>โหลดข้อมูลตัวอย่าง</span>
                  </button>
                )}
              </div>
            </div>

            {/* 1. Monthly KPI & Budget Overview */}
            <MonthlyOverview
              selectedMonth={selectedMonth}
              totalIncome={summary.totalIncome}
              totalExpense={summary.totalExpense}
              netBalance={summary.netBalance}
              transactionCount={summary.transactionCount}
              budget={budget}
              onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            />

            {/* 2. Analytics Charts (Pie / Bar / Trend) */}
            <AnalyticsCharts
              selectedMonth={selectedMonth}
              summary={summary}
              transactions={monthTransactions}
            />

            {/* 3. Transaction List with Search and Filter */}
            <TransactionList
              transactions={monthTransactions}
              onOpenAddModal={() => {
                setEditingTx(null);
                setIsTxModalOpen(true);
              }}
              onEditTransaction={(tx) => {
                setEditingTx(tx);
                setIsTxModalOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
              selectedMonth={selectedMonth}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 MonyDB • ระบบจัดการรายรับรายจ่าย วิทยาลัยอาชีวศึกษาแพร่</p>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className={`w-2 h-2 rounded-full ${isUserLocal ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
            <span>{isUserLocal ? 'โหมดพร้อมใช้งานทันที (Local Mode)' : 'เชื่อมต่อกับ Firestore: monydb'}</span>
          </div>
        </div>
      </footer>

      {/* Transaction Modal (Add / Edit) */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTx}
        selectedMonth={selectedMonth}
      />

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        onSave={handleSaveBudget}
        currentBudget={budget?.budgetAmount}
        currentSavingsGoal={budget?.savingsGoal}
        selectedMonth={selectedMonth}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
