import React from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { StarRating } from './StarRating';
import { format } from 'date-fns';

interface TripCardProps {
  id: string;
  title: string;
  countryName: string;
  cityName?: string;
  rating: number;
  startDate?: string;
  coverPhoto?: string;
  onClick: () => void;
}

export function TripCard({
  title,
  countryName,
  cityName,
  rating,
  startDate,
  coverPhoto,
  onClick,
}: TripCardProps) {
  const location = cityName ? `${cityName}, ${countryName}` : countryName;
  
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Cover Photo */}
      <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
        {coverPhoto ? (
          <img src={coverPhoto} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin size={48} className="text-white/50" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{title}</h3>
        
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <MapPin size={16} />
          <span className="line-clamp-1">{location}</span>
        </div>

        {startDate && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Calendar size={16} />
            <span>{format(new Date(startDate), 'MMM d, yyyy')}</span>
          </div>
        )}

        {rating > 0 && (
          <div className="pt-2">
            <StarRating rating={rating} readonly size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
