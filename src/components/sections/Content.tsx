import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, Minus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Content.module.css';

export const Plans: React.FC = () => {
    const [isYearly, setIsYearly] = useState(false);

    const plans = [
        {
            name: "Starter",
            desc: "For solo founders and small shops.",
            price: isYearly ? 29 : 39,
            features: ["2 Bank Accounts Connected", "1,000 Transactions/mo", "Basic P&L Reports", "1 User Seat", "Email Support"]
        },
        {
            name: "Pro",
            desc: "For growing e-commerce brands.",
            price: isYearly ? 79 : 99,
            popular: true,
            features: ["Unlimited Accounts", "Unlimited Transactions", "Advanced Analytics & ROAS", "Inventory Management", "3 User Seats", "Priority Support"]
        },
        {
            name: "Business",
            desc: "For scaling agencies and teams.",
            price: isYearly ? 199 : 249,
            features: ["Multi-Entity Support", "Custom API Access", "Dedicated Account Manager", "Unlimited Users", "Audit Logs", "White-label Reports"]
        }
    ];

    return (
        <section className={styles.plansSection} id="plans">
            <div className={styles.header}>
                <h2 className={styles.title}>Transparent Pricing, No Hidden Fees</h2>
                <p className={styles.subtitle}>Start free for 14 days. Cancel anytime.</p>

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
                            animate={{ left: isYearly ? '24px' : '4px' }}
                            layout
                        />
                    </div>
                    <span
                        className={`${styles.toggleLabel} ${isYearly ? styles.active : ''}`}
                        onClick={() => setIsYearly(true)}
                    >
                        Yearly <span className={styles.saveBadge}>Save 20%</span>
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
                        <p className={styles.planDesc}>{plan.desc}</p>

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

                        <Link
                            to={`/signup?plan=${plan.name.toLowerCase()}`}
                            className={`btn ${plan.popular ? 'btn-primary' : 'btn-outline'} ${styles.fullWidthBtn}`}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            Choose {plan.name}
                            <ArrowRight size={18} />
                        </Link>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            q: "What exactly does Paynest do?",
            a: "Paynest connects to your bank accounts, ad platforms (Meta, Google), and e-commerce stores (Shopify, WooCommerce) to give you a single, real-time dashboard of your true net profit. No more manual spreadsheets."
        },
        {
            q: "How is profit calculated?",
            a: "We take your total revenue (from orders) and automatically deduct COGS (Cost of Goods Sold), shipping fees, ad spend, and other expenses to show your actual net profit."
        },
        {
            q: "Can I upload Excel or CSV files?",
            a: "Yes! If you have data in spreadsheets or offline sources, you can drag and drop them into Paynest. Our AI will clean and categorize the data significantly faster than manual entry."
        },
        {
            q: "What is the Finance Agent?",
            a: "Our Finance Agent is an AI-powered assistant that monitors your data 24/7. It alerts you to anomalies (like a spike in ad costs or a duplicate charge) and explains your financial reports in plain English."
        },
        {
            q: "Is my financial data secure?",
            a: "Absolutely. We use bank-grade 256-bit encryption for all data. We are read-only for connected accounts, meaning we cannot move money, only read transactions."
        },
        {
            q: "Can I manage multiple businesses?",
            a: "Yes, our Business plan specifically supports multi-entity management, allowing you to switch between different brands or companies with a single login."
        },
        {
            q: "What happens after I choose a plan?",
            a: "You'll be taken to a secure checkout page. Once subscribed, you'll get immediate access to the dashboard where you can start connecting your data sources."
        },
        {
            q: "Can I cancel anytime?",
            a: "Yes, there are no long-term contracts. You can cancel your subscription at any time from the account settings."
        }
    ];

    return (
        <section className={styles.faqSection} id="faq">
            <div className={styles.faqContainer}>
                <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
                <div className={styles.list}>
                    {faqs.map((faq, i) => (
                        <div key={i} className={styles.accordionItem}>
                            <button
                                className={styles.accordionTrigger}
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            >
                                {faq.q}
                                {openIndex === i ? <Minus size={20} className="text-emerald-500" /> : <Plus size={20} />}
                            </button>
                            <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
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
