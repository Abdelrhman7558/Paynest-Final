import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, PieChart, Settings } from 'lucide-react';

import { useLanguage } from '../../context/LanguageContext';

export const BottomNav: React.FC = () => {
    const { t } = useLanguage();
    const navItems = [
        { icon: <LayoutDashboard size={24} />, label: t('dashboard'), path: '/dashboard' },
        { icon: <Receipt size={24} />, label: t('transactions'), path: '/transactions' },
        { icon: <PieChart size={24} />, label: t('analytics'), path: '/analytics' },
        { icon: <Settings size={24} />, label: t('settings'), path: '/settings' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[rgba(15,23,42,0.95)] backdrop-blur-md border-t border-slate-700 flex items-center justify-around z-50 md:hidden pb-safe">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `
                        flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors
                        ${isActive ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'}
                    `}
                >
                    {({ isActive }) => (
                        <>
                            <div className={`transition-transform duration-200 ${isActive ? '-translate-y-1' : ''}`}>
                                {item.icon}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                            {isActive && (
                                <div className="absolute top-0 w-8 h-1 bg-teal-400 rounded-b-full"></div>
                            )}
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    );
};
