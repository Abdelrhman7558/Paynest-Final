import React, { useState } from 'react';
import { Check, ShieldCheck, Lock, CreditCard, ArrowRight, ArrowLeft, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';

export const Pricing: React.FC = () => {
    const { dir } = useLanguage();
    const navigate = useNavigate();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
    const [step, setStep] = useState<'plans' | 'payment' | 'success'>('plans');
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Mock Plans
    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            price: billingCycle === 'monthly' ? 29 : 24,
            currency: '$',
            features: ['500 Transactions/mo', 'Basic Analytics', '1 User', 'Email Support']
        },
        {
            id: 'pro',
            name: 'Pro',
            popular: true,
            price: billingCycle === 'monthly' ? 79 : 65,
            currency: '$',
            features: ['Unlimited Transactions', 'Advanced Analytics', '5 Users', 'Priority Support', 'Export to PDF/Excel']
        },
        {
            id: 'business',
            name: 'Business',
            price: billingCycle === 'monthly' ? 199 : 159,
            currency: '$',
            features: ['Unlimited Users', 'Dedicated Account Manager', 'Custom API Access', 'Audit Logs', 'SLA Guarantee']
        }
    ];

    const handlePlanSelect = (planId: string) => {
        setSelectedPlan(planId);
        setStep('payment');
    };

    const handlePayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        // Simulate Payment Processing
        setTimeout(() => {
            setIsProcessing(false);
            setStep('success');
        }, 2000);
    };

    const renderPlans = () => (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                    Choose the plan that fits your business
                </h1>
                <p className="text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                    Upgrade anytime as your business grows.
                </p>

                {/* Billing Toggle */}
                <div className="inline-flex items-center p-1 rounded-xl border bg-white relative" style={{ borderColor: 'var(--color-border)' }}>
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'shadow-sm' : 'hover:opacity-70'}`}
                        style={{
                            backgroundColor: billingCycle === 'monthly' ? 'var(--color-bg)' : 'transparent',
                            color: billingCycle === 'monthly' ? 'var(--color-text)' : 'var(--color-text-secondary)'
                        }}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'shadow-sm' : 'hover:opacity-70'}`}
                        style={{
                            backgroundColor: billingCycle === 'yearly' ? 'var(--color-primary)' : 'transparent',
                            color: billingCycle === 'yearly' ? 'white' : 'var(--color-text-secondary)'
                        }}
                    >
                        Yearly
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full text-white">Save 20%</span>
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${plan.popular ? 'border-teal-500 ring-1 ring-teal-500 shadow-lg' : 'border-slate-200'}`}
                        style={{ backgroundColor: 'var(--color-card)' }}
                    >
                        {plan.popular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                                <Star size={12} fill="white" /> Most Popular
                            </div>
                        )}

                        <div className="text-center mb-6">
                            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>{plan.name}</h3>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-bold" style={{ color: 'var(--color-text)' }}>{plan.currency}{plan.price}</span>
                                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>/mo</span>
                            </div>
                            {billingCycle === 'yearly' && (
                                <p className="text-xs text-emerald-600 font-medium mt-2">Billed {plan.currency}{plan.price * 12} yearly</p>
                            )}
                        </div>

                        <ul className="space-y-4 mb-8">
                            {plan.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    <div className="w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                        <Check size={12} strokeWidth={3} />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => handlePlanSelect(plan.id)}
                            className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.popular
                                ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-500/20'
                                : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                }`}
                        >
                            Get started
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPayment = () => (
        <div className="max-w-lg mx-auto animate-in fade-in slide-in-from-right-8 duration-500">
            <button
                onClick={() => setStep('plans')}
                className="flex items-center gap-2 text-sm font-medium mb-6 transition-colors hover:text-teal-600"
                style={{ color: 'var(--color-text-secondary)' }}
            >
                <ArrowLeft size={16} />
                Back to plans
            </button>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-card)' }}>
                {/* Order Summary */}
                <div className="p-6 bg-slate-50 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                            {plans.find(p => p.id === selectedPlan)?.name} Plan ({billingCycle})
                        </span>
                        <span className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                            ${plans.find(p => p.id === selectedPlan)?.price}
                            <span className="text-sm font-normal text-slate-500">/mo</span>
                        </span>
                    </div>
                    <p className="text-xs text-slate-500">Upgrading your workspace immediately.</p>
                </div>

                {/* Secure Header */}
                <div className="px-6 pt-6 flex items-center justify-between">
                    <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>Payment Method</h2>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        <Lock size={12} />
                        SSL Secured
                    </div>
                </div>

                <form onSubmit={handlePayment} className="p-6 space-y-5">
                    {/* Card Input */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                            Card Details
                        </label>
                        <div className="relative">
                            <input
                                required
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                className="w-full pl-10 pr-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-teal-500/20"
                                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                <CreditCard size={18} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                Expiry
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="MM / YY"
                                className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-teal-500/20"
                                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                CVC
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="123"
                                className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-teal-500/20"
                                style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                            Cardholder Name
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-lg border outline-none focus:ring-2 focus:ring-teal-500/20"
                            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
                        style={{ backgroundColor: 'var(--color-primary)' }}
                    >
                        {isProcessing ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                Complete Payment
                                <ArrowRight size={18} className={dir === 'rtl' ? 'rotate-180' : ''} />
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <p className="text-[10px] text-slate-400">
                            By clicking "Complete Payment", you agree to our Terms of Service.
                            Secure payment powered by trusted providers.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );

    const renderSuccess = () => (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 max-w-md mx-auto">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-green-200 shadow-xl">
                <Check size={40} strokeWidth={3} />
            </div>
            <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>Payment successful 🎉</h1>
            <p className="text-lg mb-8" style={{ color: 'var(--color-text-secondary)' }}>
                Your subscription is now active! We've sent a receipt to your email.
            </p>

            <div className="w-full space-y-3">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg hover:-translate-y-1 transition-all"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                >
                    Go to Dashboard
                </button>
                <button className="text-sm font-medium text-slate-500 hover:text-slate-700">
                    Download Receipt
                </button>
            </div>

            <div className="mt-8 flex items-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1"><ShieldCheck size={14} /> Cancel anytime</span>
                <span className="flex items-center gap-1"><Check size={14} /> No hidden fees</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen py-12 px-4" style={{ backgroundColor: 'var(--color-bg)' }}>
            {/* Header (Simplified) */}
            <div className="max-w-6xl mx-auto mb-8 flex items-center gap-2 font-bold text-lg" style={{ color: 'var(--color-primary)' }}>
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center">M</div>
                Paynest
            </div>

            {step === 'plans' && renderPlans()}
            {step === 'payment' && renderPayment()}
            {step === 'success' && renderSuccess()}
        </div>
    );
};
