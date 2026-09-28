import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await register(
        email,
        password,
        firstName,
        lastName
      );

      navigate('/dashboard');
    } catch (err) {
      let message =
        'Unable to create your account. Please try again.';

      if (err.code === 'auth/email-already-in-use') {
        message =
          'An account already exists with this email.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Please choose a stronger password.';
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-white flex overflow-hidden">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">

        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-200px] left-[-100px] w-[500px] h-[500px] bg-purple-950/30 rounded-full blur-[100px]" />

        <div className="relative z-10 p-12 xl:p-16 flex flex-col justify-between w-full">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 backdrop-blur flex items-center justify-center">
              <span className="font-black text-lg">N</span>
            </div>

            <span className="text-xl font-bold">
              NexusFlow
            </span>
          </div>

          {/* Content */}
          <div className="max-w-md">

            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center mb-7">
              <ShieldCheck size={28} />
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              Build your workspace.
              <span className="block text-blue-200">
                Get things done.
              </span>
            </h1>

            <p className="mt-6 text-blue-100/80 leading-relaxed">
              Bring projects, people, customers and
              business insights together in one powerful
              workspace.
            </p>

            {/* Checklist */}
            <div className="mt-8 space-y-4">

              <Benefit text="Organize projects and tasks" />

              <Benefit text="Collaborate with your team" />

              <Benefit text="Monitor business performance" />

              <Benefit text="Scale your workspace securely" />

            </div>
          </div>

          <p className="text-sm text-blue-200/60">
            Start building better workflows today.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[55%] flex items-center justify-center px-6 py-10 bg-[#0B101C]">

        <div className="w-full max-w-lg">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">

            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="font-black text-lg">
                N
              </span>
            </div>

            <span className="text-xl font-bold">
              NexusFlow
            </span>

          </div>

          {/* Heading */}
          <div className="mb-8">

            <h2 className="text-3xl font-bold tracking-tight">
              Create your account
            </h2>

            <p className="mt-2 text-gray-400">
              Set up your workspace in less than a minute.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <Input
                icon={<User size={18} />}
                label="First name"
                placeholder="Paul"
                value={firstName}
                onChange={setFirstName}
              />

              <Input
                icon={<User size={18} />}
                label="Last name"
                placeholder="Watson"
                value={lastName}
                onChange={setLastName}
              />

            </div>

            {/* Email */}
            <Input
              icon={<Mail size={18} />}
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={setEmail}
            />

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  autoComplete="new-password"
                  placeholder="Create a password"
                  className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-12 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm password
              </label>

              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-12 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>
            </div>

            {/* Password info */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Check size={14} className="text-emerald-400" />
              Minimum 6 characters
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 transition hover:scale-[1.01] hover:shadow-blue-500/20 disabled:opacity-60 disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={17} />
                </>
              )}
            </button>

          </form>

          {/* Login */}
          <p className="text-center text-sm text-gray-400 mt-7">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-blue-400 hover:text-blue-300 transition"
            >
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-gray-600 mt-7">
            Your account is protected by Firebase
            Authentication.
          </p>

        </div>
      </div>
    </div>
  );
}

function Input({
  icon,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>

      <div className="relative">

        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          {icon}
        </div>

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          placeholder={placeholder}
          className="w-full h-12 rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-blue-500/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-blue-500/10"
        />

      </div>
    </div>
  );
}

function Benefit({ text }) {
  return (
    <div className="flex items-center gap-3">

      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
        <Check size={14} />
      </div>

      <span className="text-sm text-blue-100/80">
        {text}
      </span>

    </div>
  );
}