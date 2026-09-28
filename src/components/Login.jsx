import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Loader2,
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      let message = 'Unable to sign in. Please check your credentials.';

      if (err.code === 'auth/invalid-credential') {
        message = 'Incorrect email or password.';
      } else if (err.code === 'auth/user-not-found') {
        message = 'No account exists with this email.';
      } else if (err.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many attempts. Please try again later.';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-white flex overflow-hidden">
      
      {/* LEFT BRAND PANEL */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />

        <div className="relative z-10 w-full flex flex-col justify-between p-12 xl:p-16">
          
          {/* Logo */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="font-black text-lg">N</span>
              </div>

              <span className="text-xl font-bold tracking-tight">
                NexusFlow
              </span>
            </div>
          </div>

          {/* Main content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-gray-300 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Your workspace, unified
            </div>

            <h1 className="text-5xl xl:text-6xl font-bold leading-[1.05] tracking-tight">
              Everything your team needs.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                In one place.
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-400 leading-relaxed max-w-lg">
              Manage projects, collaborate with your team, track performance,
              and grow your business from a single intelligent workspace.
            </p>

            {/* Features */}
            <div className="mt-10 grid grid-cols-2 gap-5">
              <Feature
                icon={<Zap size={17} />}
                title="Work faster"
                text="Streamline everyday workflows."
              />

              <Feature
                icon={<BarChart3 size={17} />}
                title="Track growth"
                text="Turn data into useful insights."
              />

              <Feature
                icon={<ShieldCheck size={17} />}
                title="Stay secure"
                text="Role-based access and protection."
              />

              <Feature
                icon={<ArrowRight size={17} />}
                title="Scale easily"
                text="Built for growing teams."
              />
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-gray-600">
            © 2026 NexusFlow. Built for modern teams.
          </p>
        </div>
      </div>

      {/* RIGHT LOGIN PANEL */}
      <div className="w-full lg:w-[48%] flex items-center justify-center px-6 py-10 bg-[#0B101C]">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="font-black text-lg">N</span>
            </div>
            <span className="text-xl font-bold">NexusFlow</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">
              Welcome back
            </h2>

            <p className="mt-2 text-gray-400">
              Sign in to continue to your workspace.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-12 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500"
              />

              <span className="text-sm text-gray-400">
                Keep me signed in
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 transition hover:scale-[1.01] hover:shadow-blue-500/20 disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-gray-600">
              SECURE ACCESS
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Signup */}
          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-blue-400 hover:text-blue-300 transition"
            >
              Create one
            </Link>
          </p>

          <p className="text-center text-xs text-gray-600 mt-8">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="flex gap-3">
      <div className="w-9 h-9 shrink-0 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-blue-400">
        {icon}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-200">
          {title}
        </h3>

        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          {text}
        </p>
      </div>
    </div>
  );
}