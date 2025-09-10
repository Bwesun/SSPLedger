import React from 'react';
import { useRecords } from '../../context/RecordsContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileTextIcon, UsersIcon, CropIcon, DollarSignIcon } from 'lucide-react';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const Dashboard: React.FC = () => {
  const {
    getAllRecords
  } = useRecords();
  const records = getAllRecords();
  // Calculate statistics
  const totalRecords = records.length;
  const totalAreaTreated = records.reduce((sum, record) => sum + record.areaTreated, 0);
  const totalServiceCost = records.reduce((sum, record) => sum + record.serviceCost, 0);
  const uniqueSSPs = [...new Set(records.map(record => record.sspId))].length;
  const uniqueFarmers = [...new Set(records.map(record => record.farmerName))].length;
  const uniqueCrops = [...new Set(records.map(record => record.cropsTreated))];
  // Prepare chart data - crop distribution
  const cropData = uniqueCrops.map(crop => ({
    name: crop,
    value: records.filter(record => record.cropsTreated === crop).length
  }));
  // Prepare monthly service cost data
  const monthlyData = Array(12).fill(0).map((_, i) => {
    const month = i + 1;
    const monthRecords = records.filter(record => {
      const recordDate = new Date(record.serviceDate);
      return recordDate.getMonth() === i;
    });
    return {
      name: new Date(0, i).toLocaleString('default', {
        month: 'short'
      }),
      serviceCost: monthRecords.reduce((sum, record) => sum + record.serviceCost, 0) / 1000,
      areaTreated: monthRecords.reduce((sum, record) => sum + record.areaTreated, 0)
    };
  });
  // Prepare SSP performance data
  const sspData = [...new Set(records.map(record => record.sspId))].map(sspId => {
    const sspRecords = records.filter(record => record.sspId === sspId);
    const sspName = sspRecords[0]?.sspName || `SSP ${sspId}`;
    return {
      name: sspName,
      records: sspRecords.length,
      revenue: sspRecords.reduce((sum, record) => sum + record.serviceCost, 0) / 1000,
      area: sspRecords.reduce((sum, record) => sum + record.areaTreated, 0)
    };
  });
  return <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of all SSP activities
        </p>
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
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <UsersIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active SSPs
                  </dt>
                  <dd className="text-xl font-semibold text-gray-900">
                    {uniqueSSPs}
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
                <CropIcon className="h-6 w-6 text-white" />
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
      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Monthly Service Cost */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Monthly Activity
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{
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
            </ResponsiveContainer>
          </div>
        </div>
        {/* Crop Distribution */}
        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Crop Distribution
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={cropData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({
                name,
                percent
              }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
                  {cropData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
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
              <BarChart data={sspData} margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="records" name="Records" fill="#8884d8" />
                <Bar dataKey="revenue" name="Revenue (₦'000)" fill="#82ca9d" />
                <Bar dataKey="area" name="Area (Ha)" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>;
};
export default Dashboard;