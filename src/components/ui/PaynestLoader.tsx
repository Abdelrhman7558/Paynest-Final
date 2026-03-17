import React, { useEffect, useState } from 'react';

export const PaynestLoader: React.FC = () => {
    // Determine if we should show the full page loader styling or just the component
    // The user provided styles for body, but we'll scope them to a container

    return (
        <div className="paynest-loader-wrapper">
            <style>{`
                .paynest-loader-wrapper {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    overflow: hidden;
                    z-index: 9999;
                }

                .loader-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 2rem;
                }

                .logo-text {
                    display: flex;
                    gap: 0.1rem;
                }

                .letter {
                    font-size: 4rem;
                    font-weight: 700;
                    color: white;
                    opacity: 0;
                    transform: translateY(30px);
                    animation: letterDrop 0.6s ease-out forwards, float 3s ease-in-out infinite;
                }

                /* Staggered delays */
                .letter:nth-child(1) { animation-delay: 0s, 0.7s; }
                .letter:nth-child(2) { animation-delay: 0.1s, 0.8s; }
                .letter:nth-child(3) { animation-delay: 0.2s, 0.9s; }
                .letter:nth-child(4) { animation-delay: 0.3s, 1s; }
                .letter:nth-child(5) { animation-delay: 0.4s, 1.1s; }
                .letter:nth-child(6) { animation-delay: 0.5s, 1.2s; }
                .letter:nth-child(7) { animation-delay: 0.6s, 1.3s; }

                @keyframes letterDrop {
                    0% {
                        opacity: 0;
                        transform: translateY(-50px) scale(0.5);
                    }
                    50% {
                        opacity: 0.8;
                        transform: translateY(10px) scale(1.1);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) scale(1);
                    }
                    50% {
                        transform: translateY(-10px) scale(1.02);
                    }
                }

                /* Loading dots */
                .loading-dots {
                    display: flex;
                    gap: 0.5rem;
                    margin-top: 1rem;
                }

                .dot {
                    width: 12px;
                    height: 12px;
                    background: white;
                    border-radius: 50%;
                    opacity: 0.4;
                    animation: dotPulse 1.4s ease-in-out infinite;
                }

                .dot:nth-child(1) { animation-delay: 0s; }
                .dot:nth-child(2) { animation-delay: 0.2s; }
                .dot:nth-child(3) { animation-delay: 0.4s; }

                @keyframes dotPulse {
                    0%, 100% {
                        opacity: 0.4;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.3);
                    }
                }

                /* Progress bar */
                .progress-container {
                    width: 300px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    overflow: hidden;
                    margin-top: 2rem;
                }

                .progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #fff, #f0f0f0);
                    border-radius: 10px;
                    animation: progressLoad 2s ease-in-out infinite;
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                }

                @keyframes progressLoad {
                    0% { width: 0%; }
                    50% { width: 70%; }
                    100% { width: 100%; }
                }

                /* Particle effects */
                .particle {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: white;
                    border-radius: 50%;
                    pointer-events: none;
                    opacity: 0;
                    animation: particleFloat 3s ease-in-out infinite;
                }

                @keyframes particleFloat {
                    0% { opacity: 0; transform: translateY(0) translateX(0); }
                    10% { opacity: 0.8; }
                    90% { opacity: 0.2; }
                    100% { opacity: 0; transform: translateY(-100px) translateX(var(--x-offset, 0)); }
                }

                /* Glow effect */
                .glow {
                    position: absolute;
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
                    border-radius: 50%;
                    animation: glowPulse 4s ease-in-out infinite;
                    z-index: -1;
                }

                @keyframes glowPulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 0.8; }
                }

                .loading-text {
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 500;
                    letter-spacing: 2px;
                    margin-top: 1rem;
                    opacity: 0;
                    animation: fadeIn 1s ease-out 0.8s forwards;
                }

                @keyframes fadeIn {
                    to { opacity: 0.7; }
                }

                @media (max-width: 768px) {
                    .letter { font-size: 3rem; }
                    .progress-container { width: 250px; }
                }
            `}</style>

            <div className="loader-container">
                <div className="glow"></div>

                <div className="logo-text">
                    <span className="letter">P</span>
                    <span className="letter">a</span>
                    <span className="letter">y</span>
                    <span className="letter">n</span>
                    <span className="letter">e</span>
                    <span className="letter">s</span>
                    <span className="letter">t</span>
                </div>

                <div className="loading-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>

                <div className="progress-container">
                    <div className="progress-bar"></div>
                </div>

                <div className="loading-text">LOADING</div>
            </div>

            <ParticleEffect />
        </div>
    );
};

const ParticleEffect = () => {
    // Simple particle spawner
    const [particles, setParticles] = useState<{ id: number, left: number, offset: number }[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const id = Date.now();
            const left = Math.random() * window.innerWidth;
            const offset = (Math.random() - 0.5) * 100;

            setParticles(prev => [...prev, { id, left, offset }]);

            // Cleanup old particles
            setTimeout(() => {
                setParticles(prev => prev.filter(p => p.id !== id));
            }, 3000);
        }, 300);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {particles.map(p => (
                <div
                    key={p.id}
                    className="particle"
                    style={{
                        left: p.left,
                        '--x-offset': `${p.offset}px`
                    } as React.CSSProperties}
                />
            ))}
        </>
    );
};
