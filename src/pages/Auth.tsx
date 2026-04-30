import { useState } from "react";
import { useNavigate, Navigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { LogIn, UserPlus, Mail, Lock, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export default function AuthPage() {
  const { user, isAdmin, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If user is already an admin, redirect to admin panel
  // If user is logged in but NOT admin, redirect to home (or checkout if they were there)
  if (user && isAdmin) {
    return <Navigate to="/admin" />;
  } else if (user && !user.isAnonymous) {
    return <Navigate to="/" />;
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#FFF8E7]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src="/images/logo.jpeg"
            alt="Zixo Cookies"
            className="h-16 w-16 rounded-full object-cover border border-[#C9960C]/30"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-[#F0C040] tracking-wide">
          {isLogin ? "Sign in to your account" : "Create a new account"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#1E1600] py-8 px-4 shadow-md sm:rounded-lg sm:px-10 border border-[#C9960C]/30">
          <form className="space-y-6" onSubmit={handleEmailSubmit}>
            <div>
              <label className="block text-sm font-bold text-[#FFF8E7]/80">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[#FFF8E7]/50" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:border-[#F0C040] block w-full pl-10 sm:text-sm bg-[#2A1E00] text-[#FFF8E7] border-[#C9960C]/40 rounded-md h-11 border outline-none px-3"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#FFF8E7]/80">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#FFF8E7]/50" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:border-[#F0C040] block w-full pl-10 sm:text-sm bg-[#2A1E00] text-[#FFF8E7] border-[#C9960C]/40 rounded-md h-11 border outline-none px-3"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-950/20 border border-red-500/30 p-2 rounded-md font-bold">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-[#0D0D0D] bg-[#F0C040] hover:bg-[#C9960C] disabled:opacity-70 transition-colors items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
                {isLogin ? "Sign in" : "Sign up"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#C9960C]/30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#1E1600] text-[#FFF8E7]/50">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full inline-flex justify-center py-3 px-4 border border-[#C9960C]/30 rounded-md shadow-sm bg-[#2A1E00] text-sm font-bold text-[#FFF8E7] hover:bg-[#1E1600] focus:outline-none transition-colors items-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center text-sm">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-[#F0C040] hover:text-[#C9960C] transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
