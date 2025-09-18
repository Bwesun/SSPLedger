import React, { useState, createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
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
  addRecord: (record: Omit<LedgerRecord, 'id' | 'sspId' | 'sspName' | 'createdAt'>) => void;
  getUserRecords: (userId: string) => LedgerRecord[];
  getAllRecords: () => LedgerRecord[];
}
const API_URL = 'http://localhost:3001/api';

const RecordsContext = createContext<RecordsContextType | undefined>(undefined);

export const RecordsProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const {
    user
  } = useAuth();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        fetchAllRecords();
      } else {
        fetchUserRecords();
      }
    }
  }, [user]);

  const fetchUserRecords = async () => {
    if (user?.role === 'ssp') {
      const response = await fetch(`${API_URL}/records`);
      const data = await response.json();
      setRecords(data);
    }
  };

  const fetchAllRecords = async () => {
    if (user?.role === 'admin') {
      const response = await fetch(`${API_URL}/admin/records`);
      const data = await response.json();
      setRecords(data);
    }
  };

  const addRecord = async (recordData: Omit<LedgerRecord, 'id' | 'sspId' | 'sspName' | 'createdAt'>) => {
    if (!user) return;
    await fetch(`${API_URL}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...recordData,
        sspName: user.name
      })
    });
  };

  const getUserRecords = (userId: string) => {
    // This can be adapted if needed, but fetching is now role-based
    return records.filter(record => record.sspId === userId);
  };

  const getAllRecords = () => {
    // This can be adapted if needed, but fetching is now role-based
    return records;
  };

  return <RecordsContext.Provider value={{
    records,
    addRecord,
    getUserRecords,
    getAllRecords
  }}>
      {children}
    </RecordsContext.Provider>;
};
export const useRecords = () => {
  const context = useContext(RecordsContext);
  if (context === undefined) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }
  return context;
};