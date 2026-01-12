import { useState, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { 
  createCompany, 
  updateCompany, 
  checkCompanyName,
  checkReferenceId
} from '../../../service/admin/companyApi';
import debounce from 'lodash.debounce';

const validationSchema = Yup.object().shape({
  company_name: Yup.string().required('Company name is required'),
  company_email: Yup.string().email('Invalid email').required('Email is required'),
  product_type: Yup.string().required('Product type is required'),
  company_mobile: Yup.string()
    .required('Mobile number is required')
    .matches(/^[0-9]{10}$/, 'Must be exactly 10 digits')
});
 
// Updated Generate Reference ID function
// Company name la irukka characters mattum use panni Reference ID create pannu
const generateBaseReferenceId = (name) => {
  if (!name) return '';
  
  // Remove spaces and special characters, convert to uppercase
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  
  if (cleanName.length < 3) {
    // If name too short, repeat characters
    return (cleanName + cleanName + cleanName).substring(0, 3);
  }

  // First 3 characters from cleaned name
  return cleanName.substring(0, 3);
};

export default function CompanyModal({ onClose, onSuccess, editData }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateErrors, setDuplicateErrors] = useState({ company_name: '', reference_id: '' });
  const [apiError, setApiError] = useState('');
  const [isChecking, setIsChecking] = useState({ company_name: false, reference_id: false });
  const [isGeneratingRefId, setIsGeneratingRefId] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const isEditMode = Boolean(editData);

  // Debounced check for company name
  const debouncedCheckCompanyName = useCallback(
    debounce(async (name) => {
      if (!name || (isEditMode && name === editData.company_name)) return;
      setIsChecking(prev => ({ ...prev, company_name: true }));
      try {
        const response = await checkCompanyName(name);
        setDuplicateErrors(prev => ({
          ...prev,
          company_name: response.data.exists ? 'Company name already exists' : ''
        }));
      } catch (error) {
        console.error('Error checking company name:', error);
      } finally {
        setIsChecking(prev => ({ ...prev, company_name: false }));
      }
    }, 500),
    [isEditMode, editData?.company_name]
  );

  // Debounced check for reference ID
  const debouncedCheckReferenceId = useCallback(
    debounce(async (ref) => {
      if (!ref) return;
      
      // In edit mode, don't check if reference ID hasn't changed
      if (isEditMode && ref === editData.reference_id) {
        setDuplicateErrors(prev => ({ ...prev, reference_id: '' }));
        return;
      }
      
      setIsChecking(prev => ({ ...prev, reference_id: true }));
      try {
        const response = await checkReferenceId(ref);
        setDuplicateErrors(prev => ({
          ...prev,
          reference_id: response.data.exists ? 'Reference ID already exists' : ''
        }));
      } catch (error) {
        console.error('Error checking reference ID:', error);
      } finally {
        setIsChecking(prev => ({ ...prev, reference_id: false }));
      }
    }, 500),
    [isEditMode, editData?.reference_id]
  );

  const formik = useFormik({
    initialValues: {
      company_name: '',
      company_email: '',
      product_type: 'PHARMA',
      company_mobile: '',
      company_status: 1
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        setApiError('');

        const submissionValues = {
          ...values,
          company_mobile: parseInt(values.company_mobile, 10),
          reference_id: referenceId
        };

        // Duplicate name check
        if (!isEditMode || (isEditMode && values.company_name !== editData.company_name)) {
          const response = await checkCompanyName(values.company_name);
          if (response.data.exists) {
            setDuplicateErrors(prev => ({ ...prev, company_name: 'Company name already exists' }));
            return;
          }
        }

        // Duplicate reference check - only if reference ID has changed
        if (!isEditMode || (isEditMode && referenceId !== editData.reference_id)) {
          const refResponse = await checkReferenceId(referenceId);
          if (refResponse.data.exists) {
            setDuplicateErrors(prev => ({ ...prev, reference_id: 'Reference ID already exists' }));
            return;
          }
        }

        // Clear any previous duplicate errors
        setDuplicateErrors({ company_name: '', reference_id: '' });

        if (isEditMode) {
          await updateCompany(editData.id, submissionValues);
          onSuccess('Company updated successfully');
        } else {
          await createCompany(submissionValues);
          onSuccess('Company created successfully');
        }

        onClose();
      } catch (error) {
        const errorMsg = error.response?.data?.message || 
          `Failed to ${isEditMode ? 'update' : 'create'} company`;
        setApiError(errorMsg);
        toast.error(errorMsg, { position: "top-right", autoClose: 3000 });
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (editData) {
      formik.setValues({
        company_name: editData.company_name || '',
        company_email: editData.company_email || '',
        product_type: editData.product_type || 'PHARMA',
        company_mobile: editData.company_mobile ? editData.company_mobile.toString() : '',
        company_status: editData.company_status || 1
      });
      setReferenceId(editData.reference_id || '');
    }
  }, [editData]);

  // Auto-generate Reference ID + check duplicate (only for create mode)
// Auto-generate Reference ID (company name characters only)
useEffect(() => {
  if (!isEditMode && formik.values.company_name) {
    setIsGeneratingRefId(true);
    
    const generateAndCheckRef = async () => {
      const cleanName = formik.values.company_name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      let finalRef = '';
      let attempt = 0;

      // Try different combinations from company name
      while (attempt < cleanName.length - 2) {
        // Take 3 characters from different positions
        if (attempt === 0) {
          finalRef = cleanName.substring(0, 3); // First 3 chars
        } else {
          finalRef = cleanName.substring(attempt, attempt + 3); // Next 3 chars
        }

        try {
          const response = await checkReferenceId(finalRef);
          if (!response.data.exists) {
            break; // Unique reference found
          }
          attempt++;
        } catch (error) {
          console.error('Error checking reference ID:', error);
          break;
        }
      }

      // If still no unique ID found, use first 3 chars with number
      if (finalRef === '' || attempt >= cleanName.length - 2) {
        finalRef = cleanName.substring(0, 2) + (attempt + 1);
      }

      setReferenceId(finalRef);
      setIsGeneratingRefId(false);
    };

    generateAndCheckRef();
  }
}, [formik.values.company_name, isEditMode]);

  // Real-time duplicate check for company name
  useEffect(() => {
    debouncedCheckCompanyName(formik.values.company_name);
    return () => debouncedCheckCompanyName.cancel();
  }, [formik.values.company_name, debouncedCheckCompanyName]);

  // Cleanup for reference ID debounce
  useEffect(() => {
    debouncedCheckReferenceId(referenceId);
    return () => debouncedCheckReferenceId.cancel();
  }, [referenceId, debouncedCheckReferenceId]);

  const handleMobileInput = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    formik.setFieldValue('company_mobile', value);
  };

  // Check if form can be submitted
  const canSubmit = () => {
    if (isSubmitting) return false;
    if (duplicateErrors.company_name) return false;
    if (duplicateErrors.reference_id) return false;
    if (isGeneratingRefId) return false;
    if (!formik.isValid) return false;
    if (!referenceId) return false;
    
    return true;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl">
          ✕
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {isEditMode ? 'Edit' : 'Add'} Company Details
        </h2>

        {apiError && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Company Name */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Company Name *
              </label>
              <div className="relative">
                <input
                  name="company_name"
                  type="text"
                  placeholder="Enter company name"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#884d51]"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.company_name}
                />
                {isChecking.company_name && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  </div>
                )}
              </div>
              {formik.touched.company_name && formik.errors.company_name && (
                <div className="text-red-500 text-xs mt-1">{formik.errors.company_name}</div>
              )}
              {duplicateErrors.company_name && (
                <div className="text-red-500 text-xs mt-1">{duplicateErrors.company_name}</div>
              )}
            </div>

            {/* Company Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Company Email *
              </label>
              <input
                name="company_email"
                type="email"
                placeholder="Enter email"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#884d51]"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.company_email}
              />
              {formik.touched.company_email && formik.errors.company_email && (
                <div className="text-red-500 text-xs mt-1">{formik.errors.company_email}</div>
              )}
            </div>

            {/* Company Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Company Mobile *
              </label>
              <input
                name="company_mobile"
                type="number"
                placeholder="Enter 10-digit mobile number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#884d51]"
                onChange={handleMobileInput}
                onBlur={formik.handleBlur}
                value={formik.values.company_mobile}
                maxLength={10}
              />
              {formik.touched.company_mobile && formik.errors.company_mobile && (
                <div className="text-red-500 text-xs mt-1">{formik.errors.company_mobile}</div>
              )}
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Product Type *
              </label>
              <select
                name="product_type"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#884d51]"
                onChange={formik.handleChange}
                value={formik.values.product_type}
              >
                <option value="PHARMA">Pharma</option>
                <option value="ELECTRICAL">Electrical</option>
                <option value="ELECTRONICS">Electronics</option>
                
              </select>
            </div>

            {/* Reference ID */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Reference ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  className={`w-full border border-gray-300 rounded-md px-3 py-2 ${
                    isEditMode ? 'bg-gray-200 cursor-not-allowed' : 'bg-gray-100'
                  }`}
                  value={referenceId || 'Will be generated automatically'}
                  readOnly
                />
                {(isGeneratingRefId || isChecking.reference_id) && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  </div>
                )}
              </div>
              {duplicateErrors.reference_id && (
                <div className="text-red-500 text-xs mt-1">{duplicateErrors.reference_id}</div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit()}
              className="px-6 py-2 bg-[#884d51] text-white font-medium rounded-md shadow hover:opacity-90 disabled:opacity-70"
            >
              {isSubmitting ? (isEditMode ? 'Updating...' : 'Submitting...') : 
                (isEditMode ? 'Update' : 'Submit')}
            </button>
          </div>
        </form>
      </div>
    </div>  
  );
}




