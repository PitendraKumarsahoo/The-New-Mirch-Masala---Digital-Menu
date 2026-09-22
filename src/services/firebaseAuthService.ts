import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
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

export interface CustomerProfileDoc {
  uid: string;
  email?: string;
  displayName?: string;
  phone?: string;
  photoURL?: string;
  favoriteDishIds: string[];
  preferredSpiceLevel?: string;
  dietaryPreference?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Sign in with Google Popup
 */
export async function signInWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    // Sync profile to Firestore
    await syncUserProfileToFirestore(user);
    return { success: true, user };
  } catch (error: any) {
    console.error('[FirebaseAuth] Google Sign-In Error:', error);
    let errorMsg = 'Google sign-in failed. Please try again.';
    if (error?.code === 'auth/popup-closed-by-user') {
      errorMsg = 'Sign-in popup was closed before completing.';
    } else if (error?.code === 'auth/popup-blocked') {
      errorMsg = 'Pop-up was blocked by browser. Please allow popups for this site.';
    } else if (error?.message) {
      errorMsg = error.message;
    }
    return { success: false, error: errorMsg };
  }
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(
  email: string,
  pass: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    await syncUserProfileToFirestore(result.user);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error('[FirebaseAuth] Email Sign-In Error:', error);
    let errorMsg = 'Invalid email or password.';
    if (error?.code === 'auth/user-not-found' || error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') {
      errorMsg = 'Incorrect email or password. Please check and try again.';
    } else if (error?.code === 'auth/invalid-email') {
      errorMsg = 'Please enter a valid email address.';
    } else if (error?.message) {
      errorMsg = error.message;
    }
    return { success: false, error: errorMsg };
  }
}

/**
 * Sign up with Email and Password
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (displayName.trim()) {
      await updateProfile(result.user, { displayName: displayName.trim() });
    }
    await syncUserProfileToFirestore(result.user, displayName.trim());
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error('[FirebaseAuth] Email Sign-Up Error:', error);
    let errorMsg = 'Registration failed. Please try again.';
    if (error?.code === 'auth/email-already-in-use') {
      errorMsg = 'An account with this email already exists. Please sign in.';
    } else if (error?.code === 'auth/weak-password') {
      errorMsg = 'Password should be at least 6 characters.';
    } else if (error?.code === 'auth/invalid-email') {
      errorMsg = 'Please enter a valid email address.';
    } else if (error?.message) {
      errorMsg = error.message;
    }
    return { success: false, error: errorMsg };
  }
}

/**
 * Sign Out
 */
export async function signOutCustomer(): Promise<void> {
  await signOut(auth);
}

/**
 * Sync user profile to Firestore `users/{uid}`
 */
export async function syncUserProfileToFirestore(user: User, customName?: string): Promise<void> {
  if (!user || !user.uid) return;
  const path = `users/${user.uid}`;
  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    const now = new Date().toISOString();

    if (!snap.exists()) {
      const newProfile: CustomerProfileDoc = {
        uid: user.uid,
        email: user.email || '',
        displayName: customName || user.displayName || user.email?.split('@')[0] || 'Customer',
        photoURL: user.photoURL || '',
        favoriteDishIds: [],
        createdAt: now,
        updatedAt: now,
      };
      await setDoc(userRef, newProfile);
    } else {
      const data = snap.data();
      await updateDoc(userRef, {
        displayName: customName || user.displayName || data.displayName || 'Customer',
        email: user.email || data.email || '',
        photoURL: user.photoURL || data.photoURL || '',
        updatedAt: now,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Get user favorites from Firestore
 */
export async function getUserFavoritesFromFirestore(uid: string): Promise<string[]> {
  if (!uid) return [];
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      const data = snap.data();
      return Array.isArray(data.favoriteDishIds) ? data.favoriteDishIds : [];
    }
    return [];
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

/**
 * Save user favorites to Firestore
 */
export async function saveUserFavoritesToFirestore(uid: string, favoriteDishIds: string[]): Promise<void> {
  if (!uid) return;
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(
      userRef,
      {
        favoriteDishIds,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Subscribe to auth state changes
 */
export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}
