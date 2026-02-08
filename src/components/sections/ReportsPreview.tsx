import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import styles from './ReportsPreview.module.css';

export const ReportsPreview: React.FC = () => {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <motion.div
                    className={styles.content}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <span className={styles.label}>Finance Agent</span>
                    <h2 className={styles.title}>Investor-Ready Reports, Automatically</h2>
                    <p className={styles.description}>
                        Stop spending days at the end of the month manually stitching data.
                        Paynest generates GAAP-compliant financial statements instantly.
                    </p>

                    <div className={styles.featureList}>
                        <div className={styles.featureItem}>
                            <div className={styles.checkWrapper}>
                                <Check size={14} strokeWidth={3} />
                            </div>
                            <div className={styles.featureContent}>
                                <h3 className={styles.featureTitle}>Traceable Data</h3>
                                <p className={styles.featureText}>Click any number in a report to drill down to the exact transactions that formed it.</p>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.checkWrapper}>
                                <Check size={14} strokeWidth={3} />
                            </div>
                            <div className={styles.featureContent}>
                                <h3 className={styles.featureTitle}>Smart Context</h3>
                                <p className={styles.featureText}>Our Finance Agent adds context to anomalies, explaining why costs went up or margins dipped.</p>
                            </div>
                        </div>

                        <div className={styles.featureItem}>
                            <div className={styles.checkWrapper}>
                                <Check size={14} strokeWidth={3} />
                            </div>
                            <div className={styles.featureContent}>
                                <h3 className={styles.featureTitle}>Export & Share</h3>
                                <p className={styles.featureText}>Download as PDF, Excel, or share a live link with your investors or partners.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className={styles.visual}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className={styles.visualContent}>
                        <div className={styles.uiHeader}>
                            <span className={styles.uiTitle}>Profit & Loss Statement</span>
                            <span className="text-sm text-gray-400">Oct 2024</span>
                        </div>
                        <div className={styles.uiGraph}>
                            {/* Decorative Graph Line */}
                            <svg viewBox="0 0 400 200" className="w-full h-full absolute bottom-0">
                                <path d="M0,150 C100,120 200,180 400,50" fill="none" stroke="#059669" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className={styles.uiStats}>
                            <div className={styles.statItem}>
                                <div className={styles.statLabel}>Net Profit</div>
                                <div className={styles.statValue}>$42,500</div>
                            </div>
                            <div className={styles.statItem}>
                                <div className={styles.statLabel}>Margin</div>
                                <div className={styles.statValue}>24.5%</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
