import React, { useEffect, useState, createContext, useContext } from 'react';
// Define user types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ssp' | 'admin';
  phone?: string;
  gender?: string;
  state?: string;
  lga?: string;
  community?: string;
}
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User> & {
    password: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
}
// Mock users for demo
const mockUsers: (User & {
  password: string;
})[] = [{
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'password',
  role: 'admin'
}, {
  id: '2',
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password',
  role: 'ssp',
  phone: '08012345678',
  gender: 'Male',
  state: 'Lagos',
  lga: 'Ikeja',
  community: 'Ogba'
}];
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  // Check for saved user on component mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);
  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would be an API call
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const {
        password,
        ...userWithoutPassword
      } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };
  const register = async (userData: Partial<User> & {
    password: string;
  }): Promise<boolean> => {
    // In a real app, this would be an API call
    const newUser = {
      id: Date.now().toString(),
      name: userData.name || '',
      email: userData.email || '',
      password: userData.password,
      role: 'ssp' as const,
      phone: userData.phone || '',
      gender: userData.gender || '',
      state: userData.state || '',
      lga: userData.lga || '',
      community: userData.community || ''
    };
    mockUsers.push(newUser);
    const {
      password,
      ...userWithoutPassword
    } = newUser;
    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    return true;
  };
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };
  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    // In a real app, this would be an API call
    if (user) {
      const updatedUser = {
        ...user,
        ...userData
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return true;
    }
    return false;
  };
  return <AuthContext.Provider value={{
    user,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile
  }}>
      {children}
    </AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};