import { Layout, CheckCircle, ArrowRight, Github, Chrome, Twitter } from 'lucide-react';

// --- SHARED COMPONENTS ---
const Button = ({ children, className, variant = 'primary', ...props }: any) => {
    const base = "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
    const variants = {
        primary: "bg-[#0F766E] hover:bg-[#0D655E] text-white shadow-lg shadow-teal-900/20",
        outline: "border border-gray-200 hover:border-gray-300 text-gray-700 bg-white",
        ghost: "text-gray-500 hover:text-gray-900",
    };
    return <button className={`${base} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>{children}</button>;
};

const Input = ({ label, icon: Icon, ...props }: any) => (
    <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="relative group">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0F766E] transition-colors" size={18} />}
            <input
                className={`w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 ${Icon ? 'pl-10' : 'pl-4'} pr-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all`}
                {...props}
            />
        </div>
    </div>
);

// --- DESIGN 1: CORPORATE CLEAN (Shopify Style) ---
export const AuthOption1 = () => (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 text-2xl font-bold text-[#0F172A] mb-2">
                <div className="w-8 h-8 bg-[#0F766E] rounded-lg flex items-center justify-center text-white">
                    <Layout size={18} />
                </div>
                Paynest
            </div>
            <p className="text-gray-500 text-sm">Sign in to continue to your dashboard</p>
        </div>

        <div className="bg-white w-full max-w-[400px] rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] border border-gray-100 p-8 space-y-6">
            <div className="space-y-4">
                <Input label="Email" type="email" placeholder="name@company.com" />
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <a href="#" className="text-sm font-medium text-[#0F766E] hover:underline">Forgot?</a>
                    </div>
                    <Input type="password" placeholder="••••••••" />
                </div>
            </div>

            <Button>Sign in</Button>

            <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Or</span></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button variant="outline"><Chrome size={18} /> Google</Button>
                <Button variant="outline"><Github size={18} /> GitHub</Button>
            </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
            &copy; 2026 Paynest Inc. <a href="#" className="underline">Privacy</a> &bull; <a href="#" className="underline">Terms</a>
        </div>
    </div>
);

// --- DESIGN 2: MODERN SAAS (Linear/Vercel Style) ---
export const AuthOption2 = () => (
    <div className="min-h-screen bg-black flex text-white overflow-hidden">
        {/* Left Side: Visual */}
        <div className="hidden lg:flex w-[55%] bg-[#111] relative overflow-hidden items-center justify-center p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0F766E1a_0%,transparent_70%)] opacity-40"></div>
            <div className="relative z-10 max-w-lg">
                <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-emerald-400">
                    <CheckCircle size={12} /> New Feature: Cash Flow Analytics
                </div>
                <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">Master your finances with precision.</h1>
                <p className="text-lg text-gray-400 leading-relaxed">Join thousands of businesses using Paynest to track, analyze, and optimize their spending in real-time.</p>

                <div className="mt-12 grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                    <div>
                        <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                        <div className="text-sm text-gray-500">Uptime SLA</div>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-white mb-1">24/7</div>
                        <div className="text-sm text-gray-500">Support Access</div>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex-1 flex flex-col justify-center p-8 lg:p-24 relative">
            <div className="max-w-sm w-full mx-auto space-y-8">
                <div>
                    <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-black mb-6">
                        <Layout size={20} />
                    </div>
                    <h2 className="text-2xl font-bold">Create your account</h2>
                    <p className="text-gray-400 mt-2">Enter your details to get started.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5 text-left">
                        <label className="text-sm font-medium text-gray-300">Email address</label>
                        <input className="w-full bg-[#222] border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#0F766E] transition-colors" placeholder="colin@example.com" />
                    </div>
                    <div className="space-y-1.5 text-left">
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <input className="w-full bg-[#222] border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-[#0F766E] transition-colors" type="password" placeholder="••••••••" />
                    </div>
                </div>

                <button className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                    Get Started <ArrowRight size={18} />
                </button>

                <div className="text-center text-sm text-gray-500">
                    Already have an account? <a href="#" className="text-white hover:underline">Log in</a>
                </div>
            </div>
        </div>
    </div>
);

// --- DESIGN 3: VISUAL SPLIT (Wave/Creative) ---
export const AuthOption3 = () => (
    <div className="min-h-screen bg-white flex">
        {/* Brand Side */}
        <div className="hidden lg:flex w-1/2 bg-[#0F766E] relative items-center justify-center p-12 text-white overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0D9488] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#115E59] rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4"></div>

            <div className="relative z-10 max-w-lg text-center">
                <div className="mb-8 flex justify-center">
                    {/* Logo Placeholder */}
                    <div className="w-20 h-20 bg-white/10 backdrop-blur border border-white/20 rounded-2xl flex items-center justify-center">
                        <Layout size={40} />
                    </div>
                </div>
                <h2 className="text-4xl font-bold mb-6">Welcome Back!</h2>
                <p className="text-white/80 text-lg leading-relaxed">
                    "Paynest has transformed how we handle our daily expenses. It's simply the best tool for financial clarity."
                </p>
                <div className="mt-8 flex items-center justify-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20"></div>
                    <div className="w-10 h-10 rounded-full bg-white/20"></div>
                    <div className="w-10 h-10 rounded-full bg-white/20"></div>
                    <div className="text-sm font-medium">+2k Happy Users</div>
                </div>
            </div>
        </div>

        {/* Form Side */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center p-8 lg:p-24 bg-white">
            <div className="max-w-md w-full mx-auto">
                <div className="mb-10">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">Hello Again! 👋</h3>
                    <p className="text-gray-500">Enter your credentials to access your account.</p>
                </div>

                <form className="space-y-6">
                    <div className="relative">
                        <Input label="Email" placeholder="Enter your email" />
                    </div>
                    <div>
                        <Input type="password" label="Password" placeholder="Enter password" />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded border-gray-300 text-[#0F766E] focus:ring-[#0F766E]" />
                            <span className="text-sm text-gray-600">Remember me</span>
                        </label>
                        <a href="#" className="text-sm font-bold text-[#0F766E]">Recovery Password</a>
                    </div>

                    <Button className="rounded-full py-4 text-base shadow-xl shadow-teal-500/10">Log In</Button>

                    <div className="relative my-8 text-center border-b border-gray-100 leading-[0.1em]">
                        <span className="bg-white px-4 text-sm text-gray-400">Or Continue With</span>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button type="button" className="p-3 rounded-full border border-gray-100 hover:bg-gray-50 transition-colors"><Chrome size={20} className="text-gray-600" /></button>
                        <button type="button" className="p-3 rounded-full border border-gray-100 hover:bg-gray-50 transition-colors"><Twitter size={20} className="text-blue-400" /></button>
                        <button type="button" className="p-3 rounded-full border border-gray-100 hover:bg-gray-50 transition-colors"><Github size={20} className="text-gray-900" /></button>
                    </div>
                </form>
            </div>
        </div>
    </div>
);
