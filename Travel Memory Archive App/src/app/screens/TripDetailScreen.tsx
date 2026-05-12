import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, MapPin, Calendar, Trash2 } from 'lucide-react';
import { authenticatedFetch } from '../utils/supabase-client';
import { StarRating } from '../components/StarRating';
import { TagChip } from '../components/TagChip';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Visit {
  id: string;
  title: string;
  countryName: string;
  cityName?: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  startDate?: string;
  endDate?: string;
  notes?: string;
  rating: number;
  photos?: string[];
  tags?: string[];
}

// Famous foods data (static for MVP)
const FAMOUS_FOODS: Record<string, Array<{ name: string; description: string }>> = {
  France: [
    { name: 'Croissant', description: 'Buttery, flaky pastry' },
    { name: 'Coq au Vin', description: 'Chicken braised in wine' },
    { name: 'Crème Brûlée', description: 'Caramelized custard dessert' },
  ],
  Italy: [
    { name: 'Pizza Napoletana', description: 'Traditional Neapolitan pizza' },
    { name: 'Pasta Carbonara', description: 'Creamy egg and bacon pasta' },
    { name: 'Gelato', description: 'Italian ice cream' },
  ],
  Japan: [
    { name: 'Sushi', description: 'Vinegared rice with fish' },
    { name: 'Ramen', description: 'Wheat noodle soup' },
    { name: 'Tempura', description: 'Battered and fried seafood/vegetables' },
  ],
  Mexico: [
    { name: 'Tacos', description: 'Folded tortilla with filling' },
    { name: 'Mole', description: 'Rich chocolate-chili sauce' },
    { name: 'Guacamole', description: 'Avocado-based dip' },
  ],
};

export function TripDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisit();
  }, [id]);

  async function fetchVisit() {
    if (!id) return;
    
    try {
      const response = await authenticatedFetch(`/visits/${id}`);

      if (response.ok) {
        const data = await response.json();
        setVisit(data.visit);
      } else {
        toast.error('Failed to load trip details');
        navigate('/trips');
      }
    } catch (error) {
      console.error('Error fetching visit:', error);
      toast.error('Failed to load trip details');
      navigate('/trips');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!id || !visit) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${visit.title}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      const response = await authenticatedFetch(`/visits/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Trip deleted successfully');
        navigate('/trips');
      } else {
        toast.error('Failed to delete trip');
      }
    } catch (error) {
      console.error('Error deleting visit:', error);
      toast.error('Failed to delete trip');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!visit) {
    return null;
  }

  const location = visit.cityName ? `${visit.cityName}, ${visit.countryName}` : visit.countryName;
  const famousFoods = FAMOUS_FOODS[visit.countryName] || [];
  const mapUrl = `https://www.openstreetmap.org/?mlat=${visit.latitude}&mlon=${visit.longitude}&zoom=12`;

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-600 p-2"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Cover Photo */}
      {visit.photos && visit.photos.length > 0 ? (
        <div className="h-64 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
          <img
            src={visit.photos[0]}
            alt={visit.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="h-64 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          <MapPin size={64} className="text-white/50" />
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Title & Location */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{visit.title}</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={20} />
            <span className="text-lg">{location}</span>
          </div>
        </div>

        {/* Dates */}
        {visit.startDate && (
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={20} />
            <span>
              {format(new Date(visit.startDate), 'MMM d, yyyy')}
              {visit.endDate && ` - ${format(new Date(visit.endDate), 'MMM d, yyyy')}`}
            </span>
          </div>
        )}

        {/* Rating */}
        {visit.rating > 0 && (
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <StarRating rating={visit.rating} readonly size={28} />
          </div>
        )}

        {/* Notes */}
        {visit.notes && (
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{visit.notes}</p>
          </div>
        )}

        {/* Photo Gallery */}
        {visit.photos && visit.photos.length > 1 && (
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Photos</h2>
            <div className="grid grid-cols-2 gap-3">
              {visit.photos.slice(1).map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Photo ${index + 2}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {visit.tags && visit.tags.length > 0 && (
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {visit.tags.map((tag) => (
                <TagChip key={tag} label={tag} />
              ))}
            </div>
          </div>
        )}

        {/* Famous Foods */}
        {famousFoods.length > 0 && (
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Famous Foods in {visit.countryName}</h2>
            <div className="space-y-3">
              {famousFoods.map((food, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🍽️</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{food.name}</h3>
                    <p className="text-sm text-gray-600">{food.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}