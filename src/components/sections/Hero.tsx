import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import styles from './Hero.module.css';

export const Hero: React.FC = () => {
    const { t, isRTL } = useLanguage();

    // Calm transition settings
    const transition = { duration: 0.8, ease: "easeOut" as const };

    return (
        <section className={styles.hero} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={styles.background} />

            <div className={styles.container}>
                <motion.div
                    className={styles.content}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={transition}
                >
                    <h1 className={styles.title}>
                        {t('heroTitle')}
                        <span className="text-gradient block mt-2">{t('heroTitleHighlight')}</span>
                    </h1>

                    <p className={styles.subtitle}>
                        {t('heroSubtitle')}
                    </p>

                    <div className={styles.ctaGroup}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Link
                                to="/signup"
                                className="btn btn-primary shadow-lg hover:shadow-xl transition-shadow"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                            >
                                {t('startFree')}
                                <ArrowRight size={20} style={{ transform: isRTL ? 'rotate(180deg)' : 'none' }} />
                            </Link>
                        </motion.div>

                        <motion.a
                            href="/#how-it-works"
                            className="btn btn-outline"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <PlayCircle size={20} />
                            {t('seeHowItWorks')}
                        </motion.a>
                    </div>
                </motion.div>

                <div className={styles.visual}>
                    <motion.div
                        className={styles.card}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...transition, delay: 0.2 }}
                    >
                        <div className={styles.floatingBadge}>
                            {t('profitBadge')}
                        </div>

                        <div className={styles.cardMetric}>
                            <span className={styles.cardLabel}>{t('totalRevenue')}</span>
                            <span className={styles.cardValue}>EG 124,500.00</span>
                        </div>

                        <div className={styles.graph}>
                            <svg viewBox="0 0 400 200" className="w-full h-full absolute bottom-0 left-0" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor="#0f766e" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <motion.path
                                    d="M0,150 C100,150 150,100 200,100 C250,100 300,50 400,20 L400,200 L0,200 Z"
                                    fill="url(#gradient)"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 1.5, delay: 0.5 }}
                                />
                                <motion.path
                                    d="M0,150 C100,150 150,100 200,100 C250,100 300,50 400,20"
                                    fill="none"
                                    stroke="#0f766e"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }}
                                />
                            </svg>
                        </div>

                        <div className="flex gap-4 mt-6 border-t border-gray-100 pt-4">
                            <div>
                                <span className="text-xs text-slate-500 block">{t('netProfit')}</span>
                                <span className="font-bold text-emerald-600">EG 42,100</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 block">{t('expenses')}</span>
                                <span className="font-bold text-slate-700">EG 82,400</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
