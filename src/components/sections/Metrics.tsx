import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import styles from './Metrics.module.css';

const Counter = ({ value, duration = 2 }: { value: number, duration?: number }) => {
    const [count, setCount] = useState(0);
    const [ref, inView] = useInView({ triggerOnce: true });

    useEffect(() => {
        if (inView) {
            let start = 0;
            const end = value;

            // Simple linear interpolation
            const timer = setInterval(() => {
                start += end / (duration * 60); // 60fps
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(start);
                }
            }, 1000 / 60);

            return () => clearInterval(timer);
        }
    }, [inView, value, duration]);

    return <span ref={ref}>{new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(count)}</span>;
};

export const Metrics: React.FC = () => {
    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <motion.div
                    className={styles.window}
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className={styles.windowHeader}>
                        <div className={`${styles.dot} ${styles.dotRed}`} />
                        <div className={`${styles.dot} ${styles.dotYellow}`} />
                        <div className={`${styles.dot} ${styles.dotGreen}`} />
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.metricItem}>
                            <div className={styles.iconWrapper}><DollarSign size={24} /></div>
                            <div className={styles.value}>
                                $<Counter value={120500} />
                            </div>
                            <div className={styles.label}>Total Revenue</div>
                        </div>

                        <div className={styles.metricItem}>
                            <div className={styles.iconWrapper}><Users size={24} /></div>
                            <div className={styles.value}>
                                <Counter value={1250} />+
                            </div>
                            <div className={styles.label}>Active Clients</div>
                        </div>

                        <div className={styles.metricItem}>
                            <div className={styles.iconWrapper}><TrendingUp size={24} /></div>
                            <div className={styles.value}>
                                <Counter value={24} />%
                            </div>
                            <div className={styles.label}>Net Profit Growth</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
