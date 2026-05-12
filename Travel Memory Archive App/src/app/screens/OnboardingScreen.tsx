import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Map, Camera, TrendingUp, ChevronRight } from 'lucide-react';

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Map,
      title: 'Track Your Travels',
      description: 'Mark the countries and cities you\'ve visited on an interactive world map. Never forget where you\'ve been.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Camera,
      title: 'Create Memories',
      description: 'Add notes, photos, ratings, and discover famous local foods. Turn your trips into a structured memory archive.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingUp,
      title: 'Your Travel Story',
      description: 'View statistics, track your journey, and get a yearly "Travel Wrapped" summary of your adventures.',
      color: 'from-orange-500 to-red-500',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleSkip = () => {
    navigate('/map');
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Skip Button */}
      <div className="p-4 flex justify-end">
        <button
          onClick={handleSkip}
          className="text-gray-600 font-medium hover:text-gray-900"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-20">
        {/* Icon */}
        <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${slide.color} flex items-center justify-center mb-8 shadow-xl`}>
          <Icon size={64} className="text-white" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
          {slide.title}
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 text-center max-w-md mb-12">
          {slide.description}
        </p>

        {/* Dots Indicator */}
        <div className="flex gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-6 space-y-3">
        {currentSlide === slides.length - 1 ? (
          <button
            onClick={() => navigate('/map')}
            className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors shadow-lg"
          >
            Get Started
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full bg-blue-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-600 transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            Next
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}