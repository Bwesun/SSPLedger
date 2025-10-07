import React, { useState } from 'react';
import { useRecords, LedgerRecord } from '../../context/RecordsContext';
import { DownloadIcon, FileTextIcon, SearchIcon } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
const RecordManagement: React.FC = () => {
  // guard the context result so records is always an array
  const recordsCtx = useRecords();
  const records: LedgerRecord[] = Array.isArray(recordsCtx?.records) ? recordsCtx!.records : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof LedgerRecord>('service_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterSSP, setFilterSSP] = useState<string>('');

  // Get unique SSPs for filter
  const uniqueSSPs = [...new Set(records.map(record => record.ssp_name))].filter((s) => s !== undefined && s !== null) as string[];

  // Filter and sort records
  const filteredRecords = records.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (record.farmer_name ?? '').toLowerCase().includes(searchLower) ||
      (record.crops_treated ?? '').toLowerCase().includes(searchLower) ||
      (record.product_used ?? '').toLowerCase().includes(searchLower);
    const matchesSSP = filterSSP ? record.ssp_name === filterSSP : true;
    return matchesSearch && matchesSSP;
  }).sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
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
  const handleSort = (field: keyof LedgerRecord) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  // Export to Excell
  const handleExportToExcel = () => {
    const fileName = filterSSP ? `ssp_records_${filterSSP.replace(/\s+/g, '_').toLowerCase()}` : 'ssp_records';
    exportToExcel(filteredRecords, fileName);
  };

  // Export to PDF
  const handleExportToPDF = () => {
    const fileName = filterSSP ? `ssp_records_${filterSSP.replace(/\s+/g, '_').toLowerCase()}` : 'ssp_records';
    exportToPDF(filteredRecords, fileName, filterSSP);
  };

  // Numbering counter
  let sn = 1;

  return <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
            Record Management
          </h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button type="button" onClick={handleExportToExcel} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <DownloadIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Export to Excel
          </button>
          <button type="button" onClick={handleExportToPDF} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <FileTextIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Export to PDF
          </button>
        </div>
      </div>
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-64 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input type="text" name="search" id="search" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Search records..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            <div className="w-full md:w-64">
              <select id="ssp-filter" name="ssp-filter" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md" value={filterSSP} onChange={e => setFilterSSP(e.target.value)}>
                <option value="">All SSPs</option>
                {uniqueSSPs.map((ssp, idx) => (
                  <option key={ssp ?? `ssp-${idx}`} value={ssp ?? ''}>
                    {ssp ?? `SSP ${idx + 1}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Records table */}
          <div className="mt-8 flex flex-col">
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer" onClick={() => handleSort('serial_number')}>
                          S/N
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('ssp_name')}>
                          SSP ID
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('farmer_name')}>
                          Farmer's Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('service_date')}>
                          Date
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('crops_treated')}>
                          Crop
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('area_treated')}>
                          Area (Ha)
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('service_cost')}>
                          Cost (₦)
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('ppe_used')}>
                          PPE Used
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredRecords.map((record, idx) => (
                        <tr key={record.id ?? `${record.serial_number ?? 'sn'}-${idx}`}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {sn++}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {record.ssp_id ?? '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {record.farmer_name ?? '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {record.service_date ? new Date(record.service_date).toLocaleDateString() : '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {record.crops_treated ?? '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {record.area_treated ?? '-'}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {Number(record.service_cost ?? 0).toLocaleString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {record.ppe_used ? 'Yes' : 'No'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default RecordManagement;