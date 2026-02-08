import React from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';

export const TopBar: React.FC = () => {
    const { } = useLanguage();
    return (
        <header className="h-20 bg-transparent mb-6 flex items-center justify-between">
            {/* Title & Subtitle */}
            <div>
                <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text)' }}>Dashboard</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Welcome back! Here's your brand overview</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
                    style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                    Switch Workspace
                    <ChevronDown size={16} />
                </button>

                <div className="h-8 w-[1px] mx-1" style={{ backgroundColor: 'var(--color-border)' }}></div>

                <button className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors shadow-sm"
                    style={{ backgroundColor: 'var(--color-primary)' }}>
                    <RefreshCw size={16} />
                    Sync Data
                </button>

                <div className="flex items-center gap-3 ml-4 pl-4" style={{ borderLeft: '1px solid var(--color-border)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: 'var(--color-border)' }}>
                        <img src="https://ui-avatars.com/api/?name=Admin+User&background=2DD4BF&color=0F172A" alt="User" />
                    </div>
                    <div className="hidden md:block text-right">
                        <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Admin User</div>
                        <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Finance Manager</div>
                    </div>
                    <ChevronDown size={16} style={{ color: 'var(--color-text-secondary)' }} />
                </div>
            </div>
        </header>
    );
};
