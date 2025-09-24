import React, { useState, useEffect } from 'react';
import { useRecords } from '../../context/RecordsContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Logo from '../../assets/logo.png';
import { FileTextIcon, UsersIcon, CropIcon, DollarSignIcon } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const API_URL = import.meta.env.VITE_API_URL;

type RecentRecord = {
  id?: string;
  serialNumber?: number;
  sspName?: string;
  farmerName?: string;
  serviceDate?: string;
  cropsTreated?: string;
  area_treated?: number;
  service_cost?: number;
  ppeUsed?: boolean;
  [key: string]: any;
};

type DashboardState = {
  totalRecords: number;
  totalAreaTreated: number;
  totalServiceCost: number;
  totalSsp: number;
  totalUsers?: number;
  recentRecords: RecentRecord[];
  cropData: any[];
  monthlyData: any[];
  sspData: any[];
};

const Dashboard: React.FC = () => {
  const { records } = useRecords();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const [dashboardData, setDashboardData] = useState<DashboardState>({
    totalRecords: 0,
    totalAreaTreated: 0,
    totalServiceCost: 0,
    totalSsp: 0,
    totalUsers: 0,
    recentRecords: [],
    cropData: [],
    monthlyData: [],
    sspData: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/dashboard`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        });
        if (!res.ok) {
          console.error('Failed to fetch dashboard:', res.statusText);
          return;
        }
        const data = await res.json();
        setDashboardData((prev) => ({
          ...prev,
          totalRecords: data.totalRecords ?? prev.totalRecords,
          totalAreaTreated: data.totalAreaTreated ?? prev.totalAreaTreated,
          totalServiceCost: data.totalServiceCost ?? prev.totalServiceCost,
          totalSsp: data.totalSsp ?? prev.totalSsp,
          totalUsers: data.totalUsers ?? prev.totalUsers,
          recentRecords: Array.isArray(data.recentRecords) ? data.recentRecords : prev.recentRecords,
          // If backend provides chart data, use it; otherwise try to derive minimal datasets
          monthlyData: Array.isArray(data.monthlyData)
            ? data.monthlyData
            : deriveMonthlyFromRecords(data.recentRecords ?? records),
          cropData: Array.isArray(data.cropData) ? data.cropData : deriveCropDistribution(data.recentRecords ?? records),
          sspData: Array.isArray(data.sspData) ? data.sspData : deriveSspPerformance(data.recentRecords ?? records),
        }));
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records]);


  // Simple helpers to derive chart-ready data when backend does not supply them
  function deriveCropDistribution(src: any[]): any[] {
    if (!Array.isArray(src) || src.length === 0) return [];
    const counts: Record<string, number> = {};
    src.forEach((r) => {
      const crop = (r.crops_treated || 'Unknown').toString();
      counts[crop] = (counts[crop] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }

  // Simple helper to derive monthly data
  function deriveMonthlyFromRecords(src: any[]): any[] {
    if (!Array.isArray(src) || src.length === 0) return [];
    const months: Record<string, { name: string; area_treated: number; service_cost: number }> = {};
    src.forEach((r) => {
      const d = r.service_date ? new Date(r.service_date) : new Date();
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (!months[key]) months[key] = { name: d.toLocaleString('default', { month: 'short', year: 'numeric' }), area_treated: 0, service_cost: 0 };
      months[key].area_treated += Number(r.area_treated ?? 0);
      months[key].service_cost += Number(r.service_cost ?? 0);
    });
    return Object.values(months);
  }

  // Simple helper to derive ssp performance
  function deriveSspPerformance(src: any[]): any[] {
    if (!Array.isArray(src) || src.length === 0) return [];
    const map: Record<string, { name: string; records: number; revenue: number; area: number }> = {};
    src.forEach((r) => {
      const ssp = r.farmer_name ?? 'Unknown';
      if (!map[ssp]) map[ssp] = { name: ssp, records: 0, revenue: 0, area: 0 };
      map[ssp].records += 1;
      map[ssp].revenue += Number(r.serviceCost ?? 0);
      map[ssp].area += Number(r.area_treated ?? 0);
    });
    return Object.values(map);
  }

  // Serial Numbering
  let sn = 1;


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <img src={Logo} alt="Logo" className="h-24 w-24 mr-4 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Overview of all SSP activities</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <FileTextIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Records</dt>
                  <dd className="text-xl font-semibold text-gray-900">{dashboardData.totalRecords}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Registered SSPs</dt>
                  <dd className="text-xl font-semibold text-gray-900">{dashboardData.totalSsp}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <CropIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Area Treated (Ha)</dt>
                  <dd className="text-xl font-semibold text-gray-900">
                    {(dashboardData.totalAreaTreated ?? 0).toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <DollarSignIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue (₦)</dt>
                  <dd className="text-xl font-semibold text-gray-900">
                    {(dashboardData.totalServiceCost ?? 0).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Monthly Activity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="area_treated" name="Area Treated (Ha)" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="service_cost" name="Service Cost (₦)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Crop Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.cropData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {dashboardData.cropData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SSP Performance */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">SSP Performance</h2>
        </div>
        <div className="border-t border-gray-200">
          <div className="h-64 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.sspData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="records" name="Records" fill="#8884d8" />
                {/* <Bar dataKey="revenue" name="Revenue (₦)" fill="#82ca9d" /> */}
                <Bar dataKey="area" name="Area (Ha)" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent records preview */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium mb-3">Recent Records</h3>

        <div className="overflow-x-auto">
          {dashboardData.recentRecords.length === 0 ? (
            <p className="text-sm text-gray-500">No recent records.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S/N</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SSP ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Area (Ha)</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost (₦)</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PPE</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentRecords.map((r, i) => {
                  let serial = 1;
                  const ssp = r.ssp_id ?? r.sspName ?? 'Unknown SSP';
                  const farmer = r.farmerName ?? r.farmer_name ?? 'Unknown';
                  const phone = r.farmerPhone ?? r.farmer_phone ?? '—';
                  const date = r.serviceDate ?? r.service_date ?? null;
                  const crop = r.cropsTreated ?? r.crops_treated ?? '—';
                  const area = Number(r.areaTreated ?? r.area_treated ?? 0);
                  const cost = Number(r.serviceCost ?? r.service_cost ?? 0);
                  const ppe = typeof r.ppeUsed !== 'undefined' ? (r.ppeUsed ?? r.ppe_used) : (r.ppe_used ?? false);
                  const remarks = r.remarks ?? r.remark ?? r.notes ?? '—';
                  return (
                    <tr key={r.id ?? `${serial}-${i}`}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{sn++}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{ssp}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{farmer}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{phone}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {date ? new Date(date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{crop}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{area.toFixed(2)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{cost.toLocaleString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            ppe ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {ppe ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{remarks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;