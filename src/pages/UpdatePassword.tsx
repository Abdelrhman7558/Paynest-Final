import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, CircleCheck, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const UpdatePassword: React.FC = () => {
    const { dir } = useLanguage();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        const newErrors: Record<string, string> = {};
        const hasNumber = /\d/.test(formData.password);

        if (!formData.password) {
            newErrors.password = 'Please enter a new password.';
        } else if (formData.password.length < 8 || !hasNumber) {
            newErrors.password = 'Password must be at least 8 characters and include a number.';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
        }, 1500);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="max-w-md w-full glass rounded-2xl p-8 shadow-xl text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-6">
                        <CircleCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                        Password updated successfully
                    </h2>
                    <p className="text-sm mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                        Your password has been changed. You can now log in with your new password.
                    </p>
                    <button
                        onClick={() => navigate('/auth?mode=login')}
                        className="btn btn-primary w-full justify-center"
                    >
                        Go to login
                        <ArrowRight size={18} className={dir === 'rtl' ? 'rotate-180' : ''} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg)' }}>

            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
                style={{ backgroundColor: 'var(--color-primary)' }}></div>

            <div className="max-w-[440px] w-full glass rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-500 relative z-10">

                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                        Set a new password
                    </h1>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Create a strong password to secure your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                            New password
                        </label>
                        <div className="relative">
                            <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${dir === 'rtl' ? 'right-3' : 'left-3'}`}>
                                <Lock size={18} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                className={`w-full py-2.5 rounded-xl border focus:ring-2 focus:ring-teal-500/20 transition-all outline-none ${dir === 'rtl' ? 'pr-10 pl-10' : 'pl-10 pr-10'}`}
                                style={{
                                    backgroundColor: 'var(--color-card)',
                                    borderColor: errors.password ? 'var(--color-danger)' : 'var(--color-border)',
                                    color: 'var(--color-text)'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 ${dir === 'rtl' ? 'left-3' : 'right-3'}`}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                        {!errors.password && (
                            <p className="text-xs mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                Minimum 8 characters, including a number.
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                            Confirm new password
                        </label>
                        <div className="relative">
                            <div className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${dir === 'rtl' ? 'right-3' : 'left-3'}`}>
                                <Lock size={18} />
                            </div>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                                className={`w-full py-2.5 rounded-xl border focus:ring-2 focus:ring-teal-500/20 transition-all outline-none ${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                                style={{
                                    backgroundColor: 'var(--color-card)',
                                    borderColor: errors.confirmPassword ? 'var(--color-danger)' : 'var(--color-border)',
                                    color: 'var(--color-text)'
                                }}
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-teal-500/25 ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'
                            }`}
                        style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                        {isLoading ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Update password'
                        )}
                    </button>
                </form>

                {/* Trust Footer */}
                <div className="mt-8 pt-6 border-t flex flex-col items-center gap-2 text-center"
                    style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        <ShieldCheck size={14} />
                        Encrypted authentication
                    </div>
                </div>
            </div>
        </div>
    );
};
