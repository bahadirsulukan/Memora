import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { motion } from 'motion/react';
import { useVisits } from '../hooks/useVisits';

interface InteractiveGlobeProps {
  visitedCountries: string[];
  onCountryClick: (country: { name: string; code: string }) => void;
}

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

export function InteractiveGlobe({ visitedCountries, onCountryClick }: InteractiveGlobeProps) {
  const { visits } = useVisits();
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [hoveredCountryName, setHoveredCountryName] = useState<string | null>(null);
  const [position, setPosition] = useState({ coordinates: [0, 0], zoom: 1 });

  // Create a map of country code -> color from visits
  const countryColorMap = useMemo(() => {
    const map: { [key: string]: string } = {};
    
    // For each country, use the color from the LATEST visit
    visits.forEach(visit => {
      if (visit.countryCode && visit.color) {
        map[visit.countryCode] = visit.color;
      }
    });
    
    console.log('🎨 Country color map:', map);
    return map;
  }, [visits]);

  // Get color for a country
  const getCountryColor = (countryCode: string) => {
    // If country has been visited, return its color
    if (countryColorMap[countryCode]) {
      return countryColorMap[countryCode];
    }
    
    // Otherwise return light gray (unvisited)
    return '#E5E7EB';
  };

  const handleCountryClick = (geo: any) => {
    const countryName = geo.properties.name;
    const countryCode = geo.id; // ISO 3166-1 numeric code
    
    // Map numeric code to ISO A2 (simplified mapping)
    const codeMapping: { [key: string]: string } = {
      '840': 'US', '826': 'GB', '250': 'FR', '276': 'DE', '380': 'IT',
      '724': 'ES', '392': 'JP', '156': 'CN', '356': 'IN', '076': 'BR',
      '484': 'MX', '124': 'CA', '036': 'AU', '792': 'TR', '643': 'RU',
      '410': 'KR', '764': 'TH', '360': 'ID', '528': 'NL', '756': 'CH',
      '752': 'SE', '578': 'NO', '208': 'DK', '300': 'GR', '620': 'PT',
      '616': 'PL', '040': 'AT', '056': 'BE', '372': 'IE', '203': 'CZ',
      '710': 'ZA', '032': 'AR', '152': 'CL', '818': 'EG', '504': 'MA',
      '784': 'AE', '702': 'SG', '458': 'MY', '608': 'PH', '704': 'VN',
    };
    
    const isoCode = codeMapping[countryCode] || countryCode;
    
    if (countryName && isoCode) {
      console.log('🌍 Country clicked:', countryName, isoCode);
      onCountryClick({ name: countryName, code: isoCode });
    }
  };

  function handleMoveEnd(position: any) {
    setPosition(position);
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950/30 to-purple-950/20"></div>
      
      {/* Floating Particles Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Country Hover Tooltip */}
      {hoveredCountryName && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none"
        >
          <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-2xl border border-white/20">
            <p className="text-gray-900 font-bold text-lg whitespace-nowrap">
              {hoveredCountryName}
            </p>
          </div>
        </motion.div>
      )}

      {/* Map Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 140,
          }}
          width={800}
          height={400}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates as [number, number]}
            onMoveEnd={handleMoveEnd}
            maxZoom={8}
            minZoom={1}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryCode = geo.id;
                  
                  // Map numeric code to ISO A2
                  const codeMapping: { [key: string]: string } = {
                    '840': 'US', '826': 'GB', '250': 'FR', '276': 'DE', '380': 'IT',
                    '724': 'ES', '392': 'JP', '156': 'CN', '356': 'IN', '076': 'BR',
                    '484': 'MX', '124': 'CA', '036': 'AU', '792': 'TR', '643': 'RU',
                    '410': 'KR', '764': 'TH', '360': 'ID', '528': 'NL', '756': 'CH',
                    '752': 'SE', '578': 'NO', '208': 'DK', '300': 'GR', '620': 'PT',
                    '616': 'PL', '040': 'AT', '056': 'BE', '372': 'IE', '203': 'CZ',
                    '710': 'ZA', '032': 'AR', '152': 'CL', '818': 'EG', '504': 'MA',
                    '784': 'AE', '702': 'SG', '458': 'MY', '608': 'PH', '704': 'VN',
                  };
                  
                  const isoCode = codeMapping[countryCode] || countryCode;
                  const color = getCountryColor(isoCode);
                  const isVisited = !!countryColorMap[isoCode];
                  const isHovered = hoveredCountry === isoCode;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => {
                        setHoveredCountry(isoCode);
                        setHoveredCountryName(geo.properties.name);
                      }}
                      onMouseLeave={() => {
                        setHoveredCountry(null);
                        setHoveredCountryName(null);
                      }}
                      onClick={() => handleCountryClick(geo)}
                      style={{
                        default: {
                          fill: color,
                          stroke: isVisited ? '#FFFFFF' : '#1F2937',
                          strokeWidth: isVisited ? 0.8 : 0.4,
                          outline: 'none',
                          transition: 'all 0.3s ease',
                        },
                        hover: {
                          fill: isVisited ? color : '#D1D5DB',
                          stroke: '#FFFFFF',
                          strokeWidth: 1.2,
                          outline: 'none',
                          cursor: 'pointer',
                          filter: isVisited ? 'brightness(1.2)' : 'brightness(1.1)',
                        },
                        pressed: {
                          fill: color,
                          stroke: '#FFFFFF',
                          strokeWidth: 1.5,
                          outline: 'none',
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-2">
        <button
          onClick={() => setPosition(pos => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 8) }))}
          className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl hover:bg-white hover:scale-110 transition-all border border-white/20"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
          </svg>
        </button>
        
        <button
          onClick={() => setPosition(pos => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 1) }))}
          className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl hover:bg-white hover:scale-110 transition-all border border-white/20"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
        
        <button
          onClick={() => setPosition({ coordinates: [0, 0], zoom: 1 })}
          className="bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl hover:bg-white hover:scale-110 transition-all border border-white/20"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
}
