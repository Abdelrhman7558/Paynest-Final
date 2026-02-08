import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Minus } from 'lucide-react';
import styles from './Content.module.css';

export const Plans: React.FC = () => {
    const [isYearly, setIsYearly] = useState(false);

    const plans = [
        {
            name: "Starter",
            price: isYearly ? 29 : 39,
            features: ["2 Bank Accounts", "1,000 Transactions/mo", "Basic Reports", "1 User"]
        },
        {
            name: "Pro",
            price: isYearly ? 79 : 99,
            popular: true,
            features: ["Unlimited Accounts", "Unlimited Transactions", "Advanced Analytics", "3 Users", "Inventory Management"]
        },
        {
            name: "Business",
            price: isYearly ? 199 : 249,
            features: ["API Access", "Dedicated Support", "Custom Reports", "Unlimited Users", "Multi-Entity"]
        }
    ];

    return (
        <section className={styles.plansSection} id="plans">
            <div className="container">
                <div className={styles.header}>
                    <h2 className={styles.title}>Simple, Transparent Pricing</h2>
                    <div className={styles.toggleWrapper}>
                        <span
                            className={`${styles.toggleLabel} ${!isYearly ? styles.active : ''}`}
                            onClick={() => setIsYearly(false)}
                        >
                            Monthly
                        </span>
                        <div
                            className={styles.toggleSwitch}
                            onClick={() => setIsYearly(!isYearly)}
                        >
                            <motion.div
                                className={styles.toggleThumb}
                                animate={{ left: isYearly ? '28px' : '4px' }}
                            />
                        </div>
                        <span
                            className={`${styles.toggleLabel} ${isYearly ? styles.active : ''}`}
                            onClick={() => setIsYearly(true)}
                        >
                            Yearly <span className={styles.saveBadge}>(Save 20%)</span>
                        </span>
                    </div>
                </div>

                <div className={styles.grid}>
                    {plans.map((plan, i) => (
                        <motion.div
                            key={i}
                            className={`${styles.card} ${plan.popular ? styles.cardPopular : ''}`}
                            whileHover={{ y: -8 }}
                        >
                            {plan.popular && <div className={styles.badge}>Most Popular</div>}
                            <h3 className={styles.planName}>{plan.name}</h3>
                            <div className={styles.price}>
                                ${plan.price}<span className={styles.period}>/mo</span>
                            </div>
                            <ul className={styles.featuresList}>
                                {plan.features.map((feat, j) => (
                                    <li key={j} className={styles.featureItem}>
                                        <Check size={18} className={styles.checkIcon} />
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                            <button className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} ${styles.fullWidthBtn}`}>
                                Choose {plan.name}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        { q: "Do you integrate with local Egyptian banks?", a: "Yes, we support CIB, QNB, and NBE statements import, and are working on direct APIs as regulations permit." },
        { q: "Is my data secure?", a: "Absolutely. We use bank-grade 256-bit encryption and never sell your data. We are GDPR compliant." },
        { q: "Can I use this for multiple companies?", a: "Yes, the Business plan supports multi-entity management under one login." }
    ];

    return (
        <section className={styles.faqSection} id="faq">
            <div className="container">
                <h2 className={`${styles.title} ${styles.faqTitle}`}>Frequently Asked Questions</h2>
                <div className={styles.faqContainer}>
                    {faqs.map((faq, i) => (
                        <div key={i} className={styles.accordionItem}>
                            <button
                                className={styles.accordionTrigger}
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            >
                                {faq.q}
                                {openIndex === i ? <Minus size={20} /> : <Plus size={20} />}
                            </button>
                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className={styles.accordionContent}
                                    >
                                        <p className={styles.answerText}>{faq.a}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
