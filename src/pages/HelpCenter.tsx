import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HelpCircle, BookOpen, Upload, FileText, CreditCard, Shield,
    ChevronDown, ChevronUp, ArrowRight, Mail
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import styles from './HelpCenter.module.css';
import { Link } from 'react-router-dom';

export const HelpCenter: React.FC = () => {
    const [openItem, setOpenItem] = useState<string | null>(null);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const toggleAccordion = (id: string) => {
        setOpenItem(openItem === id ? null : id);
    };

    const AccordionItem = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
        <div className={styles.accordionItem}>
            <button className={styles.accordionTrigger} onClick={() => toggleAccordion(id)}>
                {title}
                {openItem === id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            <AnimatePresence>
                {openItem === id && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className={styles.accordionContent}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <div className={styles.page}>
            <Header />

            <main>
                {/* Hero */}
                <section className={styles.hero}>
                    <div className={styles.container}>
                        <h1 className={styles.title}>Help Center</h1>
                        <p className={styles.subtitle}>Everything you need to understand Paynest before you start</p>
                        <p className={styles.helperText}>Learn how Paynest works, what problems it solves, and how to get the most value from it.</p>
                    </div>
                </section>

                {/* Quick Categories */}
                <section className={styles.section}>
                    <div className={styles.container}>
                        <div className={styles.grid}>
                            <div className={styles.card} onClick={() => scrollToSection('getting-started')}>
                                <div className={styles.iconWrapper}><BookOpen size={24} /></div>
                                <h3 className={styles.cardTitle}>Getting Started</h3>
                                <p className={styles.cardDesc}>Basics of setting up your account and how Paynest works.</p>
                            </div>
                            <div className={styles.card} onClick={() => scrollToSection('uploading')}>
                                <div className={styles.iconWrapper}><Upload size={24} /></div>
                                <h3 className={styles.cardTitle}>Uploading Data</h3>
                                <p className={styles.cardDesc}>How to connect banks and upload your spreadsheets.</p>
                            </div>
                            <div className={styles.card} onClick={() => scrollToSection('reports')}>
                                <div className={styles.iconWrapper}><FileText size={24} /></div>
                                <h3 className={styles.cardTitle}>Reports & Insights</h3>
                                <p className={styles.cardDesc}>Understanding P&L, drill-down metrics, and exports.</p>
                            </div>
                            <div className={styles.card} onClick={() => scrollToSection('pricing')}>
                                <div className={styles.iconWrapper}><CreditCard size={24} /></div>
                                <h3 className={styles.cardTitle}>Billing & Plans</h3>
                                <p className={styles.cardDesc}>Pricing, invoices, upgrades, and trial questions.</p>
                            </div>
                            <div className={styles.card} onClick={() => scrollToSection('security')}>
                                <div className={styles.iconWrapper}><Shield size={24} /></div>
                                <h3 className={styles.cardTitle}>Security & Privacy</h3>
                                <p className={styles.cardDesc}>How we protect and encrypt your financial data.</p>
                            </div>
                            <div className={styles.card} onClick={() => scrollToSection('faq')}>
                                <div className={styles.iconWrapper}><HelpCircle size={24} /></div>
                                <h3 className={styles.cardTitle}>FAQ</h3>
                                <p className={styles.cardDesc}>Common questions about Paynest features.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Getting Started */}
                <section className={styles.section} style={{ background: 'white' }} id="getting-started">
                    <div className={styles.container}>
                        <h2 className={styles.sectionTitle}>Getting Started with Paynest</h2>
                        <div className={styles.accordion}>
                            <AccordionItem id="gs1" title="What is Paynest?">
                                <p>Paynest is a financial operating system designed for modern e-commerce and digital businesses. It centralizes your revenue, costs, ads, inventory, and cash flow into a single source of truth, giving you real-time visibility into your net profit.</p>
                            </AccordionItem>
                            <AccordionItem id="gs2" title="Who is Paynest for?">
                                <p>Paynest is built for Founders, Finance Managers, and Growth Teams who need clarity on their numbers. Whether you run a Shopify store, a digital agency, or a multi-brand portfolio, Paynest adapts to your workflow.</p>
                            </AccordionItem>
                            <AccordionItem id="gs3" title="How does Paynest calculate profit?">
                                <p>We take your total revenue from connected sales channels and automatically deduct all expenses: Cost of Goods Sold (COGS), shipping fees, ad spend from Meta/Google, and operational costs. This gives you a true Net Profit figure, not just Gross Revenue.</p>
                            </AccordionItem>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className={styles.section}>
                    <div className={styles.container}>
                        <h2 className={styles.sectionTitle}>How Paynest Works</h2>
                        <div className={styles.stepsContainer}>
                            {[
                                { title: "Data Input", desc: "You securely connect your bank accounts, ad platforms, and sales channels—or simply drag and drop your Excel/CSV files." },
                                { title: "Data Structuring", desc: "Paynest cleans, validates, and standardizes your messy data into a unified financial format automatically." },
                                { title: "AI Categorization", desc: "Our Antigravity AI classifies every transaction into revenue, costs, inventory, or ads with high accuracy." },
                                { title: "Financial Intelligence", desc: "The system generates investor-ready P&L statements, cash flow reports, and unit economics analysis." },
                                { title: "Decision Support", desc: "You get a dashboard showing exactly which products are profitable, which ads are working, and where you can cut costs." }
                            ].map((step, i) => (
                                <div key={i} className={styles.stepItem}>
                                    <div className={styles.stepNumber}>{i + 1}</div>
                                    <div className={styles.stepContent}>
                                        <h3>{step.title}</h3>
                                        <p>{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Uploading & Data Sources */}
                <section className={styles.section} style={{ background: 'white' }} id="uploading">
                    <div className={styles.container}>
                        <h2 className={styles.sectionTitle}>Uploading & Connecting Your Data</h2>
                        <div className={styles.grid}>
                            <div className={styles.card} style={{ pointerEvents: 'none' }}>
                                <div className={styles.iconWrapper}><Upload size={24} /></div>
                                <h3 className={styles.cardTitle}>Supported File Types</h3>
                                <p className={styles.cardDesc}>We support <strong>.CSV, .XLSX, and .XLS</strong> files. You can also connect Google Sheets directly for live updates.</p>
                            </div>
                            <div className={styles.card} style={{ pointerEvents: 'none' }}>
                                <div className={styles.iconWrapper}><BookOpen size={24} /></div>
                                <h3 className={styles.cardTitle}>Data Categories</h3>
                                <ul className={styles.cardDesc} style={{ listStyle: 'disc', paddingLeft: '20px' }}>
                                    <li><strong>Orders:</strong> Your sales data (Shopify, WooCommerce, Manual).</li>
                                    <li><strong>Inventory:</strong> Stock levels and product costs.</li>
                                    <li><strong>Ads:</strong> Spend from Facebook, Google, TikTok, Snapchat.</li>
                                </ul>
                            </div>
                            <div className={styles.card} style={{ pointerEvents: 'none' }}>
                                <div className={styles.iconWrapper}><Shield size={24} /></div>
                                <h3 className={styles.cardTitle}>Data Handling</h3>
                                <p className={styles.cardDesc}>Our AI automatically cleans and reformats your data. If something is missing, the system will flag it for review before processing.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Reports & Insights */}
                <section className={styles.section} id="reports">
                    <div className={styles.container}>
                        <h2 className={styles.sectionTitle}>Reports & Financial Insights</h2>
                        <div className={styles.stepsContainer}>
                            <div className={styles.stepItem}>
                                <div className={styles.stepNumber} style={{ background: '#10b981' }}>1</div>
                                <div className={styles.stepContent}>
                                    <h3>Automated P&L Generation</h3>
                                    <p>Paynest generates a Profit & Loss statement instantly. Revenue, COGS, Shipping, and Ad Spend are calculated to show your true Net Profit.</p>
                                </div>
                            </div>
                            <div className={styles.stepItem}>
                                <div className={styles.stepNumber} style={{ background: '#10b981' }}>2</div>
                                <div className={styles.stepContent}>
                                    <h3>Drill-Down Logic</h3>
                                    <p>Click on any number in your report to see exactly where it came from. Trace a "Cost" back to the specific invoice or transaction line item.</p>
                                </div>
                            </div>
                            <div className={styles.stepItem}>
                                <div className={styles.stepNumber} style={{ background: '#10b981' }}>3</div>
                                <div className={styles.stepContent}>
                                    <h3>Investor-Ready Exports</h3>
                                    <p>Download clean, professional PDF or Excel reports that are ready to share with investors, partners, or your tax accountant.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Plans & Pricing Help */}
                <section className={styles.section} style={{ background: 'white' }} id="pricing">
                    <div className={styles.container}>
                        <h2 className={styles.sectionTitle}>Plans, Pricing & Billing</h2>
                        <div className={styles.accordion}>
                            <AccordionItem id="bill1" title="What's included in each plan?">
                                <p><strong>Starter:</strong> Perfect for small shops. Includes 2 bank connections, 1,000 transactions, and basic reports.<br />
                                    <strong>Pro:</strong> For growing brands. Unlimited accounts/transactions, inventory management, and advanced analytics.<br />
                                    <strong>Business:</strong> For agencies/teams. Multi-entity support, API access, and dedicated account manager.</p>
                            </AccordionItem>
                            <AccordionItem id="bill2" title="How does the 14-day trial work?">
                                <p>You get full access to the Pro plan features for 14 days. No credit card is required to start. You only pay if you choose to continue after the trial.</p>
                            </AccordionItem>
                            <AccordionItem id="bill3" title="Can I upgrade or downgrade anytime?">
                                <p>Yes. You can switch plans instantly from your Settings dashboard. Prorated adjustments will be applied to your next billing cycle.</p>
                            </AccordionItem>
                        </div>
                    </div>
                </section>

                {/* Security */}
                <section className={styles.section} id="security">
                    <div className={styles.container}>
                        <h2 className={styles.sectionTitle}>Security & Data Trust</h2>
                        <div className={styles.grid}>
                            <div className={styles.card} style={{ pointerEvents: 'none' }}>
                                <div className={styles.iconWrapper}><Shield size={24} /></div>
                                <h3 className={styles.cardTitle}>Bank-Grade Encryption</h3>
                                <p className={styles.cardDesc}>We use 256-bit SSL encryption to ensure your data is unreadable to unauthorized parties.</p>
                            </div>
                            <div className={styles.card} style={{ pointerEvents: 'none' }}>
                                <div className={styles.iconWrapper}><Upload size={24} /></div>
                                <h3 className={styles.cardTitle}>Read-Only Access</h3>
                                <p className={styles.cardDesc}>Paynest only ever reads your financial data. We cannot initiate transactions or move money.</p>
                            </div>
                            <div className={styles.card} style={{ pointerEvents: 'none' }}>
                                <div className={styles.iconWrapper}><FileText size={24} /></div>
                                <h3 className={styles.cardTitle}>Audit Trails</h3>
                                <p className={styles.cardDesc}>Every action within the platform is logged, giving you a complete history of changes.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Expanded FAQ */}
                <section className={styles.section} style={{ background: 'white' }} id="faq">
                    <div className={styles.container}>
                        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
                        <div className={styles.accordion}>
                            <AccordionItem id="faq1" title="Is Paynest an accounting tool?">
                                <p>Paynest is a <strong>Financial Operating System</strong>. While it handles many accounting functions (like P&L and expense tracking), it focuses on <em>managerial finance</em>—helping you make decisions—rather than just tax compliance. It works alongside your accountant.</p>
                            </AccordionItem>
                            <AccordionItem id="faq2" title="How accurate are the numbers?">
                                <p>Extremely accurate. Because we pull data directly from source (Ad Platforms, Banks, Stores) and use rigorous logic to match transactions, we remove the human error associated with manual spreadsheets.</p>
                            </AccordionItem>
                            <AccordionItem id="faq3" title="Can Paynest replace spreadsheets?">
                                <p>For 95% of your daily financial tracking, yes. Paynest automates the data collection, cleaning, and reporting that you currently do in Excel, saving you hours every week.</p>
                            </AccordionItem>
                            <AccordionItem id="faq4" title="Is Paynest suitable for agencies?">
                                <p>Yes! Our <strong>Business Plan</strong> allows you to manage multiple client entities under a single login, making it perfect for agencies managing finances for multiple e-commerce brands.</p>
                            </AccordionItem>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className={styles.ctaSection}>
                    <div className={styles.container}>
                        <h2 className={styles.ctaTitle}>Still have questions?</h2>
                        <div className={styles.ctaButtons}>
                            <Link to="/contact" className="btn btn-outline" style={{ borderColor: 'white', color: 'white' }}>
                                <Mail size={18} className="mr-2" /> Contact Sales
                            </Link>
                            <Link to="/signup" className="btn btn-primary" style={{ background: '#10b981', borderColor: '#10b981' }}>
                                Start Free Trial <ArrowRight size={18} className="ml-2" />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default HelpCenter;
