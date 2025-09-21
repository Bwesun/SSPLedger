import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRecords } from '../../context/RecordsContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileTextIcon, SprayCanIcon, CropIcon, DollarSignIcon } from 'lucide-react';

const API_URL = 'http://localhost:3001/api';
const token = localStorage.getItem('token');
console.log('SSP Dashboard Token: ', token)

const Dashboard: React.FC = () => {
  const {
    user
  } = useAuth();
  const {
    records
  } = useRecords();
  const [dashboardData, setDashboardData] = useState({
    totalRecords: 0,
    totalAreaTreated: 0,
    totalServiceCost: 0,
    uniqueCrops: 0,
    recentRecords: [] as any [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      const response = await fetch(`${API_URL}/ssp/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setDashboardData(data);
    };
    fetchDashboardData();
  }, [records]);

  const chartData = dashboardData.recentRecords.map((record: any) => ({
    name: record.farmer_name,
    areaTreated: record.area_treated,
    serviceCost: record.service_cost / 1000,
  }));
  console.log('Chart Data: ', chartData);
  console.log('Dashboard Data: ', dashboardData);
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, {user?.name}</p>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <FileTextIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Records
                  </dt>
                  <dd className="text-xl font-semibold text-gray-900">
                    {dashboardData.totalRecords}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <CropIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Unique Crops
                  </dt>
                  <dd className="text-xl font-semibold text-gray-900">
                    {dashboardData.uniqueCrops}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <SprayCanIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Area Treated (Ha)
                  </dt>
                  <dd className="text-xl font-semibold text-gray-900">
                    {dashboardData.totalAreaTreated.toFixed(2)}
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
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Revenue (₦)
                  </dt>
                  <dd className="text-xl font-semibold text-gray-900">
                    {dashboardData.totalServiceCost.toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Chart */}
      <div className="bg-white p-6 shadow rounded-lg">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Recent Services
        </h2>
        <div className="h-64">
          {chartData.length > 0 ? <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="areaTreated" name="Area Treated (Ha)" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="serviceCost" name="Service Cost (₦'000)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer> : <div className="h-full flex items-center justify-center text-gray-500">
              No data available. Add records to see analytics.
            </div>}
        </div>
      </div>
      {/* Recent Records */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Recent Records</h2>
        </div>
        <div className="border-t border-gray-200 overflow-x-auto">
          {dashboardData.recentRecords.length > 0 ? <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Farmer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crop
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Area (Ha)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost (₦)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentRecords.map((record: any) => <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.farmer_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.service_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.crops_treated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.area_treated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.service_cost}
                    </td>
                  </tr>)}
              </tbody>
            </table> : <div className="text-center py-4 text-gray-500">
              No records found. Start by adding a record.
            </div>}
        </div>
      </div>
    </div>;
};
export default Dashboard;