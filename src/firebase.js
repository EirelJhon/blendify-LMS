/**
 * BLENDIFY FIREBASE SERVICE
 * Modular integration supporting Firebase Authentication, Firestore Database, and Cloud Storage.
 * Designed with dual-mode architecture:
 * - Online / Production: Uses live Firebase Auth, Firestore, and Cloud Storage when credentials are provided.
 * - Local / Offline: Seamlessly falls back to SQLite WebAssembly without errors when keys are not yet configured.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  uploadString,
  getDownloadURL
} from 'firebase/storage';

// Read Firebase configuration from Vite environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

/**
 * Check if valid Firebase configuration is provided
 */
export function isFirebaseConfigured() {
  const { apiKey, projectId } = firebaseConfig;
  return Boolean(
    apiKey &&
    projectId &&
    apiKey !== 'your-firebase-api-key' &&
    projectId !== 'your-firebase-project-id'
  );
}

let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log('[Blendify Firebase] Live Firebase client initialized successfully. Project:', firebaseConfig.projectId);
  } catch (err) {
    console.warn('[Blendify Firebase] Initialization error, falling back to SQLite:', err);
  }
} else {
  console.log('[Blendify Firebase] Firebase environment variables not set. Operating in SQLite WebAssembly mode.');
}

/**
 * Get current Firebase status
 */
export function getFirebaseStatus() {
  const configured = isFirebaseConfigured();
  return {
    configured,
    projectId: configured ? firebaseConfig.projectId : null,
    storageBucket: configured ? firebaseConfig.storageBucket : null,
    services: configured ? ['Authentication', 'Firestore', 'Cloud Storage'] : []
  };
}

/**
 * Register new user with Firebase Authentication and save extra profile to Firestore
 */
export async function firebaseSignUp(email, password, displayName, role = 'student') {
  if (!isFirebaseConfigured() || !auth) {
    return {
      success: false,
      configured: false,
      message: 'Firebase is not configured. Saved to local SQLite database.'
    };
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

    // Save user document in Firestore 'users' collection
    if (db) {
      try {
        await setDoc(doc(db, 'users', cred.user.uid), {
          uid: cred.user.uid,
          email: email.trim().toLowerCase(),
          name: displayName || email.split('@')[0],
          role: role,
          createdAt: serverTimestamp()
        });
      } catch (fsErr) {
        console.warn('[Blendify Firebase] Firestore user doc save warning:', fsErr);
      }
    }

    return {
      success: true,
      configured: true,
      user: {
        uid: cred.user.uid,
        email: cred.user.email,
        name: displayName || cred.user.displayName || email.split('@')[0],
        role: role
      }
    };
  } catch (error) {
    console.error('[Blendify Firebase] Sign up error:', error);
    return {
      success: false,
      configured: true,
      error: error.message || String(error),
      code: error.code
    };
  }
}

/**
 * Sign in user with Firebase Authentication
 */
export async function firebaseSignIn(email, password) {
  if (!isFirebaseConfigured() || !auth) {
    return {
      success: false,
      configured: false,
      message: 'Firebase is not configured.'
    };
  }

  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    let role = 'student';

    // Retrieve role from Firestore if exists
    if (db) {
      try {
        const userDocRef = doc(db, 'users', cred.user.uid);
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.role) role = data.role;
        }
      } catch (fsErr) {
        console.warn('[Blendify Firebase] Firestore fetch warning:', fsErr);
      }
    }

    return {
      success: true,
      configured: true,
      user: {
        uid: cred.user.uid,
        email: cred.user.email,
        name: cred.user.displayName || email.split('@')[0],
        role: role
      }
    };
  } catch (error) {
    console.error('[Blendify Firebase] Sign in error:', error);
    return {
      success: false,
      configured: true,
      error: error.message || String(error),
      code: error.code
    };
  }
}

/**
 * Upload file to Firebase Cloud Storage and return public download URL
 */
export async function firebaseUploadFile(fileOrBlob, destinationPath) {
  if (!isFirebaseConfigured() || !storage) {
    return {
      success: false,
      configured: false,
      message: 'Firebase Storage not configured.'
    };
  }

  try {
    const sRef = storageRef(storage, destinationPath);
    let snapshot;
    if (typeof fileOrBlob === 'string' && fileOrBlob.startsWith('data:')) {
      snapshot = await uploadString(sRef, fileOrBlob, 'data_url');
    } else {
      snapshot = await uploadBytes(sRef, fileOrBlob);
    }
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return {
      success: true,
      configured: true,
      downloadUrl,
      fullPath: snapshot.metadata.fullPath
    };
  } catch (error) {
    console.error('[Blendify Firebase] File upload error:', error);
    return {
      success: false,
      configured: true,
      error: error.message || String(error)
    };
  }
}

/**
 * Sign out from Firebase
 */
export async function firebaseSignOut() {
  if (isFirebaseConfigured() && auth) {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('[Blendify Firebase] Sign out error:', e);
    }
  }
}

export { auth, db, storage };
