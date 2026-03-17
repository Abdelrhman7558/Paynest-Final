import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
    const { t, isRTL } = useLanguage();
    const location = useLocation();

    // Helper to handle hash links on same page vs other pages
    const getLink = (path: string, hash: string) => {
        if (location.pathname === '/') {
            return hash;
        }
        return `${path}${hash}`;
    };

    return (
        <footer className={styles.footer} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={styles.container}>
                <div className={styles.top}>
                    <div className={styles.brand}>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">P</div>
                            <span className="text-xl font-bold">Paynest</span>
                        </div>
                        <p className={styles.brandDesc}>
                            The financial operating system for modern e-commerce.
                            Control profit, ads, and inventory in one place.
                        </p>
                    </div>

                    <div className={styles.linksGroup}>
                        <div>
                            <h4 className={styles.colTitle}>Product</h4>
                            <ul className={styles.linkList}>
                                <li>
                                    <Link to="/" className={styles.link}>Home</Link>
                                </li>
                                <li>
                                    <a href={getLink('/', '#how-it-works')} className={styles.link}>How It Works</a>
                                </li>
                                <li>
                                    <a href={getLink('/', '#features')} className={styles.link}>Features</a>
                                </li>
                                <li>
                                    <a href={getLink('/', '#plans')} className={styles.link}>Pricing</a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className={styles.colTitle}>Company</h4>
                            <ul className={styles.linkList}>
                                <li>
                                    <a href={getLink('/', '#about')} className={styles.link}>About Us</a>
                                </li>
                                <li>
                                    <a href="mailto:contact@paynest.io" className={styles.link}>Contact</a>
                                </li>
                                <li>
                                    <a href="#" className={styles.link}>Careers</a>
                                </li>
                                <li>
                                    <a href="#" className={styles.link}>Blog</a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className={styles.colTitle}>Resources</h4>
                            <ul className={styles.linkList}>
                                <li>
                                    <Link to="/help-center" className={styles.link}>Help Center</Link>
                                </li>
                                <li>
                                    <Link to="/support" className={styles.link}>Support</Link>
                                </li>
                                <li>
                                    <a href="#" className={styles.link}>Community</a>
                                </li>
                                <li>
                                    <a href={getLink('/', '#security')} className={styles.link}>Security</a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className={styles.colTitle}>Legal</h4>
                            <ul className={styles.linkList}>
                                <li>
                                    <Link to="/privacy-policy" className={styles.link}>{t('privacyPolicy')}</Link>
                                </li>
                                <li>
                                    <Link to="/terms-of-service" className={styles.link}>{t('termsOfService')}</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>© 2026 Paynest. {t('allRightsReserved')}</p>
                    <div className={styles.social}>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Twitter">
                            <Twitter size={20} />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
                            <Linkedin size={20} />
                        </a>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Facebook">
                            <Facebook size={20} />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
                            <Instagram size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
