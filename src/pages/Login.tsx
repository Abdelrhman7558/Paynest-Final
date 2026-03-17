import React, { useState } from 'react';
import { Eye, EyeOff, CircleAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
    // Language context available for future RTL support
    useLanguage();
    const navigate = useNavigate();
    const { signIn } = useAuth();

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { error: signInError } = await signIn(formData.email, formData.password);

            if (signInError) {
                setError(signInError.message || 'Invalid email or password');
                setIsLoading(false);
                return;
            }

            // Successful login - navigate to dashboard
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        console.log('Google login clicked');
    };

    const handleMicrosoftLogin = () => {
        console.log('Microsoft login clicked');
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gray-50">
            {/* Main Wide Card Container - Optimized Height with 3D Animation */}
            <div
                className="w-full max-w-[950px] bg-white rounded-3xl shadow-2xl flex overflow-hidden relative"
                style={{
                    height: '635px',
                    animation: 'fadeInScale 0.6s ease-out',
                    transformStyle: 'preserve-3d'
                }}
            >

                {/* LEFT PANEL - Brand Section */}
                <div className="hidden lg:flex lg:w-[45%] relative items-center justify-center p-12 text-white bg-gradient-to-br from-[#0F766E] via-[#0D4D47] to-[#0B132B]">
                    <div className="relative z-10 text-center flex flex-col items-center justify-center h-full">
                        {/* Logo - Centered and Smaller */}
                        <div style={{ marginBottom: '32px' }}>
                            <svg className="w-16 h-16 mx-auto" viewBox="0 0 200 200" fill="none">
                                <path d="M100 20C100 20 60 50 60 90C60 110 70 130 100 140C130 130 140 110 140 90C140 50 100 20 100 20Z" fill="white" opacity="0.9" />
                                <path d="M100 60C100 60 80 75 80 95C80 105 85 115 100 120C115 115 120 105 120 95C120 75 100 60 100 60Z" fill="white" opacity="0.6" />
                                <path d="M70 100C70 100 85 110 100 110C115 110 130 100 130 100L130 150C130 160 115 170 100 170C85 170 70 160 70 150L70 100Z" fill="white" opacity="0.8" />
                            </svg>
                        </div>

                        <h2 className="text-xl font-semibold mb-1 opacity-90">Welcome to</h2>
                        <h1 className="text-4xl font-black tracking-tight" style={{ marginBottom: '24px' }}>Paynest</h1>

                        <p className="text-sm opacity-75 leading-relaxed max-w-xs mx-auto">
                            Your complete financial operating system for business growth and stability.
                        </p>
                    </div>
                </div>

                {/* WAVE SEPARATOR with Gradient */}
                <div
                    className="absolute top-0 bottom-0 z-20 pointer-events-none hidden lg:block"
                    style={{
                        left: '41%',
                        width: '76px',
                        transform: 'translateX(-50%)'
                    }}
                >
                    <svg className="h-full w-full" viewBox="0 0 80 800" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="waveGradientLogin" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: '#0F766E', stopOpacity: 0.4 }} />
                                <stop offset="50%" style={{ stopColor: '#0D4D47', stopOpacity: 0.3 }} />
                                <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                        <path d="M0,0 Q25,200 15,400 T0,800 L0,800 L0,0 Z" fill="url(#waveGradientLogin)" opacity="0.4" />
                        <path d="M15,0 Q40,250 25,500 T15,800 L15,800 L15,0 Z" fill="url(#waveGradientLogin)" opacity="0.6" />
                        <path d="M30,0 Q55,200 40,400 T30,800 L80,800 L80,0 Z" fill="white" />
                    </svg>
                </div>

                {/* RIGHT PANEL - Form Section - Centered */}
                <div className="flex-1 p-12 lg:pl-20 flex flex-col justify-center">
                    <div className="max-w-[400px] w-full mx-auto">

                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center" style={{ marginBottom: '24px' }}>
                            <svg className="w-12 h-12" viewBox="0 0 200 200" fill="none">
                                <path d="M100 20C100 20 60 50 60 90C60 110 70 130 100 140C130 130 140 110 140 90C140 50 100 20 100 20Z" fill="#0F766E" opacity="0.9" />
                                <path d="M100 60C100 60 80 75 80 95C80 105 85 115 100 120C115 115 120 105 120 95C120 75 100 60 100 60Z" fill="#0F766E" opacity="0.6" />
                                <path d="M70 100C70 100 85 110 100 110C115 110 130 100 130 100L130 150C130 160 115 170 100 170C85 170 70 160 70 150L70 100Z" fill="#0F766E" opacity="0.8" />
                            </svg>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 text-center" style={{ marginBottom: '28px' }}>Welcome Back</h2>

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                <CircleAlert className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {/* Email Input */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-700" style={{ marginBottom: '8px' }}>E-mail Address</label>
                                <input
                                    type="email"
                                    placeholder="Enter your mail"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-transparent border-b-2 border-slate-300 focus:border-[#0F766E] transition-colors outline-none text-slate-900 placeholder:text-slate-400 text-sm"
                                    style={{
                                        paddingTop: '12px',
                                        paddingBottom: '12px',
                                        transition: 'all 0.3s ease'
                                    }}
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div className="relative">
                                <label className="block text-xs font-bold text-slate-700" style={{ marginBottom: '8px' }}>Password</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-transparent border-b-2 border-slate-300 focus:border-[#0F766E] transition-colors outline-none text-slate-900 placeholder:text-slate-400 text-sm"
                                    style={{
                                        paddingTop: '12px',
                                        paddingBottom: '12px',
                                        paddingRight: '32px',
                                        transition: 'all 0.3s ease'
                                    }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute text-slate-400 hover:text-[#0F766E]"
                                    style={{ bottom: '12px', right: '0' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between text-xs" style={{ paddingTop: '8px' }}>
                                <label className="flex items-center cursor-pointer" style={{ gap: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                        className="w-4 h-4 rounded border-slate-300 text-[#0F766E] focus:ring-[#0F766E] cursor-pointer"
                                    />
                                    <span className="text-slate-600 font-medium">Remember me</span>
                                </label>
                                <Link to="/forgot-password" className="text-[#0F766E] font-bold hover:underline">
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Single Wide Login Button with 3D Effect */}
                            <div style={{ paddingTop: '12px' }}>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full rounded-full font-bold text-white bg-[#0F766E] hover:bg-[#0D655E] disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        paddingTop: '14px',
                                        paddingBottom: '14px',
                                        boxShadow: '0 10px 15px -3px rgba(15, 118, 110, 0.3)',
                                        transition: 'all 0.3s ease',
                                        transform: 'translateY(0)',
                                        transformStyle: 'preserve-3d'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isLoading) {
                                            e.currentTarget.style.transform = 'translateY(-4px)';
                                            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(15, 118, 110, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(15, 118, 110, 0.3)';
                                    }}
                                    onMouseDown={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    {isLoading ? 'Signing in...' : 'Login'}
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="relative" style={{ marginTop: '20px', marginBottom: '20px' }}>
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-3 text-slate-400 font-medium">Or continue with</span></div>
                            </div>

                            {/* Social Login Circles with 3D Hover */}
                            <div className="flex justify-center" style={{ gap: '16px' }}>
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="w-12 h-12 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center"
                                    title="Sign in with Google"
                                    style={{
                                        transition: 'all 0.3s ease',
                                        transform: 'translateY(0) scale(1)',
                                        transformStyle: 'preserve-3d'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.1)';
                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                    }}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                </button>

                                <button
                                    type="button"
                                    onClick={handleMicrosoftLogin}
                                    className="w-12 h-12 rounded-full border-2 border-slate-200 bg-white flex items-center justify-center"
                                    title="Sign in with Microsoft"
                                    style={{
                                        transition: 'all 0.3s ease',
                                        transform: 'translateY(0) scale(1)',
                                        transformStyle: 'preserve-3d'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px) scale(1.1)';
                                        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                                        e.currentTarget.style.borderColor = '#cbd5e1';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                    }}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M11.4 11.4H2V2h9.4v9.4zm11.2 0h-9.4V2H22.6v9.4zM11.4 22.6H2v-9.4h9.4v9.4zm11.2 0h-9.4v-9.4H22.6v9.4z" fill="#00A4EF" />
                                    </svg>
                                </button>
                            </div>

                            {/* Don't have account - Signup Link */}
                            <p className="text-center text-sm text-slate-600" style={{ paddingTop: '16px' }}>
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-[#0F766E] font-bold hover:underline">
                                    Sign up
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
