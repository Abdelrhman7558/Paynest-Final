import React from 'react';
import { motion } from 'framer-motion';
import { Database, Wand2, PieChart, CheckCircle } from 'lucide-react';
import styles from './HowItWorks.module.css';
import { useLanguage } from '../../context/LanguageContext';

export const HowItWorks: React.FC = () => {
    const { t, isRTL } = useLanguage();

    const steps = [
        {
            icon: <Database size={20} />,
            title: "Connect Your Data",
            description: "Securely connect your ad accounts, bank feeds, and inventory platforms, or simply upload your sheets."
        },
        {
            icon: <Wand2 size={20} />,
            title: "Paynest Cleans It",
            description: "We standardize and structure your messy data into a unified financial format automatically."
        },
        {
            icon: <PieChart size={20} />,
            title: "AI Analyzes",
            description: "Our Finance Agent categorizes transactions and identifies trends, anomalies, and opportunities."
        },
        {
            icon: <CheckCircle size={20} />,
            title: "Real Profit",
            description: "You get a crystal-clear dashboard of your net profit, ROI, and cash flow in real-time."
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <section id="how-it-works" className={styles.section} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className={styles.container}>
                <motion.h2
                    className={styles.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    How Paynest Works
                </motion.h2>

                <motion.div
                    className={styles.steps}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            className={styles.step}
                            variants={itemVariants}
                        >
                            <div className={styles.connector} />
                            <div className={styles.number}>
                                {index + 1}
                            </div>
                            <div className={styles.content}>
                                <h3 className={styles.stepTitle}>
                                    {step.icon}
                                    {step.title}
                                </h3>
                                <p className={styles.stepDescription}>
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
