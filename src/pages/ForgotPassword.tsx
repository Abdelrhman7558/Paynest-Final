import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, Shield, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate email
        if (!email.trim()) {
            setError('Please enter your email address');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsLoading(true);

        try {
            console.log('🔐 Sending password reset to:', email);
            console.log('🔗 Redirect URL:', `${window.location.origin}/update-password`);

            const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            console.log('📧 Reset response:', { data, error: resetError });

            if (resetError) {
                console.error('❌ Reset error:', resetError);
                // Show error to user for debugging (can remove in production)
                setError(resetError.message || 'Failed to send reset email');
                return;
            }

            // Success
            console.log('✅ Reset email sent successfully');
            setIsSuccess(true);
        } catch (err: any) {
            console.error('❌ Unexpected error:', err);
            setError(err?.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Success State
    if (isSuccess) {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    {/* Success Icon */}
                    <div style={styles.successIconWrapper}>
                        <CheckCircle size={36} color="#10B981" />
                    </div>

                    {/* Title */}
                    <h1 style={styles.successTitle}>Check your email</h1>

                    {/* Description */}
                    <p style={styles.successText}>
                        If an account exists for <strong style={{ color: '#111827' }}>{email}</strong>,
                        we've sent password reset instructions to your inbox.
                    </p>

                    {/* Spam Note */}
                    <p style={styles.spamNote}>
                        Didn't receive the email? Check your spam folder or try again.
                    </p>

                    {/* Back to Login Button */}
                    <button
                        onClick={() => navigate('/login')}
                        style={styles.primaryButton}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 12px 24px rgba(16, 185, 129, 0.35)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.25)';
                        }}
                    >
                        Return to login
                    </button>

                    {/* Try Again Link */}
                    <button
                        onClick={() => {
                            setIsSuccess(false);
                            setEmail('');
                        }}
                        style={styles.tryAgainLink}
                    >
                        Try a different email
                    </button>
                </div>
            </div>
        );
    }

    // Default State
    return (
        <div style={styles.page}>
            <div style={styles.card}>
                {/* Back Link */}
                <Link to="/login" style={styles.backLink}>
                    <ArrowLeft size={16} />
                    Back to login
                </Link>

                {/* Title */}
                <h1 style={styles.title}>Reset your password</h1>

                {/* Description */}
                <p style={styles.subtitle}>
                    Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <div style={styles.inputWrapper}>
                        <label htmlFor="email" style={styles.label}>
                            Email address
                        </label>
                        <div style={styles.inputContainer}>
                            <Mail size={18} style={styles.inputIcon} />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder="name@company.com"
                                style={{
                                    ...styles.input,
                                    borderColor: error ? '#EF4444' : '#E5E7EB',
                                }}
                                autoComplete="email"
                                autoFocus
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={styles.errorMessage}>
                                <AlertCircle size={14} />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            ...styles.primaryButton,
                            opacity: isLoading ? 0.7 : 1,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                        }}
                        onMouseEnter={(e) => {
                            if (!isLoading) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(16, 185, 129, 0.35)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.25)';
                        }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send reset link'
                        )}
                    </button>
                </form>

                {/* Security Note */}
                <div style={styles.securityNote}>
                    <Shield size={16} color="#10B981" />
                    <span>Your information is secure and encrypted</span>
                </div>
            </div>
        </div>
    );
};

// ================== STYLES ==================

const styles: { [key: string]: React.CSSProperties } = {
    page: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F6F9FC',
        padding: 16,
    },

    card: {
        width: '100%',
        maxWidth: 440,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(0, 0, 0, 0.04)',
    },

    backLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 14,
        color: '#6B7280',
        textDecoration: 'none',
        marginBottom: 24,
        transition: 'color 0.2s ease',
    },

    title: {
        fontSize: 24,
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 8px 0',
        lineHeight: 1.3,
    },

    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        margin: '0 0 28px 0',
        lineHeight: 1.6,
    },

    inputWrapper: {
        marginBottom: 20,
    },

    label: {
        display: 'block',
        fontSize: 14,
        fontWeight: 500,
        color: '#374151',
        marginBottom: 8,
    },

    inputContainer: {
        position: 'relative' as const,
    },

    inputIcon: {
        position: 'absolute' as const,
        left: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#9CA3AF',
        pointerEvents: 'none' as const,
    },

    input: {
        width: '100%',
        height: 48,
        padding: '0 14px 0 44px',
        borderRadius: 10,
        border: '1px solid #E5E7EB',
        fontSize: 15,
        color: '#111827',
        backgroundColor: '#FFFFFF',
        outline: 'none',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxSizing: 'border-box' as const,
    },

    errorMessage: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 8,
        fontSize: 13,
        color: '#EF4444',
    },

    primaryButton: {
        width: '100%',
        height: 48,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 12,
        background: 'linear-gradient(135deg, #10B981, #059669)',
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: 600,
        border: 'none',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)',
    },

    securityNote: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 24,
        paddingTop: 20,
        borderTop: '1px solid #F3F4F6',
        fontSize: 13,
        color: '#6B7280',
    },

    // Success State Styles
    successIconWrapper: {
        width: 72,
        height: 72,
        borderRadius: '50%',
        backgroundColor: '#ECFDF5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
    },

    successTitle: {
        fontSize: 22,
        fontWeight: 700,
        color: '#111827',
        margin: '0 0 12px 0',
        textAlign: 'center' as const,
    },

    successText: {
        fontSize: 14,
        color: '#6B7280',
        margin: '0 0 8px 0',
        textAlign: 'center' as const,
        lineHeight: 1.6,
    },

    spamNote: {
        fontSize: 13,
        color: '#9CA3AF',
        margin: '0 0 24px 0',
        textAlign: 'center' as const,
    },

    tryAgainLink: {
        display: 'block',
        width: '100%',
        marginTop: 12,
        padding: 10,
        backgroundColor: 'transparent',
        border: 'none',
        fontSize: 14,
        color: '#10B981',
        fontWeight: 500,
        cursor: 'pointer',
        textAlign: 'center' as const,
    },
};
