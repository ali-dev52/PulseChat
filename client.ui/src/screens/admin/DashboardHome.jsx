import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/auth';
import { Users, ShoppingCart, Package, MessageSquare } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { toast } from 'react-toastify';
import { Baseurl } from '../../config/apis';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <div 
    className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </div>
);

const DashboardHome = () => {
  const [stats, setStats] = useState({ users: 0, conversations: 0, messages: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auth] = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${Baseurl}/admin/stats`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        if (data.success) {
          setStats({
            users: data.stats.users || 0,
            conversations: data.stats.conversations || 0,
            messages: data.stats.messages || 0
          });
          
          // Format chart data (map month numbers to names)
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const formattedChart = data.chartData.users.map(item => ({
            name: monthNames[item._id - 1],
            users: item.count
          }));
          setChartData(formattedChart);
        }
      } catch (error) {
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    if (auth?.token) {
      fetchStats();
    }
  }, [auth]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-blue-100 opacity-90">Welcome back to Pulse Admin. Here is what is happening today.</p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute left-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={stats.users} icon={Users} color="bg-blue-500" delay={0} />
        <StatCard title="Conversations" value={stats.conversations} icon={Package} color="bg-orange-500" delay={100} />
        <StatCard title="Total Messages" value={stats.messages} icon={MessageSquare} color="bg-purple-500" delay={200} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">User Registrations (6 Months)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Activity Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[{name: 'Users', val: stats.users}, {name: 'Conversations', val: stats.conversations}]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                   cursor={{fill: 'transparent'}}
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="val" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
