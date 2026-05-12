import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { X, Calendar, MapPin, Tag, Image as ImageIcon } from 'lucide-react';
import { StarRating } from '../components/StarRating';
import { TagChip } from '../components/TagChip';
import { CountrySelector } from '../components/CountrySelector';
import { PhotoUpload } from '../components/PhotoUpload';
import { toast } from 'sonner';
import { useVisits } from '../hooks/useVisits';

const COMMON_TAGS = ['Family', 'Solo', 'Work', 'Food', 'Adventure', 'Beach', 'City', 'Nature'];

export function AddVisitScreen() {
  const navigate = useNavigate();
  const { addVisit } = useVisits();
  const [loading, setLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [countryName, setCountryName] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [cityName, setCityName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const handleAddTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags([...tags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleAddPhoto = () => {
    if (photoInput.trim()) {
      setPhotoUrls([...photoUrls, photoInput.trim()]);
      setPhotoInput('');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

  const handleCountrySelect = (country: { name: string; code: string; lat: number; lon: number; city: string }) => {
    setCountryName(country.name);
    setCountryCode(country.code);
    setCityName(country.city);
    setLatitude(country.lat.toString());
    setLongitude(country.lon.toString());
    if (!title) {
      setTitle(`Trip to ${country.city}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !countryName || !latitude || !longitude) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const visitData = {
      title,
      countryName,
      countryCode: countryCode || countryName.substring(0, 2).toUpperCase(),
      cityName: cityName || undefined,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      notes: notes || undefined,
      rating,
      tags,
      photos: photoUrls,
    };

    console.log('Creating visit with data:', visitData);

    const newVisit = await addVisit(visitData);

    if (newVisit) {
      console.log('✅ Visit created successfully:', newVisit.id);
      navigate('/map');
      // Toast is shown in addVisit
    } else {
      console.log('❌ Failed to create visit');
      // Toast is shown in addVisit
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <X size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Add Visit</h1>
          <div className="w-6" /> {/* Spacer */}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Trip Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Summer in Paris"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Location */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <MapPin size={20} />
            <span>Location</span>
          </div>

          <div className="space-y-2">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country *
            </label>
            <CountrySelector onSelect={handleCountrySelect} />
            <input
              id="country"
              type="text"
              value={countryName}
              onChange={(e) => setCountryName(e.target.value)}
              placeholder="e.g., France"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="countryCode" className="block text-sm font-medium text-gray-700">
              Country Code (optional)
            </label>
            <input
              id="countryCode"
              type="text"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              placeholder="e.g., FR"
              maxLength={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City (optional)
            </label>
            <input
              id="city"
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="e.g., Paris"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                Latitude *
              </label>
              <input
                id="latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="48.8566"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                Longitude *
              </label>
              <input
                id="longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="2.3522"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Calendar size={20} />
            <span>Dates</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Share your memories and experiences..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Photos */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <ImageIcon size={20} />
            <span>Photos</span>
          </div>

          <PhotoUpload
            photos={photoUrls}
            onPhotosChange={setPhotoUrls}
            maxPhotos={5}
          />
        </div>

        {/* Rating */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Rating</label>
          <StarRating rating={rating} onRatingChange={setRating} size={32} />
        </div>

        {/* Tags */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-4">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Tag size={20} />
            <span>Tags</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  tags.includes(tag)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTag())}
              placeholder="Add custom tag"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAddCustomTag}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Add
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <TagChip key={tag} label={tag} onRemove={() => handleRemoveTag(tag)} variant="selected" />
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Trip'}
        </button>
      </form>
    </div>
  );
}