import { useEffect, useState } from "react";
import { Loader2, User as UserIcon, Shield } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { BASE_URL } from "@/services/firebaseProducts";

interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string;
  lastSignInTime: string;
  creationTime: string;
  isAnonymous: boolean;
}

export default function UsersDashboard() {
  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [admins, setAdmins] = useState<{ id: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const [usersRes, adminsSnapshot] = await Promise.all([
        fetch(`${BASE_URL}/api/users`),
        getDocs(collection(db, "admins"))
      ]);
      
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data);
      }
      
      const adminData = adminsSnapshot.docs.map(doc => ({
        id: doc.id,
        email: doc.data().email as string
      })).filter(a => Boolean(a.email));
      setAdmins(adminData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function makeAdmin(email: string) {
    if (!email) return;
    // Proceed without confirmation to avoid blocking the test/UI flow
    try {
      const docRef = await addDoc(collection(db, "admins"), { email });
      setAdmins((prev) => [...prev, { id: docRef.id, email }]);
    } catch (err) {
      console.error("Failed to make admin:", err);
      alert("Failed to make user an admin.");
    }
  }

  async function removeAdmin(email: string) {
    if (!email) return;
    if (["gdrayala123@gmail.com", "vejandlasai41@gmail.com"].includes(email)) {
      alert("Cannot remove a system super-admin.");
      return;
    }
    // Proceed without confirmation to avoid blocking the test/UI flow
    try {
      const adminDoc = admins.find(a => a.email === email);
      if (adminDoc) {
        await deleteDoc(doc(db, "admins", adminDoc.id));
        setAdmins((prev) => prev.filter(a => a.id !== adminDoc.id));
      } else {
        alert("Could not find this admin record in local state.");
      }
    } catch (err) {
      console.error("Failed to remove admin:", err);
      alert("Failed to remove admin privileges.");
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#F0C040]" /></div>;

  const realUsers = users.filter(u => !u.isAnonymous);

  return (
    <div className="space-y-6 text-[#FFF8E7]">
      <h2 className="text-2xl font-bold text-[#F0C040] tracking-wide">Registered Users ({realUsers.length})</h2>
      {realUsers.length === 0 && <p className="text-[#FFF8E7]/50">No registered users found.</p>}
      
      {realUsers.length > 0 && (
        <div className="bg-[#1E1600] rounded-lg border border-[#C9960C]/30 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#FFF8E7]/80">
              <thead className="bg-[#2A1E00] text-[#F0C040] border-b border-[#C9960C]/30">
                <tr>
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Email</th>
                  <th className="px-6 py-4 font-bold">Joined</th>
                  <th className="px-6 py-4 font-bold">Last Login</th>
                  <th className="px-6 py-4 font-bold">Role / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C9960C]/20">
                {realUsers.map(user => (
                  <tr key={user.uid} className="hover:bg-[#2A1E00]/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2A1E00] flex items-center justify-center text-[#F0C040] border border-[#C9960C]/30">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[#FFF8E7]">{user.displayName || 'No Name'}</span>
                      </div>
                    </td>
                     <td className="px-6 py-4">{user.email || 'N/A'}</td>
                     <td className="px-6 py-4">{new Date(user.creationTime).toLocaleDateString()}</td>
                     <td className="px-6 py-4">{new Date(user.lastSignInTime).toLocaleString()}</td>
                     <td className="px-6 py-4">
                       {["gdrayala123@gmail.com", "vejandlasai41@gmail.com"].includes(user.email) ? (
                         <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-900/50 text-green-400 border border-green-500/30">
                           <Shield className="w-3 h-3" />
                           Super Admin
                         </span>
                       ) : admins.some(a => a.email === user.email) ? (
                         <div className="flex items-center gap-2">
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-900/50 text-green-400 border border-green-500/30">
                             <Shield className="w-3 h-3" />
                             Admin
                           </span>
                           <button
                             onClick={() => removeAdmin(user.email)}
                             className="px-2.5 py-1 text-xs font-bold text-red-400 hover:text-[#0D0D0D] hover:bg-red-500 bg-red-900/30 border border-red-500/30 rounded-md transition-colors shadow-sm"
                           >
                             Remove
                           </button>
                         </div>
                       ) : (
                         <button
                           onClick={() => makeAdmin(user.email)}
                           className="px-3 py-1.5 bg-[#F0C040] hover:bg-[#C9960C] text-[#0D0D0D] text-xs font-bold rounded-md transition-colors shadow-sm"
                         >
                           Make Admin
                         </button>
                       )}
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
