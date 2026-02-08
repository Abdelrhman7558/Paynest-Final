import React from 'react';
import { motion } from 'framer-motion';
import { Activity, CreditCard, Box, TrendingUp } from 'lucide-react';
import styles from './ProductOverview.module.css';
import { useLanguage } from '../../context/LanguageContext';

export const ProductOverview: React.FC = () => {
    const { t, isRTL } = useLanguage();

    const features = [
        {
            icon: <TrendingUp size={24} />,
            title: "Real-time Profit Tracking",
            description: "See your exact net profit in real-time, accounting for all costs and expenses automatically."
        },
        {
            icon: <CreditCard size={24} />,
            title: "Smart Cost Control",
            description: "Track every expense, subscription, and operational cost in one dashboard."
        },
        {
            icon: <Box size={24} />,
            title: "Inventory Visibility",
            description: "Know exactly what you have in stock, what's selling, and when to reorder."
        },
        {
            icon: <Activity size={24} />,
            title: "Ads Attribution",
            description: "Connect your ad platforms to see true ROAS and performance across all channels."
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <section className={styles.section} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <motion.h2
                        className={styles.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        Everything Your Business Needs to Control Money
                    </motion.h2>
                    <motion.p
                        className={styles.subtitle}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Paynest centralizes revenue, costs, ads, inventory, and cash flow into one source of financial truth.
                    </motion.p>
                </div>

                <motion.div
                    className={styles.grid}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className={styles.card}
                            variants={itemVariants}
                        >
                            <div className={styles.iconWrapper}>
                                {feature.icon}
                            </div>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.cardDescription}>{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
