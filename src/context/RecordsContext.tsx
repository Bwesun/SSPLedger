import React, { useState, createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Ledger record shape
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
  addRecord: (
    record: Omit<LedgerRecord, 'id' | 'sspId' | 'sspName' | 'createdAt'>
  ) => Promise<void>;
  getUserRecords: (userId: string) => LedgerRecord[];
  getAllRecords: () => LedgerRecord[];
}

const API_URL = 'http://localhost:3001/api';
const token = localStorage.getItem('token');
console.log('Records Token: ', token);

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
    try {
      const response = await fetch(`${API_URL}/records`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.log('API not available, using mock data');
      // Mock data for testing when API is not available
      const mockRecords: LedgerRecord[] = [
        {
          id: '1',
          sspId: user.id,
          sspName: user.name,
          serialNumber: 1,
          farmerName: 'John Farmer',
          farmerPhone: '+2348012345678',
          serviceDate: '2024-01-15',
          cropsTreated: 'Maize, Yam',
          productUsed: 'Roundup Herbicide',
          sprayerLoads: 2,
          serviceCost: 15000,
          areaTreated: 2.5,
          ppeUsed: true,
          challenges: 'None',
          remarks: 'Successful treatment',
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          sspId: user.id,
          sspName: user.name,
          serialNumber: 2,
          farmerName: 'Mary Johnson',
          farmerPhone: '+2348087654321',
          serviceDate: '2024-01-20',
          cropsTreated: 'Rice',
          productUsed: 'Fungicide XYZ',
          sprayerLoads: 1,
          serviceCost: 12000,
          areaTreated: 1.8,
          ppeUsed: true,
          challenges: 'Light rainfall',
          remarks: 'Treatment completed successfully',
          createdAt: '2024-01-20T14:30:00Z'
        }
      ];
      setRecords(mockRecords);
    }
  };

  const fetchAllRecords = async () => {
    if (user?.role !== 'admin') return;
    try {
      const response = await fetch(`${API_URL}/admin/records`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.log('API not available, using mock data for admin');
      // Mock data for admin testing when API is not available
      const mockRecords: LedgerRecord[] = [
        {
          id: '1',
          sspId: 'user1',
          sspName: 'John SSP',
          serialNumber: 1,
          farmerName: 'John Farmer',
          farmerPhone: '+2348012345678',
          serviceDate: '2024-01-15',
          cropsTreated: 'Maize, Yam',
          productUsed: 'Roundup Herbicide',
          sprayerLoads: 2,
          serviceCost: 15000,
          areaTreated: 2.5,
          ppeUsed: true,
          challenges: 'None',
          remarks: 'Successful treatment',
          createdAt: '2024-01-15T10:00:00Z'
        }
      ];
      setRecords(mockRecords);
    }
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

  const getUserRecords = (userId: string) =>
    records.filter((record) => record.sspId === userId);

  const getAllRecords = () => records;

  return (
    <RecordsContext.Provider
      value={{ records, addRecord, getUserRecords, getAllRecords }}
    >
      {children}
    </RecordsContext.Provider>
  );
};

export const useRecords = (): RecordsContextType => {
  const context = useContext(RecordsContext);
  if (!context) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }
  return context;
};
