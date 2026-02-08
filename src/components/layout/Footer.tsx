import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
    const { t, isRTL } = useLanguage();

    return (
        <footer className={styles.footer} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={styles.container}>
                <div className={styles.top}>
                    <div className={styles.brand}>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
                            <span className="text-xl font-bold">Paynest</span>
                        </div>
                        <p className={styles.brandDesc}>
                            {t('footerBrandDesc')}
                        </p>
                    </div>

                    <div className={styles.linksGroup}>
                        <div>
                            <h4 className={styles.colTitle}>{t('platform')}</h4>
                            <ul className={styles.linkList}>
                                <li>
                                    <Link to="/" className={styles.link}>
                                        {t('home')}
                                    </Link>
                                </li>
                                <li>
                                    <a href="/#how-it-works" className={styles.link}>
                                        {t('howItWorks')}
                                    </a>
                                </li>
                                <li>
                                    <a href="/#plans" className={styles.link}>
                                        {t('pricing')}
                                    </a>
                                </li>
                                <li>
                                    <Link to="/signin" className={styles.link}>
                                        {t('login')}
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className={styles.colTitle}>{t('company')}</h4>
                            <ul className={styles.linkList}>
                                <li>
                                    <a href="/#about" className={styles.link}>
                                        {t('aboutUs')}
                                    </a>
                                </li>
                                <li>
                                    <a href="mailto:careers@financeos.io" className={styles.link}>
                                        {t('careers')}
                                    </a>
                                </li>
                                <li>
                                    <a href="https://blog.financeos.io" target="_blank" rel="noopener noreferrer" className={styles.link}>
                                        {t('blog')}
                                    </a>
                                </li>
                                <li>
                                    <a href="mailto:support@financeos.io" className={styles.link}>
                                        {t('contact')}
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className={styles.colTitle}>{t('legal')}</h4>
                            <ul className={styles.linkList}>
                                <li>
                                    <Link to="/privacy-policy" className={styles.link}>
                                        {t('privacyPolicy')}
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms-of-service" className={styles.link}>
                                        {t('termsOfService')}
                                    </Link>
                                </li>
                                <li>
                                    <a href="/#security" className={styles.link}>
                                        {t('security')}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>© 2026 Paynest. {t('allRightsReserved')}</p>
                    <div className={styles.social}>
                        <a
                            href="https://twitter.com/financeos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialIcon}
                            aria-label="Twitter"
                        >
                            <Twitter size={20} />
                        </a>
                        <a
                            href="https://linkedin.com/company/financeos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialIcon}
                            aria-label="LinkedIn"
                        >
                            <Linkedin size={20} />
                        </a>
                        <a
                            href="https://facebook.com/financeos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialIcon}
                            aria-label="Facebook"
                        >
                            <Facebook size={20} />
                        </a>
                        <a
                            href="https://instagram.com/financeos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialIcon}
                            aria-label="Instagram"
                        >
                            <Instagram size={20} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
