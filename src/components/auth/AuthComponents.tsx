import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    dir?: 'ltr' | 'rtl';
    showPasswordToggle?: boolean;
    onTogglePassword?: () => void;
    showPassword?: boolean;
    icon?: React.ReactNode;
}

export const AuthInput: React.FC<InputProps> = ({
    label,
    error,
    dir = 'ltr',
    showPasswordToggle,
    onTogglePassword,
    showPassword,
    icon,
    ...props
}) => {
    return (
        <div className="w-full mb-5">
            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">
                {label}
            </label>
            <div className="relative group">
                <input
                    {...props}
                    type={showPasswordToggle ? (showPassword ? "text" : "password") : props.type}
                    className={`w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#0F766E] focus:ring-4 focus:ring-[#0F766E]/5 transition-all outline-none duration-300 font-medium ${dir === 'rtl' ? 'text-right' : 'text-left'
                        } ${showPasswordToggle ? 'pr-12' : ''}`}
                />

                {showPasswordToggle && (
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-all ${dir === 'rtl' ? 'left-2' : 'right-2'}`}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && <p className="text-xs text-red-500 mt-1.5 ml-1 font-medium animate-in slide-in-from-top-1">{error}</p>}
        </div>
    );
};

export const SocialButton: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
    <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-medium hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-[0.98]">
        {icon}
        <span className="text-sm">{label}</span>
    </button>
);
