import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ShoppingCart, Truck, FileSpreadsheet, Database } from 'lucide-react';
import styles from './Integrations.module.css';

export const Integrations: React.FC = () => {
    const integrations = [
        { name: 'Shopify', icon: <ShoppingBag size={20} />, color: '#96BF48' },
        { name: 'WooCommerce', icon: <ShoppingCart size={20} />, color: '#96588A' },
        { name: 'Google Sheets', icon: <FileSpreadsheet size={20} />, color: '#0F9D58' },
        { name: 'Excel / CSV', icon: <Database size={20} />, color: '#217346' },
        { name: 'Shipping Providers', icon: <Truck size={20} />, color: '#0F766E' }, // Paynest Brand Green
        // Duplicate for loop
        { name: 'Shopify', icon: <ShoppingBag size={20} />, color: '#96BF48' },
        { name: 'WooCommerce', icon: <ShoppingCart size={20} />, color: '#96588A' },
        { name: 'Google Sheets', icon: <FileSpreadsheet size={20} />, color: '#0F9D58' },
        { name: 'Excel / CSV', icon: <Database size={20} />, color: '#217346' },
        { name: 'Shipping Providers', icon: <Truck size={20} />, color: '#0F766E' },
        { name: 'Shopify', icon: <ShoppingBag size={20} />, color: '#96BF48' },
        { name: 'WooCommerce', icon: <ShoppingCart size={20} />, color: '#96588A' },
    ];

    return (
        <section className={styles.section}>
            <p className={styles.title}>Connects seamlessly with</p>

            <div className={styles.marqueeWrapper}>
                <motion.div
                    className={styles.marqueeTrack}
                    animate={{ x: [0, -1000] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 30,
                            ease: "linear",
                        },
                    }}
                >
                    {integrations.map((item, i) => (
                        <div
                            key={i}
                            className={styles.logoItem}
                            style={{ '--hover-color': item.color } as React.CSSProperties}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
