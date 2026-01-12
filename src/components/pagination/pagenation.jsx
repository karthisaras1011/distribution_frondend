import React from "react";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showPageNumbers = true,
  showFirstLast = true,
  showPrevNext = true,
  className = "",
  buttonClassName = "",
  activeButtonClassName = "",
  disabledButtonClassName = "",
  showInfo = false,
  totalRecords = 0,
  recordsPerPage = 0
}) => {
  if (totalPages <= 1) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  const handleFirst = () => {
    if (currentPage > 1) onPageChange(1);
  };

  const handleLast = () => {
    if (currentPage < totalPages) onPageChange(totalPages);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = startPage + maxVisiblePages - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push('...');
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const getDisplayInfo = () => {
    if (!totalRecords || !recordsPerPage) return null;
    
    const startRecord = (currentPage - 1) * recordsPerPage + 1;
    const endRecord = Math.min(currentPage * recordsPerPage, totalRecords);
    
    return `Showing ${startRecord}-${endRecord} of ${totalRecords} records`;
  };

  const baseButtonClasses = "px-3 py-2 border rounded-md transition-all duration-200 font-medium";
  const defaultButtonClasses = "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400";
  const defaultActiveButtonClasses = "bg-[#6a1a12] hover:bg-amber-950 text-white ";
  const defaultDisabledButtonClasses = "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed";

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Page Info */}
      {showInfo && (
        <div className="text-center text-sm text-gray-600">
          {getDisplayInfo() || `Page ${currentPage} of ${totalPages}`}
        </div>
      )}
      
      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* First Page Button */}
        {showFirstLast && (
          <button
            onClick={handleFirst}
            disabled={currentPage === 1}
            className={`${baseButtonClasses} ${
              buttonClassName || defaultButtonClasses
            } ${currentPage === 1 ? (disabledButtonClassName || defaultDisabledButtonClasses) : ""}`}
            title="First Page"
          >
            First
          </button>
        )}

        {/* Previous Button */}
        {showPrevNext && (
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className={`${baseButtonClasses} ${
              buttonClassName || defaultButtonClasses
            } ${currentPage === 1 ? (disabledButtonClassName || defaultDisabledButtonClasses) : ""}`}
            title="Previous Page"
          >
            Prev
          </button>
        )}

        {/* Page Numbers */}
        {showPageNumbers && getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' ? onPageChange(page) : null}
            disabled={page === '...'}
            className={`${baseButtonClasses} min-w-[40px] ${
              page === '...' 
                ? (disabledButtonClassName || defaultDisabledButtonClasses) + ' cursor-default'
                : currentPage === page
                  ? (activeButtonClassName || defaultActiveButtonClasses)
                  : (buttonClassName || defaultButtonClasses)
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        {showPrevNext && (
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className={`${baseButtonClasses} ${
              buttonClassName || defaultButtonClasses
            } ${currentPage === totalPages ? (disabledButtonClassName || defaultDisabledButtonClasses) : ""}`}
            title="Next Page"
          >
            Next
          </button>
        )}

        {/* Last Page Button */}
        {showFirstLast && (
          <button
            onClick={handleLast}
            disabled={currentPage === totalPages}
            className={`${baseButtonClasses} ${
              buttonClassName || defaultButtonClasses
            } ${currentPage === totalPages ? (disabledButtonClassName || defaultDisabledButtonClasses) : ""}`}
            title="Last Page"
          >
            Last
          </button>
        )}
      </div>
    </div>
  );
};

export default Pagination;