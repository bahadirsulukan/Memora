import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Globe, Plus, X, Calendar, Star, Search, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { InteractiveGlobe } from '../components/InteractiveGlobe';
import { useVisits } from '../hooks/useVisits';
import type { Visit } from '../contexts/VisitsContext';

interface SelectedCountry {
  name: string;
  code: string;
}

// Country codes and coordinates mapping
const COUNTRY_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'US': { lat: 37.0902, lng: -95.7129 },
  'GB': { lat: 55.3781, lng: -3.4360 },
  'FR': { lat: 46.2276, lng: 2.2137 },
  'DE': { lat: 51.1657, lng: 10.4515 },
  'IT': { lat: 41.8719, lng: 12.5674 },
  'ES': { lat: 40.4637, lng: -3.7492 },
  'JP': { lat: 36.2048, lng: 138.2529 },
  'CN': { lat: 35.8617, lng: 104.1954 },
  'IN': { lat: 20.5937, lng: 78.9629 },
  'BR': { lat: -14.2350, lng: -51.9253 },
  'MX': { lat: 23.6345, lng: -102.5528 },
  'CA': { lat: 56.1304, lng: -106.3468 },
  'AU': { lat: -25.2744, lng: 133.7751 },
  'TR': { lat: 38.9637, lng: 35.2433 },
  'RU': { lat: 61.5240, lng: 105.3188 },
  'KR': { lat: 35.9078, lng: 127.7669 },
  'TH': { lat: 15.8700, lng: 100.9925 },
  'ID': { lat: -0.7893, lng: 113.9213 },
  'NL': { lat: 52.1326, lng: 5.2913 },
  'CH': { lat: 46.8182, lng: 8.2275 },
  'SE': { lat: 60.1282, lng: 18.6435 },
  'NO': { lat: 60.4720, lng: 8.4689 },
  'DK': { lat: 56.2639, lng: 9.5018 },
  'GR': { lat: 39.0742, lng: 21.8243 },
  'PT': { lat: 39.3999, lng: -8.2245 },
  'PL': { lat: 51.9194, lng: 19.1451 },
  'AT': { lat: 47.5162, lng: 14.5501 },
  'BE': { lat: 50.5039, lng: 4.4699 },
  'IE': { lat: 53.4129, lng: -8.2439 },
  'CZ': { lat: 49.8175, lng: 15.4730 },
  'ZA': { lat: -30.5595, lng: 22.9375 },
  'AR': { lat: -38.4161, lng: -63.6167 },
  'CL': { lat: -35.6751, lng: -71.5430 },
  'EG': { lat: 26.8206, lng: 30.8025 },
  'MA': { lat: 31.7917, lng: -7.0926 },
  'AE': { lat: 23.4241, lng: 53.8478 },
  'SG': { lat: 1.3521, lng: 103.8198 },
  'MY': { lat: 4.2105, lng: 101.9758 },
  'PH': { lat: 12.8797, lng: 121.7740 },
  'VN': { lat: 14.0583, lng: 108.2772 },
};

export function MapScreen() {
  const navigate = useNavigate();
  const { visits, loading, addVisit } = useVisits();
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showControls, setShowControls] = useState(true);
  
  // Form states
  const [title, setTitle] = useState('');
  const [cityName, setCityName] = useState('');
  const [rating, setRating] = useState(5);
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3B82F6'); // Default blue
  
  // Color options with labels
  const COLOR_OPTIONS = [
    { color: '#3B82F6', label: 'Business', emoji: '💼' },
    { color: '#F59E0B', label: 'Family', emoji: '👨‍👩‍👧' },
    { color: '#10B981', label: 'Vacation', emoji: '🏖️' },
    { color: '#EC4899', label: 'Romance', emoji: '💕' },
    { color: '#8B5CF6', label: 'Adventure', emoji: '🏔️' },
    { color: '#EF4444', label: 'Food Tour', emoji: '🍜' },
    { color: '#0EA5E9', label: 'Education', emoji: '📚' },
    { color: '#22C55E', label: 'Friends', emoji: '👥' },
  ];

  // ESC key to close modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddModal) {
        handleCloseModal();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showAddModal]);

  function handleCountryClick(country: { name: string; code: string }) {
    setSelectedCountry({ name: country.name, code: country.code });
    setShowAddModal(true);
    setTitle(`Trip to ${country.name}`);
  }

  const visitedCountryCodes = Array.from(new Set(visits.map(v => v.countryCode)));
  const visitedCountriesCount = visitedCountryCodes.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedCountry) {
      toast.error('Please select a country');
      return;
    }

    const visitData = {
      title,
      countryName: selectedCountry.name,
      countryCode: selectedCountry.code,
      cityName: cityName || undefined,
      rating,
      startDate: startDate || undefined,
      notes: notes || undefined,
      latitude: COUNTRY_COORDINATES[selectedCountry.code]?.lat || 0,
      longitude: COUNTRY_COORDINATES[selectedCountry.code]?.lng || 0,
      color: selectedColor,
    };

    console.log('Submitting visit data:', visitData);

    const newVisit = await addVisit(visitData);

    if (newVisit) {
      console.log('Visit created successfully:', newVisit);
      handleCloseModal();
      // Toast is already shown in addVisit
    }
    // Error toast is also shown in addVisit
  }

  function handleCloseModal() {
    setShowAddModal(false);
    setSelectedCountry(null);
    setTitle('');
    setCityName('');
    setRating(5);
    setStartDate('');
    setNotes('');
    setSelectedColor('#3B82F6'); // Reset color to default
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-gray-950 to-black">
      {/* 2D Interactive Map */}
      <div className="absolute inset-0 w-full h-full">
        {!loading && (
          <InteractiveGlobe
            visitedCountries={visitedCountryCodes}
            onCountryClick={handleCountryClick}
          />
        )}
      </div>

      {/* Floating Header */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="absolute top-0 left-0 right-0 z-10 p-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden px-6 py-4">
            <div className="flex items-center justify-center gap-3">
              <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl p-2.5 shadow-lg">
                <Globe className="text-white" size={24} />
              </div>
              <div className="text-white text-center">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">ROUTES</h1>
                <p className="text-xs text-white/80 flex items-center gap-1.5 justify-center">
                  <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  {visitedCountriesCount} {visitedCountriesCount === 1 ? 'country' : 'countries'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add Visit Modal */}
      <AnimatePresence>
        {showAddModal && selectedCountry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl sm:text-3xl font-bold">Add Visit</h2>
                    <button
                      onClick={handleCloseModal}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <p className="text-white/90 text-lg font-medium">{selectedCountry.name}</p>
                </div>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Trip Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Amazing vacation in..."
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City (Optional)
                  </label>
                  <input
                    type="text"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    placeholder="Which city did you visit?"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Star size={16} className="inline mr-1" />
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          size={36}
                          className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Share your memories and experiences..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Trip Type & Color *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {COLOR_OPTIONS.map((option) => (
                      <button
                        key={option.color}
                        type="button"
                        onClick={() => setSelectedColor(option.color)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          selectedColor === option.color
                            ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: option.color }}
                        />
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-gray-900">
                            {option.emoji} {option.label}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={24} />
                  Add Visit
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-40">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <span className="text-gray-700 font-semibold text-lg">Loading map...</span>
          </div>
        </div>
      )}
    </div>
  );
}