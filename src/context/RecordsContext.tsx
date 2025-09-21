import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';
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
  addRecord: (record: Omit<LedgerRecord, 'id' | 'sspId' | 'sspName' | 'createdAt'>) => Promise<void>;
  getUserRecords: (userId: string) => LedgerRecord[];
  getAllRecords: () => LedgerRecord[];
  refresh: () => Promise<void>;
  loading: boolean;
}
const API_URL = 'http://localhost:3001/api';
const token = localStorage.getItem('token');
console.log('Records Token: ', token)

const RecordsContext = createContext<RecordsContextType | undefined>(undefined);

export const RecordsProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const {
    user
  } = useAuth();

  const fetchUserRecords = useCallback(async () => {
    if (user?.role === 'ssp') {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/records`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Fetch Record request: ',response);
        const data = await response.json();
        setRecords(data);
      } catch (error) {
        console.error('Error fetching user records:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [user?.role]);

  const fetchAllRecords = useCallback(async () => {
    if (user?.role === 'admin') {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/admin/records`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setRecords(data);
      } catch (error) {
        console.error('Error fetching all records:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [user?.role]);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        fetchAllRecords();
      } else {
        fetchUserRecords();
      }
    }
  }, [user, fetchAllRecords, fetchUserRecords]);

  const addRecord = async (recordData: Omit<LedgerRecord, 'id' | 'sspId' | 'sspName' | 'createdAt'>) => {
    if (!user) return;
    console.log('Before Sending recordData: ', recordData);
    try {
      const response = await fetch(`${API_URL}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...recordData,
          sspName: user.name,
        })
      });

      console.log('Add Record request: ', response);
      if (response.ok) {
        const newRecord = await response.json();
        setRecords(prev => [...prev, newRecord]);
      }
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  const getUserRecords = (userId: string) => {
    // This can be adapted if needed, but fetching is now role-based
    return records.filter(record => record.sspId === userId);
  };

  const getAllRecords = () => {
    // This can be adapted if needed, but fetching is now role-based
    return records;
  };

  const refresh = useCallback(async () => {
    if (user) {
      if (user.role === 'admin') {
        await fetchAllRecords();
      } else {
        await fetchUserRecords();
      }
    }
  }, [user, fetchAllRecords, fetchUserRecords]);

  return <RecordsContext.Provider value={{
    records,
    addRecord,
    getUserRecords,
    getAllRecords,
    refresh,
    loading
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