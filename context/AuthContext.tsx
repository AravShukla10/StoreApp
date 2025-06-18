// context/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Alert } from 'react-native'; // You can remove this import later if you remove the Alert calls

interface AuthContextType {
  isSignedIn: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => void;
  isLoadingAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // Simulate checking for a saved token/session
  useEffect(() => {
    const loadAuthStatus = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate async operation
      // In a real app, you'd check AsyncStorage:
      // const token = await AsyncStorage.getItem('userToken');
      // if (token) { setIsSignedIn(true); }
      setIsLoadingAuth(false);
    };
    loadAuthStatus();
  }, []);

  const signIn = async (username: string, password: string): Promise<boolean> => {
    setIsLoadingAuth(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    if (username === 'test' && password === 'password') { // Dummy check
      // In real app: await AsyncStorage.setItem('userToken', 'your-token');
      setIsSignedIn(true);
      Alert.alert('Success', 'Logged in successfully!');
      setIsLoadingAuth(false);
      return true;
    } else {
      Alert.alert('Login Failed', 'Invalid username or password.');
      setIsLoadingAuth(false);
      return false;
    }
  };

  const signOut = async () => {
    setIsLoadingAuth(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    // In real app: await AsyncStorage.removeItem('userToken');
    setIsSignedIn(false);
    setIsLoadingAuth(false);
  };

  return (
    <AuthContext.Provider value={{ isSignedIn, signIn, signOut, isLoadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};