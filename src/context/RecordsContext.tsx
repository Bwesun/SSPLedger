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
// Mock records for demo
const mockRecords: LedgerRecord[] = [{
  id: '1',
  sspId: '2',
  sspName: 'John Doe',
  serialNumber: 1,
  farmerName: 'James Smith',
  farmerPhone: '08023456789',
  serviceDate: '2023-10-15',
  cropsTreated: 'Maize',
  productUsed: 'Herbicide X',
  sprayerLoads: 3,
  serviceCost: 15000,
  areaTreated: 2.5,
  ppeUsed: true,
  challenges: 'None',
  remarks: 'Successful application',
  createdAt: '2023-10-15T10:30:00Z'
}, {
  id: '2',
  sspId: '2',
  sspName: 'John Doe',
  serialNumber: 2,
  farmerName: 'Mary Johnson',
  farmerPhone: '08034567890',
  serviceDate: '2023-10-20',
  cropsTreated: 'Rice',
  productUsed: 'Pesticide Y',
  sprayerLoads: 2,
  serviceCost: 12000,
  areaTreated: 1.8,
  ppeUsed: true,
  challenges: 'Light rain after application',
  remarks: 'May need follow-up',
  createdAt: '2023-10-20T09:15:00Z'
}];
const RecordsContext = createContext<RecordsContextType | undefined>(undefined);
export const RecordsProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [records, setRecords] = useState<LedgerRecord[]>(mockRecords);
  const {
    user
  } = useAuth();
  const addRecord = (recordData: Omit<LedgerRecord, 'id' | 'sspId' | 'sspName' | 'createdAt'>) => {
    if (!user) return;
    const newRecord: LedgerRecord = {
      id: Date.now().toString(),
      sspId: user.id,
      sspName: user.name,
      ...recordData,
      createdAt: new Date().toISOString()
    };
    setRecords(prevRecords => [...prevRecords, newRecord]);
  };
  const getUserRecords = (userId: string) => {
    return records.filter(record => record.sspId === userId);
  };
  const getAllRecords = () => {
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