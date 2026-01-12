
import { Search } from "lucide-react";

// Search component
const LrUpdateSearch = ({ onSearch, onExportPage, onExportAll }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 bg-white rounded-xl shadow-md p-8">
      {/* Search input */}
      <div className="relative w-full max-w-sm">
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
        />
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
      </div>

      {/* Export buttons */}
      <div className="flex gap-4">
        <button
          onClick={onExportPage}
          className="bg-[#842626] hover:bg-rose-500 text-white text-sm font-semibold rounded-md px-6 py-2 shadow-md"
        >
          Export Current Page
        </button>

        <button
          onClick={onExportAll}
          className="bg-[#842626] hover:bg-rose-500 text-white text-sm font-semibold rounded-md px-6 py-2 shadow-md"
        >
          Export All Page
        </button>
      </div>
    </div>
  );
};

export default LrUpdateSearch;