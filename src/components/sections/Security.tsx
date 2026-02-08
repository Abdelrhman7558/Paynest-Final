import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Users, FileCheck } from 'lucide-react';
import styles from './Security.module.css';

export const Security: React.FC = () => {
    const features = [
        {
            icon: <Lock size={24} />,
            title: "Bank-Grade Encryption",
            desc: "256-bit SSL encryption ensures your financial data is always protected."
        },
        {
            icon: <ShieldCheck size={24} />,
            title: "Financial Accuracy",
            desc: "Automated checks reject duplicates and flag anomalies immediately."
        },
        {
            icon: <Users size={24} />,
            title: "Access Control",
            desc: "Granular permissions let you control exactly what your team can see."
        },
        {
            icon: <FileCheck size={24} />,
            title: "Full Audit Trail",
            desc: "Every action is logged. See who changed what and when."
        }
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Secure by Design</h2>
                    <p className={styles.subtitle}>
                        We treat your data with the same security standards as your bank.
                    </p>
                </div>

                <div className={styles.grid}>
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className={styles.card}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className={styles.iconWrapper}>
                                {feature.icon}
                            </div>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.cardDesc}>{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
