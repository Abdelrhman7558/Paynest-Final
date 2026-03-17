import React from 'react';
import { motion } from 'framer-motion';
import styles from './About.module.css';

export const About: React.FC = () => {
    const cards = [
        {
            title: "What is Paynest?",
            text: "A centralized financial management platform that aggregates data from multiple sources to transform raw numbers into immediate, actionable metrics."
        },
        {
            title: "Who is it for?",
            text: "E-commerce founders, operators, and finance managers who need clarity on their actual profit, cash flow, and inventory value in real-time."
        },
        {
            title: "Why it exists?",
            text: "Because 'I think I'm profitable' isn't good enough. We eliminate phantom profits and analysis paralysis by providing a single source of financial truth."
        }
    ];

    return (
        <section className={styles.section} id="about">
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2 className={styles.title}>The Operating System for Your Finances</h2>
                    <p className={styles.lead}>
                        Stop relying on fragmented spreadsheets and delayed reports.
                        Paynest gives you the clarity you need to scale with confidence.
                    </p>
                </div>

                <div className={styles.cardGrid}>
                    {cards.map((card, index) => (
                        <motion.div
                            key={index}
                            className={styles.card}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <h3 className={styles.cardTitle}>{card.title}</h3>
                            <p className={styles.cardText}>{card.text}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
