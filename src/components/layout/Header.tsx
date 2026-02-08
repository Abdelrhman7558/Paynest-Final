import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Header.module.css';

export const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { t, toggleLanguage, isRTL } = useLanguage();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { label: t('home'), href: '/' },
        { label: t('aboutUs'), href: '/#about' },
        { label: t('howItWorks'), href: '/#how-it-works' },
        { label: t('pricing'), href: '/#plans' },
    ];

    return (
        <header
            className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            <div className={styles.container}>
                {/* Logo */}
                <Link to="/" className={styles.logo}>
                    <div className={styles.logoIcon}>F</div>
                    <span className={styles.logoText}>Paynest</span>
                </Link>

                {/* Desktop Menu */}
                <nav className={styles.nav}>
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className={styles.navLink}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                {/* Actions */}
                <div className={styles.actions}>
                    <button
                        className={styles.langBtn}
                        onClick={toggleLanguage}
                        aria-label="Toggle language"
                    >
                        <Globe size={16} />
                        {t('changeLanguage')}
                    </button>
                    <Link to="/signin" className="btn btn-outline">
                        {t('login')}
                    </Link>
                    <Link
                        to="/signup"
                        className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                        {t('startFree')}
                        <ArrowRight
                            className={styles.hoverArrow}
                            size={16}
                            style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }}
                        />
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className={styles.mobileToggle}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle mobile menu"
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className={styles.mobileMenu}>
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className={styles.navLink}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {item.label}
                        </a>
                    ))}

                    {/* Language Toggle - Mobile */}
                    <button
                        className={styles.langBtn}
                        onClick={() => {
                            toggleLanguage();
                            setIsMobileMenuOpen(false);
                        }}
                        style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                    >
                        <Globe size={16} />
                        {t('changeLanguage')}
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                        <Link
                            to="/signin"
                            className="btn btn-outline"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {t('login')}
                        </Link>
                        <Link
                            to="/signup"
                            className="btn btn-primary"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {t('startFree')}
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};
