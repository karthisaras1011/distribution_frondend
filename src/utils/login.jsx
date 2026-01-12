



import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAdmin, setIsAdmin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Check for session expiration
  useEffect(() => {
    if (searchParams.get('session_expired') === 'true') {
      setLoginError('Invalid Credentials or User Type.');
    }
  }, [searchParams]);

  const validationSchema = Yup.object().shape({
    userId: Yup.string()
      .required('ID is required'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters'),
  });

  const formik = useFormik({
    initialValues: {
      userId: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setLoginError('');
        const credentials = {
          ...values,
          userType: isAdmin ? 'admin' : 'employee'
        };

        const result = await login(credentials);
        console.log("new log: ", result);

        if (result.success) {
          navigate(`/${result.userType.toLowerCase()}`);
        } else {
          if (result.message.includes('deactivated')) {
            setLoginError('Your account is deactivated. Please contact administrator.');
          } else {
            setLoginError(result.message || 'Invalid credentials');
          }
        }
      } catch (error) {
        setLoginError('An error occurred during login');
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6" style={{ backgroundColor: '#f8fafc' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md md:max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row relative"
      >
        {/* Abstract Background - Hidden on mobile, visible on desktop */}
        <div className="hidden md:flex md:w-1/2 bg-white relative items-center justify-center p-6 overflow-hidden">
          <div className="absolute w-72 h-72 bg-gradient-to-tr from-[#530505] to-[#7a1c1c] rounded-full top-[-80px] left-[-60px]"></div>
          <div className="absolute w-52 h-52 bg-gradient-to-tr from-[#530505] to-[#a83232] rounded-full bottom-[-40px] right-[-40px]"></div>
        </div>

        {/* Mobile Background - Small circles for mobile */}
        <div className="md:hidden absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-40 h-40 bg-gradient-to-tr from-[#530505] to-[#7a1c1c] rounded-full -top-20 -left-20 opacity-60"></div>
          <div className="absolute w-32 h-32 bg-gradient-to-tr from-[#530505] to-[#a83232] rounded-full -bottom-16 -right-16 opacity-60"></div>
        </div>

        {/* Login Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8 lg:p-10 flex flex-col justify-center bg-white z-10">
          {/* Tabs */}
          <div className="flex mb-6 border rounded-lg overflow-hidden shadow-sm">
            <button
              type="button"
              onClick={() => setIsAdmin(true)}
              className={`flex-1 py-3 md:py-2 text-sm font-medium transition-colors ${
                isAdmin 
                  ? 'bg-white text-black border-b-2 border-[#530505] font-semibold' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-50'
              }`}
            >
              Admin Login
            </button>
            <button
              type="button"
              onClick={() => setIsAdmin(false)}
              className={`flex-1 py-3 md:py-2 text-sm font-medium transition-colors ${
                !isAdmin 
                  ? 'bg-white text-black border-b-2 border-[#530505] font-semibold' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-50'
              }`}
            >
              Employee Login
            </button>
          </div>

          {/* Heading */}
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 text-center mb-6 md:mb-8">
            {isAdmin ? 'Admin Login' : 'Employee Login'}
          </h2>

          {/* Error Message */}
          {loginError && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              loginError.includes('deactivated')
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {loginError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-5 md:space-y-6">
            {/* Username */}
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm md:text-base" />
              <input
                type="text"
                name="userId"
                placeholder={`Enter ${isAdmin ? 'admin' : 'employee'} ID`}
                className={`w-full pl-10 pr-4 py-3 md:py-3 text-sm md:text-base border-2 ${
                  formik.errors.userId && formik.touched.userId 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-[#530505]'
                } rounded-lg focus:ring-2 focus:ring-[#530505]/20 outline-none transition-colors`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.userId}
              />
              {formik.errors.userId && formik.touched.userId && (
                <div className="text-red-500 text-xs mt-1 ml-1">
                  {formik.errors.userId}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm md:text-base" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                className={`w-full pl-10 pr-10 py-3 md:py-3 text-sm md:text-base border-2 ${
                  formik.errors.password && formik.touched.password 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:border-[#530505]'
                } rounded-lg focus:ring-2 focus:ring-[#530505]/20 outline-none transition-colors`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
              {formik.errors.password && formik.touched.password && (
                <div className="text-red-500 text-xs mt-1 ml-1">
                  {formik.errors.password}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-tr from-[#530505] to-[#a83232] text-white py-3 md:py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-shadow text-sm md:text-base"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : 'Login'}
            </motion.button>
          </form>

          {/* Mobile Footer */}
          <div className="mt-6 md:mt-8 text-center">
       
          </div>
        </div>
      </motion.div>
    </div>
  );
}