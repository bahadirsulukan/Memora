import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Globe, MapPin, TrendingUp, Target } from 'lucide-react';
import { useVisits } from '../hooks/useVisits';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const COLORS = {
  teal: '#5EEAD4',
  coral: '#FB7185',
  mint: '#86EFAC',
  purple: '#A78BFA',
};

export function StatsScreen() {
  const { visits } = useVisits();

  const stats = useMemo(() => {
    const countries = new Set(visits.map(v => v.countryCode));
    const cities = new Set(visits.filter(v => v.cityName).map(v => v.cityName));
    const totalCountries = 195; // Total countries in the world
    const coverage = Math.round((countries.size / totalCountries) * 100);

    // Travel categories
    const categories = {
      Culture: 0,
      Adventure: 0,
      Relaxation: 0,
      Business: 0,
    };

    // Assign random categories for demo
    visits.forEach((v, i) => {
      const cat = ['Culture', 'Adventure', 'Relaxation', 'Business'][i % 4] as keyof typeof categories;
      categories[cat]++;
    });

    const categoryData = [
      { name: 'Culture', value: categories.Culture, color: COLORS.teal },
      { name: 'Adventure', value: categories.Adventure, color: COLORS.coral },
      { name: 'Relaxation', value: categories.Relaxation, color: COLORS.mint },
      { name: 'Business', value: categories.Business, color: COLORS.purple },
    ].filter(c => c.value > 0);

    // Monthly activity
    const monthlyData: { [key: string]: number } = {};
    visits.forEach(v => {
      if (v.startDate) {
        const date = new Date(v.startDate);
        const monthYear = date.toLocaleDateString('en-US', { month: 'short' });
        monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
      }
    });

    const activityData = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      count,
    }));

    return {
      countriesVisited: countries.size,
      citiesExplored: cities.size,
      coverage,
      categoryData,
      activityData,
      totalTrips: visits.length,
    };
  }, [visits]);

  return (
    <div className="h-screen overflow-y-auto bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-b-[40px] px-6 pt-12 pb-8 shadow-lg">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Statistics</h1>
          <p className="text-blue-100 text-lg">Your travel overview</p>
        </motion.div>
      </div>

      <div className="px-6 -mt-6 space-y-4">
        {/* Countries & Cities Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm"
          >
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
              <Globe className="text-blue-500" size={28} />
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2">{stats.countriesVisited}</div>
            <div className="text-gray-500 font-medium">Countries<br/>Visited</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 shadow-sm"
          >
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
              <MapPin className="text-purple-500" size={28} />
            </div>
            <div className="text-5xl font-bold text-gray-900 mb-2">{stats.citiesExplored}</div>
            <div className="text-gray-500 font-medium">Cities<br/>Explored</div>
          </motion.div>
        </div>

        {/* World Coverage Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-400 to-green-500 rounded-3xl p-6 shadow-sm"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-white text-xl font-semibold mb-2">World Coverage</div>
              <div className="text-white text-6xl font-bold">{stats.coverage}%</div>
            </div>
            <div className="w-16 h-16 bg-green-500/50 rounded-2xl flex items-center justify-center">
              <TrendingUp className="text-white" size={32} />
            </div>
          </div>
          <div className="w-full h-3 bg-white/30 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.coverage}%` }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-full bg-white rounded-full"
            />
          </div>
        </motion.div>

        {/* Travel Categories */}
        {stats.categoryData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-3xl p-6 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Travel Categories</h2>
            <div className="flex items-center gap-6">
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3">
                {stats.categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-gray-700 font-medium">{cat.name}</span>
                    </div>
                    <span className="text-gray-900 font-bold text-xl">{cat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Monthly Activity */}
        {stats.activityData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl p-6 shadow-sm"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Monthly Activity</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.activityData}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 14 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9CA3AF', fontSize: 14 }}
                  allowDecimals={false}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Travel Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-3xl p-6 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Travel Goals</h2>
          
          {/* Visit 10 Countries */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700 text-lg font-medium">Visit 10 Countries</span>
              <span className="text-gray-900 font-bold text-xl">{stats.countriesVisited}/10</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.countriesVisited / 10) * 100, 100)}%` }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full"
              />
            </div>
          </div>

          {/* Explore 50 Cities */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-700 text-lg font-medium">Explore 50 Cities</span>
              <span className="text-gray-900 font-bold text-xl">{stats.citiesExplored}/50</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((stats.citiesExplored / 50) * 100, 100)}%` }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
