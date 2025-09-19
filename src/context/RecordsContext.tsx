import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from '../utils/api';

export interface LedgerRecord {
  id: string;
  sspId: string;
  sspName: string;
  serialNumber: number;
  farmerName: string;
  farmerPhone: string;
  serviceDate: string;
  cropsTreated: string;
  productUsed: string;
  sprayerLoads: number;
  serviceCost: number;
  areaTreated: number;
  ppeUsed: boolean;
  challenges: string;
  remarks: string;
  createdAt: string;
}

interface RecordsContextType {
  records: LedgerRecord[];
  addRecord: (record: Omit<LedgerRecord, 'id' | 'sspId' | 'sspName' | 'createdAt'>) => Promise<void>;
  getUserRecords: (userId: string) => LedgerRecord[];
  getAllRecords: () => LedgerRecord[];
  refresh: () => Promise<void>;
  loading: boolean;
}

const RecordsContext = createContext<RecordsContextType | undefined>(undefined);

function mapApiRecord(r: any): LedgerRecord {
  return {
    id: String(r.id),
    sspId: String(r.ssp_id),
    sspName: r.ssp_name || '',
    serialNumber: Number(r.serial_number || 0),
    farmerName: r.farmer_name || '',
    farmerPhone: r.farmer_phone || '',
    serviceDate: r.service_date ? String(r.service_date) : new Date().toISOString().split('T')[0],
    cropsTreated: r.crops_treated || '',
    productUsed: r.product_used || '',
    sprayerLoads: Number(r.sprayer_loads || 0),
    serviceCost: Number(r.service_cost || 0),
    areaTreated: Number(r.area_treated || 0),
    ppeUsed: Boolean(r.ppe_used),
    challenges: r.challenges || '',
    remarks: r.remarks || '',
    createdAt: r.created_at ? String(r.created_at) : new Date().toISOString(),
  };
}

export const RecordsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (user.role === 'ssp') {
        const data = await apiFetch<any[]>(`/records`);
        setRecords(data.map(mapApiRecord));
      } else {
        // Admin: without an endpoint to get all records, fallback to recent from dashboard is not comprehensive
        setRecords([]);
      }
    } catch (e) {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const addRecord = async (recordData: Omit<LedgerRecord, 'id' | 'sspId' | 'sspName' | 'createdAt'>) => {
    if (!user) return;
    const payload = {
      serial_number: recordData.serialNumber,
      farmer_name: recordData.farmerName,
      farmer_phone: recordData.farmerPhone,
      service_date: recordData.serviceDate,
      crops_treated: recordData.cropsTreated,
      product_used: recordData.productUsed,
      sprayer_loads: recordData.sprayerLoads,
      service_cost: recordData.serviceCost,
      area_treated: recordData.areaTreated,
      ppe_used: recordData.ppeUsed,
      challenges: recordData.challenges,
      remarks: recordData.remarks,
    };
    const created = await apiFetch<any>(`/records`, { method: 'POST', body: payload });
    setRecords((prev) => [...prev, mapApiRecord(created)]);
  };

  const getUserRecords = (userId: string) => {
    return records.filter((record) => record.sspId === userId);
  };

  const getAllRecords = () => records;

  const refresh = async () => {
    await load();
  };

  return (
    <RecordsContext.Provider value={{ records, addRecord, getUserRecords, getAllRecords, refresh, loading }}>
      {children}
    </RecordsContext.Provider>
  );
};

export const useRecords = () => {
  const context = useContext(RecordsContext);
  if (context === undefined) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }
  return context;
};
