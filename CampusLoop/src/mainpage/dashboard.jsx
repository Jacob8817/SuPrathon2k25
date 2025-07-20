import React, { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar';
import axios from 'axios';
import { useUserStore } from '../store';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA336A'];

const Dashboard = () => {
  const user = useUserStore((s) => s.user);
  const [myApps, setMyApps] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const [topRecruiters, setTopRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const fetchStudentApps = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/application/my-applications/${user.registerno}`
        );
        setMyApps(res.data);
      } catch (err) {
        console.error('Error fetching student apps:', err);
        setError('Could not load your applications.');
      }
    };

    const fetchAnalytics = async () => {
      try {
        const [statusRes, topRes] = await Promise.all([
          axios.get('http://localhost:3000/api/application/stats/app-status'),
          axios.get('http://localhost:3000/api/application/top-recruiters')
        ]);
        // ensure numeric counts
        const parsedStatus = statusRes.data.map(s => ({
          status: s.status,
          count: Number(s.count)
        }));
        const parsedTop = topRes.data.map(r => ({
          company_name: r.company_name,
          recruited_count: Number(r.recruited_count)
        }));
        setStatusStats(parsedStatus);
        setTopRecruiters(parsedTop);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Could not load analytics.');
      }
    };

    const load = async () => {
      await fetchStudentApps();
      await fetchAnalytics();
      setLoading(false);
    };

    load();
  }, [user]);

  if (!user || loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-4 rounded shadow">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p>Welcome, {user.username}</p>
          </div>
          {user.imageurl && (
            <img src={user.imageurl} alt="Avatar" className="w-12 h-12 rounded-full" />
          )}
        </header>

        {/* Student View */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">My Applications</h2>
          {myApps.length === 0 ? (
            <p className="text-gray-600">You haven’t applied anywhere yet.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-2">Company</th>
                  <th className="py-2">Applied At</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {myApps.map(app => (
                  <tr key={app.application_id} className="border-t">
                    <td className="py-2">{app.company_name}</td>
                    <td className="py-2">{new Date(app.applied_at).toLocaleString()}</td>
                    <td className="py-2 font-medium">{app.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Analytics for All Users */}
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-lg font-medium text-gray-600">Total Applications</h3>
            <p className="text-3xl font-bold mt-2">{statusStats.reduce((sum, s) => sum + Number(s.count), 0)}</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-lg font-medium text-gray-600">Accepted (Selected)</h3>
            <p className="text-3xl font-bold mt-2">{statusStats.find(s => s.status === 'Selected')?.count || 0}</p>
          </div>
          <div className="bg-white p-6 rounded shadow text-center">
            <h3 className="text-lg font-medium text-gray-600">Rejected</h3>
            <p className="text-3xl font-bold mt-2">{statusStats.find(s => s.status === 'Rejected')?.count || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Application Status Breakdown</h2>
            {statusStats.length === 0 ? (
              <p className="text-gray-600">No data available yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusStats}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {statusStats.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip />
                  <ReLegend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Top Recruiters by Applications</h2>
            {topRecruiters.length === 0 ? (
              <p className="text-gray-600">No data available yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topRecruiters} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="company_name" />
                  <YAxis />
                  <ReTooltip />
                  <Bar dataKey="recruited_count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
