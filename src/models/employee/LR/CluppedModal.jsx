import React from "react";

function ClubbedModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  // Parse clubbed_from data
  let clubbedInvoices = [];
  let clubbedCount = 0;
  let reference = "";
  let regularBoxes = 0;
  
  try {
    // Get clubbed_from data from different possible locations
    const clubbedFromData = data?.clubbed_from || data?._raw?.clubbed_from;
    console.log("Club: ",data);

    if (clubbedFromData) {
      if (Array.isArray(clubbedFromData)) {
        clubbedInvoices = clubbedFromData;
      } else if (typeof clubbedFromData === 'string') {
        // Parse JSON string
        clubbedInvoices = JSON.parse(clubbedFromData);
      }
    }
    
    // Get reference
    reference = data?.reference || data?._raw?.Reference || "";
    
    // Calculate clubbed count based on invoices
    clubbedCount = clubbedInvoices.length;
    
    // Get regular boxes count
    regularBoxes = data?.regularBoxes || data?.regular_boxes || 
                   data?._raw?.Regular_boxes || data?._raw?.["Regular boxes"] || 0;
    
  } catch (error) {
    console.error("Error parsing clubbed data:", error);
  }

  // Check if there are clubbed invoices
  const hasClubbedInvoices = clubbedInvoices.length > 0;
  
  // Get clubbed boxes from data
  const clubbedBoxes = data?.clubedBoxes || data?.clubed_boxes || 
                       data?._raw?.["Clubed Boxes"] || 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-md shadow-md w-96 max-h-96 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4 text-gray-400">
          CLUBBED ORDER DETAILS {reference && `- ${reference}`}
        </h2>

        {hasClubbedInvoices ? (
          <div className="space-y-4">

            {/* Clubbed Invoices List */}
            <div className="p-2 bg-gray-100 border border-none rounded-lg">
              <p className="font-semibold text-gray-500 mb-2">Invoice Numbers :</p>
              <ul className=" rounded-md max-h-40 overflow-y-auto">
                {clubbedInvoices.map((invoice, index) => (
                  <span key={index} className="text-sx px-2 border-gray-200 last:border-b-0">
                    <span className="font-mono">{invoice}</span>
                  </span>
                ))}
              </ul>
            </div>

            {/* Original Data Info */}
            <div className="text-sm text-gray-600 mt-3 p-2 bg-gray-100 rounded space-y-2">
              <div className="flex"><p className="font-bold text-gray-500">Company Name: </p><p className="ml-2 text-sm text-black font-bold ">{data.companyName}</p></div>
              <div className="flex"><p className="font-bold text-gray-500"> Total Case Count: </p><p className="ml-2 text-black font-bold text-sm">{clubbedBoxes}</p></div>
              <div className="flex"><p className="font-bold text-gray-500"> Number of Invoices Clubbed : </p><p className="ml-2 text-black font-bold text-sm">{clubbedCount}</p></div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center">No clubbed data found</p>
        )}

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-[#6a1a13] text-white rounded w-full hover:bg-[#865556] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default ClubbedModal;    