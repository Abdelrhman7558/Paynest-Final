import React from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart2, Layers } from 'lucide-react';
import styles from './Features.module.css';

export const Features: React.FC = () => {
    const features = [
        {
            title: "Real-time Profit Tracking",
            desc: "Connect your store and see your true net profit instantly. We automatically deduct shipping, ad spend, and cost of goods sold.",
            icon: <Activity size={48} />,
            colorClass: styles.iconEmerald
        },
        {
            title: "Deep Cost Analysis",
            desc: "Stop guessing where your money goes. Categorize every transaction automatically and spot cost anomalies before they hurt your bottom line.",
            icon: <Layers size={48} />,
            colorClass: styles.iconBlue
        },
        {
            title: "Break-even Insights",
            desc: "Know exactly how many units you need to sell to cover costs. Our dynamic break-even calculator adjusts to your daily spend.",
            icon: <BarChart2 size={48} />,
            colorClass: styles.iconAmber
        }
    ];

    return (
        <section className={styles.section} id="how-it-works">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Complete Financial Clarity</h2>
                </div>

                <div className={styles.cardsWrapper}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.cardContainer} style={{ top: 120 + (index * 20) }}>
                            <motion.div
                                className={styles.card}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ margin: "-100px" }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className={styles.cardContent}>
                                    <div className={`${styles.iconBox} ${feature.colorClass}`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className={styles.cardTitle}>{feature.title}</h3>
                                    <p className={styles.cardDesc}>{feature.desc}</p>
                                </div>
                                <div className={styles.cardVisual}>
                                    <div className={styles.visualPlaceholder}>
                                        UI Preview: {feature.title}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
