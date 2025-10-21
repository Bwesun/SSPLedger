import React, { useState, useEffect } from 'react';
import { useRecords, LedgerRecord } from '../../context/RecordsContext';
import { DownloadIcon, FileTextIcon, SearchIcon } from 'lucide-react';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
const RecordManagement: React.FC = () => {
  // guard the context result so records is always an array
  const recordsCtx = useRecords();
  const records: LedgerRecord[] = Array.isArray(recordsCtx?.records) ? recordsCtx!.records : [];

  // loader state: prefer context's loading flag if present, otherwise
  // show loader until records array is known (even if empty)
  const [loading, setLoading] = useState<boolean>(() => {
    const ctxLoading = (recordsCtx as any)?.loading;
    if (typeof ctxLoading === 'boolean') return ctxLoading;
    return !Array.isArray(recordsCtx?.records) || recordsCtx?.records.length === 0;
  });

  useEffect(() => {
    const ctxLoading = (recordsCtx as any)?.loading;
    if (typeof ctxLoading === 'boolean') {
      setLoading(ctxLoading);
      return;
    }
    if (recordsCtx && Array.isArray(recordsCtx.records)) {
      setLoading(false);
    } else {
      setLoading(true);
    }
  }, [recordsCtx, (recordsCtx as any)?.loading, recordsCtx?.records]);

  // show loader while fetching
  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
          <div className="mt-3 text-gray-600">Loading records…</div>
        </div>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof LedgerRecord>('service_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterSSP, setFilterSSP] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);
  const pageSizeOptions = [10, 25, 50, 100];

  // Get unique SSPs for filter (use ssp_name if present, otherwise ssp_id)
  const uniqueSSPs = Array.from(
    new Set(
      records
        .map(r => (r.ssp_name ?? r.ssp_id ?? '').toString().trim())
        .filter(s => s !== '')
    )
  ) as string[];
  console.log('Unique SSPs:', uniqueSSPs);

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

  // Reset to first page when filters/search/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterSSP, sortField, sortDirection, pageSize, records.length]);

  const totalRecords = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  // Ensure currentPage is within bounds if totalPages changed
  useEffect(() => {
    setCurrentPage(prev => (prev > totalPages ? totalPages : prev));
  }, [totalPages]);

  // Compute paginated slice
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

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

  // Numbering counter removed; compute per row using current page
  // let sn = 1;

  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };

  const renderPageButtons = () => {
    // show up to 7 buttons: first, prev few, current, next few, last
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      const left = Math.max(2, currentPage - 1);
      const right = Math.min(totalPages - 1, currentPage + 1);

      if (left > 2) pages.push('...');
      for (let p = left; p <= right; p++) pages.push(p);
      if (right < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages.map((p, i) =>
      p === '...' ? (
        <span key={`dots-${i}`} className="px-2 py-1 text-sm text-gray-500">…</span>
      ) : (
        <button
          key={p}
          onClick={() => goToPage(p as number)}
          className={`px-3 py-1 rounded-md text-sm ${p === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
        >
          {p}
        </button>
      )
    );
  };

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
                        <th scope="col" className="px-3 py-3.5 text-left textsm font-semibold text-gray-900 cursor-pointer" onClick={() => handleSort('area_treated')}>
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
                      {paginatedRecords.map((record, idx) => (
                        <tr key={record.id ?? `${record.serial_number ?? 'sn'}-${startIndex + idx}`}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                            {(startIndex + idx + 1)}
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
                      {paginatedRecords.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-6 text-center text-sm text-gray-500">
                            No records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {/* Pagination controls */}
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{totalRecords === 0 ? 0 : startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, totalRecords)}</span> of <span className="font-medium">{totalRecords}</span> records
                      </div>
                      <div>
                        <label className="text-sm text-gray-700 mr-2">Rows:</label>
                        <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} className="border rounded-md py-1 px-2 text-sm">
                          {pageSizeOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded-md text-sm bg-white disabled:opacity-50">
                        Prev
                      </button>
                      <div className="flex items-center space-x-1">
                        {renderPageButtons()}
                      </div>
                      <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded-md text-sm bg-white disabled:opacity-50">
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default RecordManagement;