import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { MapPin, Search, Check } from 'lucide-react';
import { useVisits } from '../hooks/useVisits';
import { useNavigate } from 'react-router';

export function TripsScreen() {
  const { visits } = useVisits();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Group visits by country
  const countriesData = useMemo(() => {
    const countryMap = new Map<string, {
      countryName: string;
      countryCode: string;
      visits: typeof visits;
      citiesCount: number;
    }>();

    visits.forEach(visit => {
      const existing = countryMap.get(visit.countryCode);
      if (existing) {
        existing.visits.push(visit);
        const uniqueCities = new Set(existing.visits.filter(v => v.cityName).map(v => v.cityName));
        existing.citiesCount = uniqueCities.size;
      } else {
        const cities = visit.cityName ? 1 : 0;
        countryMap.set(visit.countryCode, {
          countryName: visit.countryName,
          countryCode: visit.countryCode,
          visits: [visit],
          citiesCount: cities,
        });
      }
    });

    return Array.from(countryMap.values());
  }, [visits]);

  const filteredCountries = useMemo(() => {
    if (!searchTerm) return countriesData;
    return countriesData.filter(c =>
      c.countryName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [countriesData, searchTerm]);

  // Color palette for country icons
  const iconColors = [
    'bg-teal-100 text-teal-500',
    'bg-blue-100 text-blue-500',
    'bg-red-100 text-red-500',
    'bg-purple-100 text-purple-500',
    'bg-pink-100 text-pink-500',
    'bg-green-100 text-green-500',
  ];

  function getIconColor(index: number) {
    return iconColors[index % iconColors.length];
  }

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white px-6 pt-12 pb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Countries</h1>
          <p className="text-gray-500 text-lg">{countriesData.length} of 6 visited</p>
        </motion.div>
      </div>

      <div className="px-6 space-y-4">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search countries..."
            className="w-full pl-12 pr-4 py-4 bg-gray-100 border-2 border-blue-500 rounded-3xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          />
        </motion.div>

        {/* Countries List */}
        <div className="space-y-3 pt-2">
          {filteredCountries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No countries found</p>
            </div>
          ) : (
            filteredCountries.map((country, index) => (
              <motion.button
                key={country.countryCode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                onClick={() => {
                  // Navigate to first visit of this country
                  if (country.visits.length > 0) {
                    navigate(`/trips/${country.visits[0].id}`);
                  }
                }}
                className="w-full bg-white rounded-3xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all"
              >
                {/* Icon */}
                <div className={`w-14 h-14 ${getIconColor(index)} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                  <MapPin size={24} />
                </div>

                {/* Country Info */}
                <div className="flex-1 text-left">
                  <div className="text-gray-900 font-bold text-xl">{country.countryName}</div>
                  <div className="text-gray-500 text-sm">
                    {country.visits.length} / {country.citiesCount} cities
                  </div>
                </div>

                {/* Checkmark */}
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="text-green-500" size={20} />
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Empty State */}
        {visits.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="text-gray-400" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No trips yet</h3>
            <p className="text-gray-500 mb-6">Start exploring the world!</p>
            <button
              onClick={() => navigate('/map')}
              className="bg-blue-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-600 transition-colors"
            >
              Add Your First Trip
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
