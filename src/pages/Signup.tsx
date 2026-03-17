import React, { useState } from 'react';
import { CircleAlert, CircleCheck, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const Signup: React.FC = () => {
    const { } = useLanguage();
    const navigate = useNavigate();
    const { signUp } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        country: '',
        currency: 'USD',
        language: 'en'
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const countries = [
        { code: 'US', name: 'United States' },
        { code: 'EG', name: 'Egypt' },
        { code: 'SA', name: 'Saudi Arabia' },
        { code: 'AE', name: 'United Arab Emirates' },
        { code: 'GB', name: 'United Kingdom' },
        { code: 'CA', name: 'Canada' },
        { code: 'AU', name: 'Australia' },
    ];

    const currencies = [
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
        { code: 'SAR', symbol: 'SR', name: 'Saudi Riyal' },
        { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
    ];

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'ar', name: 'العربية' },
    ];

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all required fields');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }

        if (!acceptedTerms) {
            setError('Please accept the Terms & Conditions');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setIsLoading(true);
        console.log('🚀 Starting signup...');
        console.log('📧 Email:', formData.email);

        try {
            const { error: signUpError } = await signUp(formData.email, formData.password, {
                name: formData.name,
                phone: formData.phone,
                country: formData.country,
                currency: formData.currency,
                language: formData.language,
            });

            console.log('📬 Raw signup response error:', signUpError);
            console.log('📬 Error type:', typeof signUpError);
            console.log('📬 Error keys:', signUpError ? Object.keys(signUpError) : 'null');
            console.log('📬 Error.message:', signUpError?.message);
            console.log('📬 Error JSON:', JSON.stringify(signUpError, null, 2));

            if (signUpError) {
                // Get the error message
                let errorMessage = signUpError.message || '';

                console.log('🔍 Extracted message:', errorMessage);

                // Provide user-friendly messages for common errors
                if (errorMessage.toLowerCase().includes('rate limit')) {
                    errorMessage = 'Too many signup attempts. Please wait 10-15 minutes and try again with a different email.';
                } else if (errorMessage.toLowerCase().includes('already registered') || errorMessage.toLowerCase().includes('already been registered')) {
                    errorMessage = 'This email is already registered. Please login instead.';
                } else if (errorMessage.toLowerCase().includes('rls') || errorMessage.toLowerCase().includes('policy')) {
                    errorMessage = 'Account creation failed. Please contact support.';
                } else if (!errorMessage || errorMessage === '{}' || errorMessage.trim() === '') {
                    errorMessage = 'Signup failed. Please check the console for details or try a different email.';
                }

                console.error('❌ Final error message:', errorMessage);
                setError(errorMessage);
                setIsLoading(false);
                return;
            }

            console.log('✅ Signup successful!');
            setSuccess(true);
            setIsLoading(false);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            console.error('❌ Signup exception:', err);
            console.error('❌ Exception type:', typeof err);
            console.error('❌ Exception message:', err.message);
            setError(err.message || 'An unexpected error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        console.log('Google login clicked');
    };

    const handleMicrosoftLogin = () => {
        console.log('Microsoft login clicked');
    };

    if (success) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <CircleCheck className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-500 mx-auto mb-4 sm:mb-6" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Check Your Email!</h2>
                    <p className="text-slate-600 mb-4">
                        We've sent a verification link to <strong>{formData.email}</strong>
                    </p>
                    <p className="text-sm text-slate-500 mb-6">
                        Please verify your email before signing in. Redirecting to login...
                    </p>
                    <Link to="/login" className="text-[#0F766E] font-bold hover:underline">
                        Go to Login →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50">
            {/* Main Wide Card Container */}
            <div
                className="w-full max-w-[1100px] bg-white rounded-3xl shadow-2xl flex overflow-hidden relative"
                style={{
                    minHeight: '700px',
                    animation: 'fadeInScale 0.6s ease-out',
                    transformStyle: 'preserve-3d'
                }}
            >

                {/* LEFT PANEL - Brand Section */}
                <div className="hidden lg:flex lg:w-[40%] relative items-center justify-center p-12 text-white bg-gradient-to-br from-[#0B132B] via-[#0D4D47] to-[#0F766E]">
                    <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
                        <div style={{ marginBottom: '32px' }}>
                            <svg className="w-16 h-16 mx-auto" viewBox="0 0 200 200" fill="none">
                                <path d="M100 20C100 20 60 50 60 90C60 110 70 130 100 140C130 130 140 110 140 90C140 50 100 20 100 20Z" fill="white" opacity="0.9" />
                                <path d="M100 60C100 60 80 75 80 95C80 105 85 115 100 120C115 115 120 105 120 95C120 75 100 60 100 60Z" fill="white" opacity="0.6" />
                                <path d="M70 100C70 100 85 110 100 110C115 110 130 100 130 100L130 150C130 160 115 170 100 170C85 170 70 160 70 150L70 100Z" fill="white" opacity="0.8" />
                            </svg>
                        </div>

                        <h2 className="text-xl font-semibold mb-1 opacity-90">Join</h2>
                        <h1 className="text-4xl font-black tracking-tight" style={{ marginBottom: '24px' }}>Paynest</h1>

                        <div className="text-left max-w-xs" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                                <div>
                                    <h4 className="font-bold text-sm">Full Financial Control</h4>
                                    <p className="text-xs text-slate-300">Track every penny with advanced analytics.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 shrink-0"></div>
                                <div>
                                    <h4 className="font-bold text-sm">Automated Reports</h4>
                                    <p className="text-xs text-slate-300">Get monthly insights delivered to your inbox.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* WAVE SEPARATOR */}
                <div
                    className="absolute top-0 bottom-0 z-20 pointer-events-none hidden lg:block"
                    style={{
                        left: '36.56%',
                        width: '76px',
                        transform: 'translateX(-50%)'
                    }}
                >
                    <svg className="h-full w-full" viewBox="0 0 80 800" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: '#0F766E', stopOpacity: 0.4 }} />
                                <stop offset="50%" style={{ stopColor: '#0D4D47', stopOpacity: 0.3 }} />
                                <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                        <path d="M0,0 Q25,200 15,400 T0,800 L0,800 L0,0 Z" fill="url(#waveGradient)" opacity="0.4" />
                        <path d="M15,0 Q40,250 25,500 T15,800 L15,800 L15,0 Z" fill="url(#waveGradient)" opacity="0.6" />
                        <path d="M30,0 Q55,200 40,400 T30,800 L80,800 L80,0 Z" fill="white" />
                    </svg>
                </div>

                {/* RIGHT PANEL - Form Section */}
                <div className="flex-1 p-8 lg:pl-16 flex flex-col justify-center overflow-y-auto ">
                    <div className="max-w-[450px] w-full mx-auto left: 10% position: relative">

                        <h2 className="text-2xl font-bold text-slate-800 text-center" style={{ marginBottom: '24px' }}>Create your account</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <CircleAlert className="w-5 h-5 flex-shrink-0 sm:w-6 sm:h-6" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {/* Name Input */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-700" style={{ marginBottom: '6px' }}>Name *</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-transparent border-b-2 border-slate-300 focus:border-[#0F766E] transition-colors outline-none text-slate-900 placeholder:text-slate-400 text-sm"
                                    style={{ paddingTop: '10px', paddingBottom: '10px' }}
                                    required
                                />
                            </div>

                            {/* Email Input */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-700" style={{ marginBottom: '6px' }}>E-mail Address *</label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-transparent border-b-2 border-slate-300 focus:border-[#0F766E] transition-colors outline-none text-slate-900 placeholder:text-slate-400 text-sm"
                                    style={{ paddingTop: '10px', paddingBottom: '10px' }}
                                    required
                                />
                            </div>

                            {/* Phone Input */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-700" style={{ marginBottom: '6px' }}>Phone</label>
                                <input
                                    type="tel"
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-transparent border-b-2 border-slate-300 focus:border-[#0F766E] transition-colors outline-none text-slate-900 placeholder:text-slate-400 text-sm"
                                    style={{ paddingTop: '10px', paddingBottom: '10px' }}
                                />
                            </div>

                            {/* Country & Currency Row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative">
                                    <label className="block text-xs font-bold text-slate-700" style={{ marginBottom: '6px' }}>Country</label>
                                    <select
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="w-full bg-transparent border-b-2 border-slate-300 focus:border-[#0F766E] transition-colors outline-none text-slate-900 text-sm"
                                        style={{ paddingTop: '10px', paddingBottom: '10px' }}
                                    >
                                        <option value="">Select...</option>
                                        {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div className="relative">
                                    <label className="block text-xs font-bold text-slate-700" style={{ marginBottom: '6px' }}>Currency</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full bg-transparent border-b-2 border-slate-300 focus:border-[#0F766E] transition-colors outline-none text-slate-900 text-sm"
                                        style={{ paddingTop: '10px', paddingBottom: '10px' }}
                                    >
                                        {currencies.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Language */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-700" style={{ marginBottom: '6px' }}>Language</label>
                                <select
                                    value={formData.language}
                                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                    className="w-full bg-transparent border-b-2 border-slate-300 focus:border-[#0F766E] transition-colors outline-none text-slate-900 text-sm"
                                    style={{ paddingTop: '10px', paddingBottom: '10px' }}
                                >
                                    {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                                </select>
                            </div>

                            {/* Password Input */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-700" style={{ marginBottom: '6px' }}>Password *</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-transparent border-b-2 border-slate-300 focus:border-[#0F766E] transition-colors outline-none text-slate-900 placeholder:text-slate-400 text-sm"
                                    style={{ paddingTop: '10px', paddingBottom: '10px', paddingRight: '32px' }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute text-slate-400 hover:text-[#0F766E]"
                                    style={{ bottom: '10px', right: '0' }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Confirm Password Input */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-700" style={{ marginBottom: '6px' }}>Confirm Password *</label>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full bg-transparent border-b-2 border-slate-300 focus:border-[#0F766E] transition-colors outline-none text-slate-900 placeholder:text-slate-400 text-sm"
                                    style={{ paddingTop: '10px', paddingBottom: '10px', paddingRight: '32px' }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute text-slate-400 hover:text-[#0F766E]"
                                    style={{ bottom: '10px', right: '0' }}
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start text-xs" style={{ gap: '8px', paddingTop: '6px' }}>
                                <input
                                    type="checkbox"
                                    checked={acceptedTerms}
                                    onChange={() => setAcceptedTerms(!acceptedTerms)}
                                    className="w-4 h-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E] cursor-pointer"
                                    style={{ marginTop: '2px' }}
                                />
                                <span className="text-slate-600 leading-relaxed">
                                    By Signing Up, I Agree with <a href="#" className="font-bold text-[#0F766E] hover:underline">Terms & Conditions</a>
                                </span>
                            </div>

                            {/* Create Button */}
                            <div style={{ paddingTop: '10px' }}>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full rounded-full font-bold text-white bg-[#0F766E] hover:bg-[#0D655E] disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        paddingTop: '12px',
                                        paddingBottom: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(15, 118, 110, 0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="relative" style={{ marginTop: '16px', marginBottom: '16px' }}>
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-slate-400 font-medium">Or continue with</span></div>
                            </div>

                            {/* Social Login */}
                            <div className="flex justify-center" style={{ gap: '12px' }}>
                                <button type="button" onClick={handleGoogleLogin} className="w-10 h-10 rounded-full border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all flex items-center justify-center">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                </button>

                                <button type="button" onClick={handleMicrosoftLogin} className="w-10 h-10 rounded-full border-2 border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all flex items-center justify-center">
                                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                                        <path d="M11.4 11.4H2V2h9.4v9.4zm11.2 0h-9.4V2H22.6v9.4zM11.4 22.6H2v-9.4h9.4v9.4zm11.2 0h-9.4v-9.4H22.6v9.4z" fill="#00A4EF" />
                                    </svg>
                                </button>
                            </div>

                            {/* Login Link */}
                            <p className="text-center text-sm text-slate-600" style={{ paddingTop: '12px' }}>
                                Already have an account?{' '}
                                <Link to="/login" className="text-[#0F766E] font-bold hover:underline">
                                    Login
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
