import React from 'react';
import { motion } from 'framer-motion';
import { Users, Briefcase, TrendingUp, Globe, XCircle, CheckCircle } from 'lucide-react';
import styles from './TargetAudience.module.css';
import { useLanguage } from '../../context/LanguageContext';

export const TargetAudience: React.FC = () => {
    const { isRTL } = useLanguage();

    const personas = [
        {
            icon: <Users size={24} />,
            role: "E-commerce Founders",
            title: "Scale without Chaos",
            pain: "Lost in spreadsheets and multiple dashboards.",
            solution: "One source of truth for profit & cash flow."
        },
        {
            icon: <Briefcase size={24} />,
            role: "Finance Managers",
            title: "Automate Reconciliation",
            pain: "Hours spent matching orders to payments.",
            solution: "Auto-reconciled ledgers in minutes."
        },
        {
            icon: <TrendingUp size={24} />,
            role: "Growth Teams",
            title: "Spend with Confidence",
            pain: "Guessing which ads actually drive profit.",
            solution: "Real-time ROAS based on net profit."
        },
        {
            icon: <Globe size={24} />,
            role: "Agencies & Aggregators",
            title: "Manage Portfolio",
            pain: "Switching between client accounts is slow.",
            solution: "Unified view for all your brands."
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
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut" as any
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
                        Built for Modern Commerce
                    </motion.h2>
                    <motion.p
                        className={styles.subtitle}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Whether you're a solo founder or a finance team, Paynest adapts to your workflow.
                    </motion.p>
                </div>

                <motion.div
                    className={styles.grid}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {personas.map((persona, index) => (
                        <motion.div
                            key={index}
                            className={styles.card}
                            variants={itemVariants}
                        >
                            <div className={styles.icon}>
                                {persona.icon}
                            </div>

                            <div className={styles.cardHeader}>
                                <span className={styles.role}>{persona.role}</span>
                                <h3 className={styles.cardTitle}>{persona.title}</h3>
                            </div>

                            <div>
                                <div className={styles.pain}>
                                    <XCircle size={16} className="flex-shrink-0 mt-1" />
                                    <span>{persona.pain}</span>
                                </div>
                                <div className={styles.solution}>
                                    <CheckCircle size={16} className="flex-shrink-0 mt-1" />
                                    <span>{persona.solution}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
