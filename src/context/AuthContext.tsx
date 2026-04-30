import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  onAuthStateChanged, 
  signInAnonymously, 
  signOut, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dynamicAdmins, setDynamicAdmins] = useState<string[]>([]);

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const snapshot = await getDocs(collection(db, "admins"));
        const emails = snapshot.docs.map(doc => doc.data().email as string).filter(Boolean);
        setDynamicAdmins(emails);
      } catch (err) {
        console.error("Failed to fetch dynamic admins", err);
      }
    }
    void fetchAdmins();
  }, [user]);

  const adminEmails = ["gdrayala123@gmail.com", "vejandlasai41@gmail.com", ...dynamicAdmins];
  const isAdmin = user?.email ? adminEmails.includes(user.email) : false;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        // Automatically sign in anonymously to allow seamless checkout
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Anonymous sign in failed", error);
          setLoading(false);
        }
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign in failed", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // It will automatically trigger onAuthStateChanged and sign them in anonymously again
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, loginWithGoogle, logout }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-[#f7f4ee]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D32F2F]"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
