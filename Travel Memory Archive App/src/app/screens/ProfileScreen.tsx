import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Settings, Bell, Shield, HelpCircle, LogOut, User, ChevronRight, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useVisits } from '../hooks/useVisits';
import { useNavigate } from 'react-router';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { visits } = useVisits();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const countries = new Set(visits.map(v => v.countryCode));
    const cities = new Set(visits.filter(v => v.cityName).map(v => v.cityName));
    const totalCountries = 195;
    const coverage = Math.round((countries.size / totalCountries) * 100);

    return {
      countriesVisited: countries.size,
      citiesExplored: cities.size,
      coverage,
    };
  }, [visits]);

  const menuItems = [
    {
      icon: Settings,
      title: 'Settings',
      subtitle: 'App preferences',
      onClick: () => {},
      color: 'bg-gray-100',
      iconColor: 'text-gray-700',
    },
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Manage alerts',
      onClick: () => {},
      color: 'bg-gray-100',
      iconColor: 'text-gray-700',
    },
    {
      icon: Shield,
      title: 'Privacy',
      subtitle: 'Data & security',
      onClick: () => {},
      color: 'bg-gray-100',
      iconColor: 'text-gray-700',
    },
    {
      icon: HelpCircle,
      title: 'Help & Support',
      subtitle: 'Get assistance',
      onClick: () => {},
      color: 'bg-gray-100',
      iconColor: 'text-gray-700',
    },
  ];

  async function handleLogout() {
    await logout();
  }

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 pb-24">
      {/* Header with Profile */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-b-[40px] px-6 pt-12 pb-16 shadow-lg relative">
        {/* Edit Button */}
        <button className="absolute top-12 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
          <Edit className="text-white" size={20} />
        </button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center"
        >
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
              <User className="text-blue-500" size={60} />
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-blue-500" />
          </div>

          {/* Name */}
          <h1 className="text-3xl font-bold text-white mb-1">{user?.name || 'User'}</h1>
          <p className="text-blue-100 text-lg">Travel Enthusiast</p>
        </motion.div>
      </div>

      <div className="px-6 -mt-8 space-y-4">
        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm overflow-hidden"
        >
          <div className="grid grid-cols-3 divide-x divide-gray-200">
            <div className="py-6 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-1">{stats.countriesVisited}</div>
              <div className="text-gray-500 text-sm font-medium">Countries</div>
            </div>
            <div className="py-6 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-1">{stats.citiesExplored}</div>
              <div className="text-gray-500 text-sm font-medium">Cities</div>
            </div>
            <div className="py-6 text-center">
              <div className="text-4xl font-bold text-gray-900 mb-1">{stats.coverage}%</div>
              <div className="text-gray-500 text-sm font-medium">Coverage</div>
            </div>
          </div>
        </motion.div>

        {/* Menu Items */}
        <div className="space-y-3 pt-4">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={item.onClick}
              className="w-full bg-white rounded-3xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                <item.icon className={item.iconColor} size={24} />
              </div>
              <div className="flex-1 text-left">
                <div className="text-gray-900 font-bold text-lg">{item.title}</div>
                <div className="text-gray-500 text-sm">{item.subtitle}</div>
              </div>
              <ChevronRight className="text-gray-400" size={24} />
            </motion.button>
          ))}

          {/* Logout Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            onClick={handleLogout}
            className="w-full bg-red-50 rounded-3xl p-5 shadow-sm flex items-center gap-4 hover:bg-red-100 transition-colors"
          >
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <LogOut className="text-red-500" size={24} />
            </div>
            <div className="flex-1 text-left">
              <div className="text-red-600 font-bold text-lg">Logout</div>
              <div className="text-red-400 text-sm">Sign out of your account</div>
            </div>
            <ChevronRight className="text-red-400" size={24} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
