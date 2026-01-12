// import { createContext, useContext, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   loginApi,
//   logoutApi,
//   checkAuthApi,
//   setCompanyApi,
//   clearCompanyApi,
//   getCompanyApi
// } from '../service/Auth/authApi';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [auth, setAuth] = useState({
//     isAuthenticated: false,
//     userType: null,
//     userId: null,
//     userName: null,
//     company: null,
//     isLoading: true,
//     error: null,
//     isSuperAdmin: false
//   });

//   const navigate = useNavigate();

//   const checkAuth = async () => {
//     try {
//       setAuth(prev => ({ ...prev, isLoading: true, error: null }));

//       const authResponse = await checkAuthApi();
//       console.log(authResponse, ' res');
//       if (authResponse.data.success) {
//         const companyResponse = await getCompanyApi();
// console.log("checking log comp: ", companyResponse);

//         setAuth({
//           isAuthenticated: true,
//           userType: authResponse.data.userType,
//           userId: authResponse.data.userId,
//           userName: authResponse.data.userName,
//           company: companyResponse.data.company || null,
//           isLoading: false,
//           error: null
//         });
//       } else {
//         throw new Error('Not authenticated');
//       }
//     } catch (error) {
//       console.error("Auth check error:", error);
//       setAuth({
//         isAuthenticated: false,
//         userType: null,
//         userId: null,
//         userName: null,
//         company: null,
//         isLoading: false,
//         error: error.message
//       });
//     }
//   };

//   const login = async (credentials) => {
//     try {
//       setAuth(prev => ({ ...prev, isLoading: true, error: null }));

//       const response = await loginApi(credentials);

//       console.log(response, 'klklk');

//       if (response.data.success) {
//         await checkAuth();
//         return {
//           success: true,
//           userType: response.data.userType,
//           userName: response.data.userName,
//           requiresCompany: response.data.requiresCompany
//         };
//       } else {
//         throw new Error(response.data.message || 'Login failed');
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       setAuth(prev => ({
//         ...prev,
//         isLoading: false,
//         error: error.message
//       }));
//       return {
//         success: false,
//         message: error.response?.data?.message || error.message
//       };
//     }
//   };

//   const logout = async () => {
//     try {
//       await logoutApi();
//       setAuth({
//         isAuthenticated: false,
//         userType: null,
//         userId: null,
//         userName: null,
//         company: null,
//         isSuperAdmin: null,
//         isLoading: false,
//         error: null
//       });
//       navigate('/');
//     } catch (error) {
//       console.error("Logout failed:", error);
//       setAuth(prev => ({
//         ...prev,
//         error: error.message
//       }));
//     }
//   };

//   const setCompany = async (companyId) => {
//     try {
//       const response = await setCompanyApi(companyId);
// console.log(response,"company_id");

//       if (response.data.success) {
//         setAuth(prev => ({
//           ...prev,
//           company: response.data.company
//         }));
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error("Error setting company:", error);
//       return false;
//     }
//   };

//   const clearCompany = async () => {
//     try {
//       await clearCompanyApi();
//       setAuth(prev => ({ ...prev, company: null }));
//       return true;
//     } catch (error) {
//       console.error("Error clearing company:", error);
//       return false;
//     }
//   };

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   return (
//     <AuthContext.Provider value={{
//       auth,
//       login,
//       logout,
//       checkAuth,
//       setCompany,
//       clearCompany
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  loginApi,
  logoutApi,
  checkAuthApi,
  setCompanyApi,
  clearCompanyApi,
  getCompanyApi
} from '../service/Auth/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    userType: null,
    userId: null,
    userName: null,
    company: null,
    isLoading: true,
    error: null,
    isSuperAdmin: false
  });

  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      setAuth(prev => ({ ...prev, isLoading: true, error: null }));

      const authResponse = await checkAuthApi();
      console.log(authResponse, ' res');
      if (authResponse.data.success) {
        const companyResponse = await getCompanyApi();
        console.log("checking log comp: ", companyResponse);

        // Get company type from localStorage if available
        const companyType = localStorage.getItem('currentCompanyType');
        
        setAuth({
          isAuthenticated: true,
          userType: authResponse.data.userType,
          userId: authResponse.data.userId,
          userName: authResponse.data.userName,
          company: companyResponse.data.company ? {
            ...companyResponse.data.company,
            type: companyType || companyResponse.data.company.type
          } : null,
          isLoading: false,
          error: null
        });
      } else {
        throw new Error('Not authenticated');
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setAuth({
        isAuthenticated: false,
        userType: null,
        userId: null,
        userName: null,
        company: null,
        isLoading: false,
        error: error.message
      });
    }
  };

  const login = async (credentials) => {
    try {
      setAuth(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await loginApi(credentials);

      console.log(response, 'klklk');

      if (response.data.success) {
        await checkAuth();
        return {
          success: true,
          userType: response.data.userType,
          userName: response.data.userName,
          requiresCompany: response.data.requiresCompany
        };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error("Login error:", error);
      setAuth(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
      // Clear localStorage on logout
      localStorage.removeItem('currentCompanyType');
      setAuth({
        isAuthenticated: false,
        userType: null,
        userId: null,
        userName: null,
        company: null,
        isSuperAdmin: null,
        isLoading: false,
        error: null
      });
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
      setAuth(prev => ({
        ...prev,
        error: error.message
      }));
    }
  };

  const setCompany = async (companyId) => {
    try {
      console.log("Setting company with ID:", companyId);
      
      // Make sure companyId is a string, not an object
      const companyIdString = typeof companyId === 'object' ? companyId.id : companyId;
      
      const response = await setCompanyApi(companyIdString);
      console.log("Set company response:", response);

      if (response.data.success) {
        setAuth(prev => ({
          ...prev,
          company: response.data.company
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error setting company:", error);
      setAuth(prev => ({
        ...prev,
        error: error.message
      }));
      return false;
    }
  };

  const clearCompany = async () => {
    try {
      await clearCompanyApi();
      localStorage.removeItem('currentCompanyType');
      setAuth(prev => ({ ...prev, company: null }));
      return true;
    } catch (error) {
      console.error("Error clearing company:", error);
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{
      auth,
      login,
      logout,
      checkAuth,
      setCompany,
      clearCompany
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};