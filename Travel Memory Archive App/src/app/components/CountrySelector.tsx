import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { SAMPLE_COUNTRIES } from '../utils/sample-data';

interface CountrySelectorProps {
  onSelect: (country: { name: string; code: string; lat: number; lon: number; city: string }) => void;
}

export function CountrySelector({ onSelect }: CountrySelectorProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCountries = SAMPLE_COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (country: typeof SAMPLE_COUNTRIES[0]) => {
    onSelect(country);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-left hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <span className="text-gray-600">Select from popular destinations</span>
        <Search size={20} className="text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-hidden">
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search countries or cities..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>
            <div className="overflow-y-auto max-h-64">
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className="w-full px-4 py-3 hover:bg-blue-50 transition-colors text-left"
                >
                  <div className="font-medium text-gray-900">{country.city}</div>
                  <div className="text-sm text-gray-600">{country.name}</div>
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <div className="px-4 py-6 text-center text-gray-500">
                  No results found
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
