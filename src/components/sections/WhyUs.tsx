import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap, Users, TrendingUp, LayoutDashboard, Target } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import styles from './WhyUs.module.css';

interface ComparisonItem {
    feature: string;
    us: string;
    them: string;
    icon: React.ReactNode;
}

export const WhyUs: React.FC = () => {
    const { t, isRTL } = useLanguage();

    const comparisons: ComparisonItem[] = [
        {
            feature: 'sync',
            us: t('realTimeSync'),
            them: t('manualUploads'),
            icon: <Zap size={24} />,
        },
        {
            feature: 'categorization',
            us: t('autoCategorizationFeature'),
            them: t('spreadsheetsManual'),
            icon: <Target size={24} />,
        },
        {
            feature: 'reports',
            us: t('investorReadyReports'),
            them: t('rawDataExports'),
            icon: <TrendingUp size={24} />,
        },
        {
            feature: 'dashboard',
            us: t('oneDashboard'),
            them: t('multipleTools'),
            icon: <LayoutDashboard size={24} />,
        },
        {
            feature: 'audience',
            us: t('builtForFounders'),
            them: t('builtForAccountants'),
            icon: <Users size={24} />,
        },
    ];

    return (
        <section className={styles.section} id="why-us" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={styles.container}>
                <motion.div
                    className={styles.header}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className={styles.title}>{t('whyUsTitle')}</h2>
                    <p className={styles.subtitle}>{t('whyUsSubtitle')}</p>
                </motion.div>

                <motion.div
                    className={styles.comparisonTable}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {/* Table Header */}
                    <div className={styles.tableHeader}>
                        <div className={styles.featureCol}></div>
                        <div className={styles.usCol}>
                            <div className={styles.colHeader}>
                                <div className={styles.brandBadge}>
                                    <span className={styles.brandIcon}>F</span>
                                    Paynest
                                </div>
                            </div>
                        </div>
                        <div className={styles.themCol}>
                            <div className={styles.colHeader}>
                                {t('traditionalTools')}
                            </div>
                        </div>
                    </div>

                    {/* Comparison Rows */}
                    {comparisons.map((item, index) => (
                        <motion.div
                            key={item.feature}
                            className={styles.row}
                            initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.1 * index }}
                        >
                            <div className={styles.featureCol}>
                                <span className={styles.featureIcon}>{item.icon}</span>
                            </div>
                            <div className={styles.usCol}>
                                <div className={styles.usCell}>
                                    <Check className={styles.checkIcon} size={20} />
                                    <span>{item.us}</span>
                                </div>
                            </div>
                            <div className={styles.themCol}>
                                <div className={styles.themCell}>
                                    <X className={styles.xIcon} size={20} />
                                    <span>{item.them}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Trust Badge */}
                <motion.div
                    className={styles.trustBadge}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    <span className={styles.trustText}>
                        🚀 Trusted by 500+ founders across MENA
                    </span>
                </motion.div>
            </div>
        </section>
    );
};
