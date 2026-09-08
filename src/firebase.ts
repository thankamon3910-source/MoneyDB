import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId when custom database is provisioned
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function formatAuthErrorMessage(error: unknown): {
  message: string;
  code?: string;
  isUnauthorizedDomain?: boolean;
  isPopupBlocked?: boolean;
} {
  if (!error) return { message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' };
  const err = error as { code?: string; message?: string };
  const code = err.code || '';

  if (code === 'auth/unauthorized-domain') {
    return {
      message: 'โดเมนเว็บไซต์นี้ยังไม่ได้เพิ่มใน Authorized Domains ของโครงการ Firebase (Firebase: auth/unauthorized-domain) กรุณาดูคำแนะนำการเพิ่มโดเมน หรือเข้าใช้งานด้วยโหมดทดลองใช้งานด่วนได้ทันที',
      code,
      isUnauthorizedDomain: true,
    };
  }

  if (code === 'auth/popup-blocked') {
    return {
      message: 'เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป (Popup Blocked) เนื่องจากเปิดในหน้าต่างตัวอย่าง กรุณากดปุ่ม "เปิดในแท็บใหม่" ด้านล่าง หรืออนุญาตป๊อปอัป',
      code,
      isPopupBlocked: true,
    };
  }

  if (code === 'auth/popup-closed-by-user') {
    return {
      message: 'หน้าต่างเข้าสู่ระบบถูกปิดก่อนดำเนินการเสร็จสิ้น กรุณาลองใหม่อีกครั้ง',
      code,
    };
  }

  if (code === 'auth/cancelled-popup-request') {
    return {
      message: 'มีการเรียกเปิดหน้าต่างเข้าสู่ระบบซ้ำซ้อน กรุณารอสักครู่แล้วลองใหม่',
      code,
    };
  }

  if (code === 'auth/operation-not-allowed') {
    return {
      message: 'วิธีการเข้าสู่ระบบนี้ยังไม่เปิดใช้งานใน Firebase Console กรุณาเลือกวิธีอื่น เช่น ใช้อีเมล/รหัสผ่าน หรือทดลองใช้งานด่วน',
      code,
    };
  }

  if (code === 'auth/user-not-found') {
    return {
      message: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณากดสร้างบัญชีใหม่',
      code,
    };
  }

  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return {
      message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
      code,
    };
  }

  if (code === 'auth/email-already-in-use') {
    return {
      message: 'อีเมลนี้ถูกลงทะเบียนไว้แล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่าน',
      code,
    };
  }

  if (code === 'auth/weak-password') {
    return {
      message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
      code,
    };
  }

  if (code === 'auth/invalid-email') {
    return {
      message: 'รูปแบบอีเมลไม่ถูกต้อง',
      code,
    };
  }

  if (code === 'auth/network-request-failed') {
    return {
      message: 'เกิดปัญหาการเชื่อมต่อเครือข่าย กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง',
      code,
    };
  }

  return {
    message: err.message || 'ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง',
    code,
  };
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// CRITICAL CONSTRAINT: Test connection to Firestore on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase MonyDB: client is offline, check connection.');
      return false;
    }
    // Any other response like permission-denied or doc-not-found means server was reached
    return true;
  }
}

export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  updateProfile,
  signOut
};
