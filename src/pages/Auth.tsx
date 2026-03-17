import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { AuthInput, SocialButton } from '../components/auth/AuthComponents';
import { CheckCircle2 } from 'lucide-react';

export const Auth: React.FC = () => {
    const { dir } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialMode = (searchParams.get('mode') as 'login' | 'signup') || 'login';
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const toggleMode = () => {
        const newMode = mode === 'login' ? 'signup' : 'login';
        setMode(newMode);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#f0f4f8] to-[#e6eef5] relative overflow-hidden p-4">

            {/* Abstract Background Shapes */}
            <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#0F766E]/10 blur-[120px]" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#0B132B]/10 blur-[120px]" />
            <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[35%] h-[35%] rounded-full bg-teal-500/10 blur-[100px]" />

            {/* Center Card */}
            <div className="w-full max-w-[480px] bg-white rounded-3xl shadow-xl border border-white/30 p-10 sm:p-12 backdrop-blur-xl relative z-10 animate-in fade-in zoom-in-95">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-[#0F766E] to-[#0B132B] text-white shadow-lg mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        {mode === 'login' ? 'Welcome back' : 'Create an account'}
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {mode === 'login' ? 'Enter your details to sign in.' : 'Start your financial journey today.'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <AuthInput
                        label="Email address"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        dir={dir}
                    />
                    <AuthInput
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        showPasswordToggle
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                        dir={dir}
                    />

                    {/* Remember Me & Forgot */}
                    {mode === 'login' && (
                        <div className="flex items-center justify-between text-sm text-slate-600">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${rememberMe ? 'bg-[#0F766E] border-[#0F766E]' : 'border-slate-300 bg-white group-hover:border-[#0F766E]'}`}>
                                    {rememberMe && <CheckCircle2 size={12} className="text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                                Remember me
                            </label>
                            <a href="#" className="font-semibold text-[#0F766E] hover:text-[#0B132B]">Forgot password?</a>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white font-bold shadow-lg shadow-teal-900/20 hover:shadow-xl transition-all duration-200"
                    >
                        {isLoading ? 'Processing...' : mode === 'login' ? 'Sign in' : 'Create account'}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/50 backdrop-blur px-3 text-slate-400 font-medium">Or continue with</span></div>
                    </div>

                    {/* Social Buttons */}
                    <div className="flex gap-4 mb-4">
                        <SocialButton label="Google" icon={<svg className="w-5 h-5" viewBox="0 0 24 24">...</svg>} />
                        <SocialButton label="Microsoft" icon={<svg className="w-5 h-5" viewBox="0 0 24 24">...</svg>} />
                    </div>

                    {/* Toggle Mode */}
                    <p className="text-center text-sm text-slate-500">
                        {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                        <button type="button" onClick={toggleMode} className="text-[#0F766E] hover:text-[#0B132B] font-bold">
                            {mode === 'login' ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};
