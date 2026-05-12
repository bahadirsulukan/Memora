import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { MapPin } from 'lucide-react';

export default function LoginScreen() {
  const { login, user, loading: authLoading, signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  // Navigate when user is logged in
  useEffect(() => {
    if (user && !authLoading) {
      console.log('🎯 User already logged in, navigating to /map');
      navigate('/map', { replace: true });
    }
  }, [user, authLoading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      // Navigation will happen automatically via useEffect
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    try {
      setDemoLoading(true);
      
      // Try to login with demo account first
      const demoEmail = 'demo@routes.app';
      const demoPassword = 'demo123456';
      
      try {
        await login(demoEmail, demoPassword);
        console.log('✅ Demo user logged in');
      } catch (loginError) {
        // If login fails, create demo account
        console.log('📝 Creating demo account...');
        await signup(demoEmail, demoPassword, 'Demo User');
        console.log('✅ Demo user created and logged in');
      }
      
      // Navigation will happen automatically via useEffect
    } catch (error) {
      console.error('❌ Demo login failed:', error);
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ROUTES</h1>
          <p className="text-gray-600 mt-2">Track your travel memories</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition mt-6"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          {/* Signup Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          {/* Divider */}
          <div className="relative mt-6 mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-medium">OR</span>
            </div>
          </div>

          {/* Demo Login */}
          <div className="mt-4">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <MapPin size={20} />
              {demoLoading ? 'Starting demo...' : '🚀 Try Demo Mode'}
            </button>
            <p className="text-center text-xs text-gray-500 mt-2">
              No signup required • Explore instantly
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          By continuing, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}