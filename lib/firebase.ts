import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
console.log("Firebase: Initializing app with config", { projectId: firebaseConfig.projectId });
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  console.log("Firebase: Starting Google Sign In");
  return signInWithPopup(auth, googleProvider);
};
export const logout = () => {
  console.log("Firebase: Starting Logout");
  return signOut(auth);
};

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
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): Error {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  
  console.error('Firestore Error: ', JSON.stringify(errInfo));

  // Create a user-friendly message
  let userMessage = 'Ocurrió un error al procesar la solicitud.';
  const lowerError = errorMessage.toLowerCase();
  
  if (lowerError.includes('permission-denied')) {
    userMessage = 'No tienes permisos para realizar esta acción.';
  } else if (lowerError.includes('quota-exceeded')) {
    userMessage = 'Se ha excedido la cuota de uso. Intenta de nuevo más tarde.';
  } else if (lowerError.includes('not-found')) {
    userMessage = 'El recurso solicitado no fue encontrado.';
  } else if (lowerError.includes('unavailable')) {
    userMessage = 'El servicio no está disponible temporalmente. Revisa tu conexión.';
  } else if (lowerError.includes('unauthenticated')) {
    userMessage = 'Debes estar autenticado para realizar esta acción.';
  }

  const finalError = new Error(userMessage);
  (finalError as any).details = errInfo;
  return finalError;
}

// Connection test
export async function testFirestoreConnection() {
  console.log("Firebase: Testing Firestore connection...");
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase: Firestore connection test successful (or doc not found, which is fine)");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firebase: Please check your Firebase configuration. The client is offline.");
    } else {
      console.log("Firebase: Firestore connection test finished with expected error (doc not found)", error);
    }
  }
}
