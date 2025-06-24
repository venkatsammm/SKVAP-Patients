import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Patient, authAPI } from '../services/api';

interface AuthState {
  patient: Patient | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (patientData: Partial<Patient> & { password: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (patientData: Partial<Patient>) => Promise<void>;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { patient: Patient; token: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Patient };

const initialState: AuthState = {
  patient: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        patient: action.payload.patient,
        token: action.payload.token,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        patient: null,
        token: null,
      };
    case 'LOGOUT':
      return {
        ...initialState,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        patient: action.payload,
      };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const patientData = localStorage.getItem('patient');

    if (token && patientData) {
      try {
        const patient = JSON.parse(patientData);
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { patient, token },
        });
      } catch (error) {
        console.error('Error parsing stored patient data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('patient');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const { token, data } = response;
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('patient', JSON.stringify(data.patient));
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { patient: data.patient, token },
        });
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const register = async (patientData: Partial<Patient> & { password: string }): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await authAPI.register(patientData);
      
      if (response.success) {
        const { token, data } = response;
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('patient', JSON.stringify(data.patient));
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { patient: data.patient, token },
        });
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      throw error;
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('patient');
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (patientData: Partial<Patient>): Promise<void> => {
    try {
      const response = await authAPI.updateProfile(patientData);
      
      if (response.success) {
        const updatedPatient = response.data.patient;
        
        // Update localStorage
        localStorage.setItem('patient', JSON.stringify(updatedPatient));
        
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: updatedPatient,
        });
      } else {
        throw new Error('Profile update failed');
      }
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
