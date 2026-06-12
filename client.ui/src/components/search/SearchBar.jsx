import { Search, X } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <div className="relative flex items-center">
      {/* Search icon */}
      <Search className="absolute left-3 w-4 h-4 pointer-events-none text-slate-400 dark:text-slate-500" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 rounded-full text-sm outline-none border transition-all backdrop-blur-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 border-transparent dark:border-slate-700 focus:border-slate-300 dark:focus:border-slate-600 focus:bg-white dark:focus:bg-slate-900 focus:shadow-sm"
      />

      {/* Clear button — only visible when there is input */}
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 transition-colors text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;