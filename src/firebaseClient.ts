import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, User } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  QuerySnapshot,
  DocumentData,
  Timestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYVi-JLI2ozFZTbzv9mCWFLSRTt1kA_Ck",
  authDomain: "tower-defence-8d0fd.firebaseapp.com",
  projectId: "tower-defence-8d0fd",
  storageBucket: "tower-defence-8d0fd.firebasestorage.app",
  messagingSenderId: "966369126605",
  appId: "1:966369126605:web:a6c4abe15063af09d0e184",
  measurementId: "G-17E1E14DJK",
};

let app: any;
let auth: any;
let db: any;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.log("Firebase initialization note:", error);
  app = initializeApp(firebaseConfig, "secondary");
  auth = getAuth(app);
  db = getFirestore(app);
}

export type LeaderboardEntry = {
  id?: string;
  name: string;
  score: number;
  createdAt: Date | null;
  uid?: string;
};

// Track initialization state
let isInitialized = false;

export async function initFirebase(): Promise<User | null> {
  if (isInitialized) {
    return auth.currentUser;
  }
  
  try {
    const cred = await signInAnonymously(auth);
    isInitialized = true;
    console.log("Firebase initialized successfully with user:", cred.user.uid);
    return cred.user;
  } catch (err) {
    console.error("Firebase init error:", err);
    return null;
  }
}

export async function submitScore(name: string, score: number): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("No authenticated user. Call initFirebase() first.");
      await initFirebase();
    }

    if (!name || name.trim().length === 0) name = "Anonymous";

    await addDoc(collection(db, "leaderboard"), {
      name: name.trim(),
      score,
      uid: auth.currentUser?.uid || "unknown",
      createdAt: serverTimestamp(),
    });
    
    console.log("Score submitted successfully:", { name, score });
    return true;
  } catch (err) {
    console.error("submitScore error:", err);
    return false;
  }
}

function convertTimestamps(data: any): LeaderboardEntry {
  return {
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null
  };
}

export function subscribeTopN(n: number, cb: (rows: LeaderboardEntry[]) => void) {
  const q = query(
    collection(db, "leaderboard"),
    orderBy("score", "desc"),
    limit(n)
  );

  return onSnapshot(q, 
    (snap: QuerySnapshot<DocumentData>) => {
      const entries: LeaderboardEntry[] = snap.docs.map((doc) => {
        const data = doc.data();
        return convertTimestamps({
          id: doc.id,
          ...data
        });
      }) as LeaderboardEntry[];
      cb(entries);
    },
    (error) => {
      console.error("Error in subscribeTopN:", error);
    }
  );
}

export function subscribeTop20(cb: (rows: LeaderboardEntry[]) => void) {
  return subscribeTopN(20, cb);
}

export function subscribeAllScores(cb: (rows: LeaderboardEntry[]) => void) {
  const q = query(
    collection(db, "leaderboard"),
    orderBy("score", "desc")
  );

  return onSnapshot(q, 
    (snap: QuerySnapshot<DocumentData>) => {
      const entries: LeaderboardEntry[] = snap.docs.map((doc) => {
        const data = doc.data();
        return convertTimestamps({
          id: doc.id,
          ...data
        });
      }) as LeaderboardEntry[];
      cb(entries);
    },
    (error) => {
      console.error("Error in subscribeAllScores:", error);
    }
  );
}

export function isFirebaseConnected(): boolean {
  return isInitialized && auth.currentUser !== null;
}