import React from 'react';
import { motion } from 'framer-motion';
import { Box, BarChart2, Receipt, FileText, Upload, Users } from 'lucide-react';
import styles from './Features.module.css';

export const Features: React.FC = () => {
    const features = [
        {
            title: "Inventory Intelligence",
            desc: "Track stock levels, value, and turnover in real-time. Know exactly when to reorder and what's dead stock.",
            icon: <Box size={28} />,
            theme: styles.themeBlue
        },
        {
            title: "Ads Performance",
            desc: "Connect Meta, TikTok, and Snapchat ads. See your true ROAS calculated against real net profit.",
            icon: <BarChart2 size={28} />,
            theme: styles.themePurple
        },
        {
            title: "Costs & AP",
            desc: "Manage subscriptions, one-off expenses, and supplier payments. Never miss a due date again.",
            icon: <Receipt size={28} />,
            theme: styles.themeRose
        },
        {
            title: "Reports & Insights",
            desc: "Automated P&L, balance sheets, and cash flow statements ready for investors or partners.",
            icon: <FileText size={28} />,
            theme: styles.themeEmerald
        },
        {
            title: "Smart Uploads & AI",
            desc: "Drag and drop any Excel or CSV. Our AI cleans, maps, and categorizes your data instantly.",
            icon: <Upload size={28} />,
            theme: styles.themeAmber
        },
        {
            title: "Multi-user Access",
            desc: "Give your accountant, partners, or team members specific access with granular permissions.",
            icon: <Users size={28} />,
            theme: styles.themeCyan
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
                ease: "easeOut" as any // Type assertion to fix build error
            }
        }
    };

    return (
        <section className={styles.section} id="features">
            <div className={styles.container}>
                <div className={styles.header}>
                    <motion.h2
                        className={styles.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        Everything You Need to Scale
                    </motion.h2>
                    <motion.p
                        className={styles.subtitle}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        A complete financial operating system designed for modern e-commerce and digital businesses.
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
                            <div className={`${styles.iconBox} ${feature.theme}`}>
                                {feature.icon}
                            </div>
                            <h3 className={styles.cardTitle}>{feature.title}</h3>
                            <p className={styles.cardDesc}>{feature.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
