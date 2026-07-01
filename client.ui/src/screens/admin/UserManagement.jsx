import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import { Baseurl } from '../../config/apis';
import { toast } from 'react-toastify';
import { Shield, ShieldOff, Lock, Unlock, Search } from 'lucide-react';
import dayjs from 'dayjs';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [auth] = useAuth();

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get(`${Baseurl}/admin/users`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) fetchUsers();
  }, [auth]);

  const toggleUserStatus = async (userId, field, currentValue) => {
    // Basic protection on frontend, backend also verifies this
    if ((field === 'isadmin' || field === 'issuperadmin') && !auth?.user?.issuperadmin) {
      toast.error("Only Super Admins can change roles.");
      return;
    }

    try {
      const { data } = await axios.put(`${Baseurl}/admin/users/${userId}/status`, {
        [field]: !currentValue
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      if (data.success) {
        toast.success(data.message);
        setUsers(users.map(u => u._id === userId ? data.user : u));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user status");
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage accounts, roles, and access.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-sm font-medium">
                <th className="p-4">User</th>
                <th className="p-4">Role / Status</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-slate-500">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{user.full_name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {user.issuperadmin ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 w-max">
                            <Shield size={12} /> Super Admin
                          </span>
                        ) : user.isadmin ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 w-max">
                            <Shield size={12} /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 w-max">
                            User
                          </span>
                        )}
                        {user.isblocked && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 w-max">
                            Blocked
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                      {dayjs(user.createdAt).format('MMM D, YYYY')}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {auth?.user?.issuperadmin && !user.issuperadmin && (
                        <>
                          <button 
                            onClick={() => toggleUserStatus(user._id, 'isadmin', user.isadmin)}
                            className={`p-2 rounded-lg transition-colors ${user.isadmin ? 'bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:hover:bg-purple-500/30' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}
                            title={user.isadmin ? "Revoke Admin" : "Make Admin"}
                          >
                            {user.isadmin ? <ShieldOff size={18} /> : <Shield size={18} />}
                          </button>
                          <button 
                            onClick={() => toggleUserStatus(user._id, 'issuperadmin', user.issuperadmin)}
                            className={`p-2 rounded-lg transition-colors bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-500/20 dark:hover:text-indigo-400`}
                            title="Promote to Super Admin"
                          >
                            <Shield size={18} />
                          </button>
                        </>
                      )}
                      
                      {!user.issuperadmin && (
                        <button 
                          onClick={() => toggleUserStatus(user._id, 'isblocked', user.isblocked)}
                          className={`p-2 rounded-lg transition-colors ${user.isblocked ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30'}`}
                          title={user.isblocked ? "Unblock User" : "Block User"}
                        >
                          {user.isblocked ? <Unlock size={18} /> : <Lock size={18} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
