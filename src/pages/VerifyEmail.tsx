import React, { useState, useEffect } from 'react';
import { Mail, ArrowRight, CircleCheck, TriangleAlert, RotateCcw } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const VerifyEmail: React.FC = () => {
    const { dir } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'pending' | 'success' | 'expired'>('pending');
    const [resendCooldown, setResendCooldown] = useState(0);

    // Simulate flow based on URL query param for demo purposes
    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setStatus('success');
        }
    }, [searchParams]);

    // Cooldown timer logic
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleResend = () => {
        if (resendCooldown > 0) return;
        setResendCooldown(60);
        // Simulate API call
        console.log("Resending verification email...");
    };

    const renderPending = () => (
        <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full mx-auto flex items-center justify-center mb-6 shadow-sm">
                <Mail size={40} strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Verify your email</h1>
            <p className="text-sm max-w-md mx-auto mb-8 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                We’ve sent a verification link to your email address.<br />
                Please confirm your email to activate your account and secure your financial data.
            </p>

            <div className="flex flex-col items-center gap-4">
                <button
                    onClick={handleResend}
                    disabled={resendCooldown > 0}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${resendCooldown > 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-white border text-slate-700 hover:bg-slate-50 shadow-sm'
                        }`}
                    style={{ borderColor: 'var(--color-border)' }}
                >
                    <RotateCcw size={16} className={resendCooldown > 0 ? 'animate-spin-slow' : ''} />
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend verification email'}
                </button>

                <p className="text-xs text-slate-400">
                    Didn’t receive it? Check your spam folder.
                </p>

                <button
                    onClick={() => navigate('/auth')}
                    className="mt-4 text-xs font-medium text-teal-600 hover:underline"
                >
                    Change email address
                </button>
            </div>
        </div>
    );

    const renderSuccess = () => (
        <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-6 shadow-green-200 shadow-xl">
                <CircleCheck size={40} strokeWidth={3} />
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Email verified successfully 🎉</h1>
            <p className="text-sm max-w-md mx-auto mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                Your account is now secure and ready to use.
            </p>
            <button
                onClick={() => navigate('/dashboard')}
                className="px-8 py-3 rounded-xl font-bold text-white shadow-lg hover:-translate-y-1 transition-all flex items-center gap-2 mx-auto"
                style={{ backgroundColor: 'var(--color-primary)' }}
            >
                Continue to Dashboard
                <ArrowRight size={18} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </button>
        </div>
    );

    const renderExpired = () => (
        <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full mx-auto flex items-center justify-center mb-6 shadow-sm">
                <TriangleAlert size={40} strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Verification link expired</h1>
            <p className="text-sm max-w-md mx-auto mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                For security reasons, verification links expire after 24 hours.
            </p>
            <button
                onClick={handleResend}
                className="px-6 py-2.5 rounded-xl font-medium text-white shadow-md hover:opacity-90 transition-all flex items-center gap-2 mx-auto"
                style={{ backgroundColor: 'var(--color-primary)' }}
            >
                Request new link
            </button>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50" style={{ backgroundColor: 'var(--color-bg)' }}>
            <div className="max-w-md w-full glass rounded-3xl p-8 shadow-xl border" style={{ borderColor: 'var(--color-border)' }}>
                {status === 'pending' && renderPending()}
                {status === 'success' && renderSuccess()}
                {status === 'expired' && renderExpired()}

                <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'var(--color-border)' }}>
                    <p className="text-[10px] text-slate-400">
                        Secure email verification powered by Supabase Auth.
                    </p>
                </div>
            </div>
        </div>
    );
};
