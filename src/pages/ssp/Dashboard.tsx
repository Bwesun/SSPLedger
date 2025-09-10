import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRecords } from '../../context/RecordsContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileTextIcon, SprayCanIcon, CropIcon, DollarSignIcon } from 'lucide-react';
const Dashboard: React.FC = () => {
  const {
    user
  } = useAuth();
  const {
    getUserRecords
  } = useRecords();
  const records = useMemo(() => {
    if (!user) return [];
    return getUserRecords(user.id);
  }, [getUserRecords, user]);
  // Calculate statistics
  const totalRecords = records.length;
  const totalAreaTreated = records.reduce((sum, record) => sum + record.areaTreated, 0);
  const totalServiceCost = records.reduce((sum, record) => sum + record.serviceCost, 0);
  const uniqueCrops = [...new Set(records.map(record => record.cropsTreated))].length;
  // Prepare chart data - last 5 records
  const chartData = records.slice(-5).map(record => ({
    name: record.farmerName,
    areaTreated: record.areaTreated,
    serviceCost: record.serviceCost / 1000 // Convert to thousands for better display
  }));
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
                    {totalRecords}
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
                    {uniqueCrops}
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
                    {totalAreaTreated.toFixed(2)}
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
                    {totalServiceCost.toLocaleString()}
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
          {records.length > 0 ? <table className="min-w-full divide-y divide-gray-200">
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
                {records.slice(-5).map(record => <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.farmerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.serviceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.cropsTreated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.areaTreated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.serviceCost.toLocaleString()}
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