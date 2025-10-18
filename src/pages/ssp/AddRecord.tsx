import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LedgerRecord, useRecords } from '../../context/RecordsContext';
import { useAuth } from '../../context/AuthContext';
const AddRecord: React.FC = () => {
  const {user: currentSsp} = useAuth();
  const [formData, setFormData] = useState({
    serialNumber: 1,
    farmerName: '',
    farmerPhone: '',
    serviceDate: new Date().toISOString().split('T')[0],
    cropsTreated: '',
    productUsed: '',
    sprayerLoads: 0,
    serviceCost: 0,
    areaTreated: 0,
    ppeUsed: false,
    challenges: '',
    remarks: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const {
    addRecord
  } = useRecords();
  const navigate = useNavigate();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const {
      name,
      value,
      type
    } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (type === 'number' || name === 'sprayerLoads' || name === 'serviceCost' || name === 'areaTreated') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate SSP selection
    if (!currentSsp || !currentSsp.id) {
      setError('No SSP selected');
      alert('No SSP Recognized. Refresh and try again.');
      return;
    }
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
      const payload: Omit<LedgerRecord, 'id' | 'sspId' | 'createdAt'> = {
        ssp_id: currentSsp?.id,
        ssp_name: currentSsp?.name,
        serial_number: formData.serialNumber,
        farmer_name: formData.farmerName,
        farmer_phone: formData.farmerPhone,
        service_date: formData.serviceDate,
        crops_treated: formData.cropsTreated,
        product_used: formData.productUsed,
        sprayer_loads: formData.sprayerLoads,
        service_cost: formData.serviceCost,
        area_treated: formData.areaTreated,
        ppe_used: formData.ppeUsed,
        challenges: formData.challenges,
        remarks: formData.remarks,
        created_at: new Date().toISOString()
      };

      await addRecord(payload); // or api.createRecord(payload)

      setSuccess('Record added successfully!');
      // Reset form
      setFormData({
        serialNumber: formData.serialNumber + 1,
        farmerName: '',
        farmerPhone: '',
        serviceDate: new Date().toISOString().split('T')[0],
        cropsTreated: '',
        productUsed: '',
        sprayerLoads: 0,
        serviceCost: 0,
        areaTreated: 0,
        ppeUsed: false,
        challenges: '',
        remarks: ''
      });
      // Redirect after short delay
      setTimeout(() => {
        navigate('/ssp/records');
      }, 1500);
    } catch (err) {
      setError('Failed to add record. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate">
            Add New Record
          </h1>
        </div>
      </div>
      {error && <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>}
      {success && <div className="mb-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* <div className="sm:col-span-2">
              <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700">
                S/N
              </label>
              <div className="mt-1">
                <input type="number" name="serialNumber" id="serialNumber" value={formData.serialNumber} onChange={handleChange} required className="bg-green-50 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div> */}
            <div className="sm:col-span-4">
              <label htmlFor="farmerName" className="block text-sm font-medium text-gray-700">
                Farmer's Name
              </label>
              <div className="mt-1">
                <input type="text" name="farmerName" id="farmerName" value={formData.farmerName} onChange={handleChange} required className="bg-green-50 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="farmerPhone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input type="tel" name="farmerPhone" id="farmerPhone" value={formData.farmerPhone} onChange={handleChange} required className="bg-green-50 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="serviceDate" className="block text-sm font-medium text-gray-700">
                Date of Service
              </label>
              <div className="mt-1">
                <input type="date" name="serviceDate" id="serviceDate" value={formData.serviceDate} onChange={handleChange} required className="bg-green-50 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="cropsTreated" className="block text-sm font-medium text-gray-700">
                Crop(s) Treated
              </label>
              <div className="mt-1">
                <input type="text" name="cropsTreated" id="cropsTreated" value={formData.cropsTreated} onChange={handleChange} required className="bg-green-50 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="productUsed" className="block text-sm font-medium text-gray-700">
                Product Used (Pesticide/Fungicide/Herbicide)
              </label>
              <div className="mt-1">
                <input type="text" name="productUsed" id="productUsed" value={formData.productUsed} onChange={handleChange} required className="bg-green-50 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="sprayerLoads" className="block text-sm font-medium text-gray-700">
                No. of Sprayer Loads Used
              </label>
              <div className="mt-1">
                <input type="number" name="sprayerLoads" id="sprayerLoads" value={formData.sprayerLoads} onChange={handleChange} required className="bg-green-50 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="serviceCost" className="block text-sm font-medium text-gray-700">
                Total Service Cost (₦)
              </label>
              <div className="mt-1">
                <input type="number" name="serviceCost" id="serviceCost" value={formData.serviceCost} onChange={handleChange} required className="bg-green-50 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="areaTreated" className="block text-sm font-medium text-gray-700">
                Area Treated (Ha)
              </label>
              <div className="mt-1">
                <input type="number" step="0.01" name="areaTreated" id="areaTreated" value={formData.areaTreated} onChange={ handleChange} required className="bg-green-50 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>
            <div className="sm:col-span-2">
              <div className="flex items-center h-full">
                <input id="ppeUsed" name="ppeUsed" type="checkbox" checked={formData.ppeUsed} onChange={handleChange} className="bg-green-50 -4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label htmlFor="ppeUsed" className="ml-2 block text-sm text-gray-900">
                  PPE Used? (Yes/No)
                </label>
              </div>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="challenges" className="block text-sm font-medium text-gray-700">
                Challenges Encountered
              </label>
              <div className="mt-1">
                <textarea id="challenges" name="challenges" rows={3} value={formData.challenges} onChange={handleChange} className="bg-green-50 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
                Remarks
              </label>
              <div className="mt-1">
                <textarea id="remarks" name="remarks" rows={3} value={formData.remarks} onChange={handleChange} className="bg-green-50 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => navigate('/ssp/records')} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
              {isSubmitting ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>;
};
export default AddRecord;