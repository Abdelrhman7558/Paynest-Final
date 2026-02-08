import React from 'react';
import styles from './StatCard.module.css';

interface StatCardProps {
    label: string;
    value: React.ReactNode;
    trend?: string; // Text description
    trendColor?: 'success' | 'warning' | 'danger' | 'neutral';
    icon: React.ReactNode;
    tooltip?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, trend, trendColor = 'neutral', icon, tooltip }) => {
    return (
        <div className={styles.card} title={tooltip}>
            <div className={styles.iconContainer}>
                {icon}
            </div>

            <div className={styles.content}>
                <span className={styles.label}>{label}</span>
                <div className={styles.value}>{value}</div>

                {trend && (
                    <div className={`${styles.trend} ${styles[trendColor]}`}>
                        {trend}
                    </div>
                )}
            </div>
        </div>
    );
};
