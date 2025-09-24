import React, { useState, createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Ledger record shape
export interface LedgerRecord {
  id: string;
  ssp_id: string;
  ssp_name: string;
  serial_number: number;
  farmer_name: string;
  farmer_phone: string;
  service_date: string;
  crops_treated: string;
  product_used: string;
  sprayer_loads: number;
  service_cost: number;
  area_treated: number;
  ppe_used: boolean;
  challenges: string;
  remarks: string;
  created_at: string;
}

interface RecordsContextType {
  records: LedgerRecord[];
  addRecord: (
    record: Omit<LedgerRecord, 'id' | 'sspId' | 'sspName' | 'createdAt'>
  ) => Promise<void>;
  getUserRecords: (userId: string) => LedgerRecord[];
  getAllRecords: () => LedgerRecord[];
}

const API_URL = import.meta.env.VITE_API_URL;
const token = localStorage.getItem('token');

const RecordsContext = createContext<RecordsContextType | undefined>(undefined);

export const RecordsProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [records, setRecords] = useState<LedgerRecord[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (user.role === 'admin') {
      fetchAllRecords();
    } else {
      fetchUserRecords();
    }
  }, [user]);

  const fetchUserRecords = async () => {
    if (user?.role !== 'ssp') return;
    const response = await fetch(`${API_URL}/records`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    setRecords(data);
  };

  // Admin fetch all records
  const fetchAllRecords = async () => {
    if (user?.role !== 'admin') return;
    const response = await fetch(`${API_URL}/admin/records`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    setRecords(data);
  };

  const addRecord = async (
    recordData: Omit<LedgerRecord, 'id' | 'sspId' | 'sspName' | 'createdAt'>
  ) => {
    if (!user) return;
    console.log('Before Sending recordData: ', recordData);
    const response = await fetch(`${API_URL}/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...recordData,
        sspName: user.name
      })
    });

    console.log('Add Record request: ', response);
    if (response.ok) {
      const newRecord = await response.json();
      setRecords((prev) => [...prev, newRecord]);
    }
  };

  // Function to get records for a specific user
  const getUserRecords = (userId: string) => {
    return records.filter((record) => record.ssp_id === userId);
  };

  // Function to get all records
  const getAllRecords = () => records;

  return (
    <RecordsContext.Provider
      value={{ records, addRecord, getUserRecords, getAllRecords }}
    >
      {children}
    </RecordsContext.Provider>
  );
};

// Custom hook to use the RecordsContext
export const useRecords = (): RecordsContextType => {
  const context = useContext(RecordsContext);
  if (!context) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }
  return context;
};
