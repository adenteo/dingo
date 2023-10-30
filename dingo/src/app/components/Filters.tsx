import React, { useState } from "react";

interface FilterComponentProps {
  filters: string[]; // Add your filter options
}

const FilterComponent: React.FC<FilterComponentProps> = ({ filters }) => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (!selectedFilters.includes(value)) {
      setSelectedFilters([...selectedFilters, value]);
    }
  };

  const removeFilter = (filter: string) => {
    const updatedFilters = selectedFilters.filter((item) => item !== filter);
    setSelectedFilters(updatedFilters);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block text-gray-600 text-sm font-semibold mb-2">
          Choose Filters:
        </label>
        <select
          className="w-full p-2 border rounded text-black"
          multiple
          value={selectedFilters}
          onChange={handleFilterChange}
        >
          {filters.map((filter) => (
            <option key={filter} value={filter}>
              {filter}
            </option>
          ))}
        </select>
      </div>

      {/* <div className="mb-4">
        <label className="block text-gray-600 text-sm font-semibold mb-2">
          Recommended Filters:
        </label>
        <div className="flex flex-wrap">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`bg-blue-500 text-white rounded p-2 m-2 ${
                selectedFilters.includes(filter) ? "bg-blue-700" : ""
              }`}
              onClick={() => handleFilterChange({ target: { value: filter } })}
            >
              {filter}
            </button>
          ))}
        </div>
      </div> */}

      <div>
        <label className="block text-gray-600 text-sm font-semibold mb-2">
          Selected Filters:
        </label>
        <div>
          {selectedFilters.map((filter) => (
            <span
              key={filter}
              className="bg-gray-300 text-gray-700 rounded-full px-3 py-1 m-2"
            >
              {filter}
              <button
                className="ml-2 text-red-500"
                onClick={() => removeFilter(filter)}
              >
                Remove
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;
