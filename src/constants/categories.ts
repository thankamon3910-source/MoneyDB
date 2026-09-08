import { CategoryItem } from '../types';

export const EXPENSE_CATEGORIES: CategoryItem[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', type: 'expense', icon: 'Utensils', color: '#EF4444', bgColor: '#FEE2E2' },
  { id: 'transport', name: 'การเดินทาง / น้ำมัน', type: 'expense', icon: 'Car', color: '#F97316', bgColor: '#FFEDD5' },
  { id: 'housing', name: 'ค่าที่พัก / ค่าเช่า', type: 'expense', icon: 'Home', color: '#8B5CF6', bgColor: '#EDE9FE' },
  { id: 'bills', name: 'ค่าน้ำ ค่าไฟ อินเทอร์เน็ต', type: 'expense', icon: 'Zap', color: '#EAB308', bgColor: '#FEF9C3' },
  { id: 'shopping', name: 'ช้อปปิ้งและของใช้', type: 'expense', icon: 'ShoppingBag', color: '#EC4899', bgColor: '#FCE7F3' },
  { id: 'entertainment', name: 'ความบันเทิงและสังสรรค์', type: 'expense', icon: 'Film', color: '#06B6D4', bgColor: '#CFFAFE' },
  { id: 'health', name: 'สุขภาพและการรักษา', type: 'expense', icon: 'HeartPulse', color: '#10B981', bgColor: '#D1FAE5' },
  { id: 'education', name: 'การศึกษาและหนังสือ', type: 'expense', icon: 'GraduationCap', color: '#6366F1', bgColor: '#E0E7FF' },
  { id: 'family', name: 'ครอบครัวและสัตว์เลี้ยง', type: 'expense', icon: 'Smile', color: '#14B8A6', bgColor: '#CCFBF1' },
  { id: 'other_expense', name: 'ค่าใช้จ่ายอื่นๆ', type: 'expense', icon: 'MoreHorizontal', color: '#64748B', bgColor: '#F1F5F9' },
];

export const INCOME_CATEGORIES: CategoryItem[] = [
  { id: 'salary', name: 'เงินเดือนประจำ', type: 'income', icon: 'Briefcase', color: '#10B981', bgColor: '#D1FAE5' },
  { id: 'freelance', name: 'งานเสริม / ฟรีแลนซ์', type: 'income', icon: 'Laptop', color: '#059669', bgColor: '#A7F3D0' },
  { id: 'business', name: 'ธุรกิจส่วนตัว / ค้าขาย', type: 'income', icon: 'Store', color: '#0D9488', bgColor: '#99F6E4' },
  { id: 'investment', name: 'เงินปันผล / การลงทุน', type: 'income', icon: 'TrendingUp', color: '#2563EB', bgColor: '#DBEAFE' },
  { id: 'bonus', name: 'โบนัสและเงินรางวัล', type: 'income', icon: 'Gift', color: '#7C3AED', bgColor: '#DDD6FE' },
  { id: 'other_income', name: 'รายรับอื่นๆ', type: 'income', icon: 'Coins', color: '#475569', bgColor: '#E2E8F0' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryInfo(name: string, type: 'income' | 'expense'): CategoryItem {
  const match = ALL_CATEGORIES.find(c => c.name === name);
  if (match) return match;
  return type === 'income' ? INCOME_CATEGORIES[INCOME_CATEGORIES.length - 1] : EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export function formatThaiMonth(yearMonthStr: string): string {
  // YYYY-MM
  const [yearStr, monthStr] = yearMonthStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthIdx = parseInt(monthStr, 10) - 1;
  const thaiYear = year + 543;
  return `${THAI_MONTHS[monthIdx] || ''} ${thaiYear}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
