import React, { useMemo, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRecords } from '../../context/RecordsContext';
import { DownloadIcon, FileTextIcon, PlusIcon } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
// import { PlusIcon, DownloadIcon, FileTextIcon } from 'lucide-react';
// import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
const ViewRecords: React.FC = () => {
  const { user } = useAuth();
  const { getUserRecords } = useRecords();
  // const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('serviceDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        if (!user) {
          if (mounted) setRecords([]);
          return;
        }
        const r = getUserRecords(user.id);
        // support sync or promise-returning getUserRecords
        const resolved = r instanceof Promise ? await r : r;
        if (mounted) setRecords(Array.isArray(resolved) ? resolved : []);
      } catch (err) {
        console.error('Failed to load records', err);
        if (mounted) setRecords([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [getUserRecords, user]);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const searchLower = searchTerm.toLowerCase();
      return (record.farmer_name ?? '').toLowerCase().includes(searchLower)
        || (record.crops_treated ?? '').toLowerCase().includes(searchLower)
        || (record.product_used ?? '').toLowerCase().includes(searchLower);
    });
  }, [records, searchTerm]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      const aValue = a[sortField as keyof typeof a];
      const bValue = b[sortField as keyof typeof b];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortDirection === 'asc' ? (aValue ? 1 : 0) - (bValue ? 1 : 0) : (bValue ? 1 : 0) - (aValue ? 1 : 0);
      }
      return 0;
    });
  }, [filteredRecords, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  const handleExportToExcel = () => {
    exportToExcel(sortedRecords, `ssp_records_${user?.name.replace(/\s+/g, '_').toLowerCase()}`);
  };
  const handleExportToPDF = () => {
    exportToPDF(sortedRecords, `ssp_records_${user?.name.replace(/\s+/g, '_').toLowerCase()}`, user?.name);
  };

  let sn = 1;

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <div className="mt-3 text-gray-600">Loading your records…</div>
        </div>
      </div>
    );
  }

  return <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
            Your Records
          </h1>
        </div>
        {/* Exports Section */}
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button type="button" onClick={handleExportToExcel} disabled={sortedRecords.length === 0} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <DownloadIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Export to Excel
          </button>
          <button type="button" onClick={handleExportToPDF} disabled={sortedRecords.length === 0} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <FileTextIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Export to PDF
          </button>
          <button type="button" onClick={() => window.location.href = ('/ssp/add-record')} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add New Record
          </button>
        </div> {/* */}      </div>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="w-full sm:w-64 mb-4 sm:mb-0">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <input type="text" name="search" id="search" className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" placeholder="Search records..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          {/* Records table */}
          <div className="mt-4 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  {sortedRecords.length > 0 ? <table className="min-w-full divide-y divide-gray-300">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer" onClick={() => handleSort('serialNumber')}>
                            S/N
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('farmerName')}>
                            Farmer's Name
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('serviceDate')}>
                            Date of Service
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('cropsTreated')}>
                            Crop(s) Treated
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('areaTreated')}>
                            Area (Ha)
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('serviceCost')}>
                            Cost (₦)
                          </th>
                          <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('ppeUsed')}>
                            PPE Used
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {sortedRecords.map(record => <tr key={record.id}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                              {sn++}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {record.farmer_name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {new Date(record.service_date).toLocaleDateString()}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {record.crops_treated}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {record.area_treated}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {record.service_cost.toLocaleString()}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {record.ppe_used ? 'Yes' : 'No'}
                            </td>
                          </tr>)}
                      </tbody>
                    </table> : <div className="text-center py-4 text-gray-500">
                      No records found.
                    </div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default ViewRecords;