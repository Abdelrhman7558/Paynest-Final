export type Language = 'en' | 'ar';

export const translations = {
    en: {
        // ==========================================
        // NAVIGATION & LAYOUT
        // ==========================================
        financialOverview: "Financial Overview",
        overviewSubtitle: "Real-time visibility into capital efficiency & growth.",
        dashboard: "Dashboard",
        transactions: "Transactions",
        analytics: "Analytics",
        settings: "Settings",
        filter: "Filter",
        refreshData: "Refresh Data",
        signOut: "Sign Out",

        // ==========================================
        // HERO SECTION
        // ==========================================
        heroTitle: "See Your Business Finances Clearly",
        heroTitleHighlight: "In One Dashboard",
        heroSubtitle: "Connect all your sales channels, costs, and operations to instantly know your profit, cash flow, and break-even point — without spreadsheets.",
        startFree: "Start Free",
        seeHowItWorks: "See How It Works",
        totalRevenue: "Total Revenue",
        netProfit: "Net Profit",
        expenses: "Expenses",
        profitBadge: "+24% Profit",

        // ==========================================
        // WHY US SECTION
        // ==========================================
        whyUsTitle: "Why Founders Choose Us",
        whyUsSubtitle: "Over traditional finance tools",
        ourPlatform: "Our Platform",
        traditionalTools: "Traditional Tools",
        realTimeSync: "Real-time sync",
        manualUploads: "Manual uploads",
        autoCategorizationFeature: "AI-powered categorization",
        spreadsheetsManual: "Manual spreadsheets",
        investorReadyReports: "Investor-ready reports",
        rawDataExports: "Raw data exports",
        oneDashboard: "One unified dashboard",
        multipleTools: "Multiple disconnected tools",
        builtForFounders: "Built for founders",
        builtForAccountants: "Built for accountants",

        // ==========================================
        // FEATURES SECTION
        // ==========================================
        featuresTitle: "Everything You Need",
        featuresSubtitle: "Powerful tools to manage your business finances",

        // ==========================================
        // PRICING SECTION
        // ==========================================
        pricingTitle: "Simple, Transparent Pricing",
        pricingSubtitle: "Choose the plan that fits your business",
        monthly: "Monthly",
        yearly: "Yearly",
        perMonth: "/month",
        getStarted: "Get Started",
        mostPopular: "Most Popular",

        // ==========================================
        // FOOTER
        // ==========================================
        footerBrandDesc: "The complete financial operating system for modern e-commerce businesses. Clarify your numbers, grow your profit.",
        platform: "Platform",
        home: "Home",
        howItWorks: "How It Works",
        pricing: "Pricing",
        login: "Login",
        company: "Company",
        aboutUs: "About Us",
        careers: "Careers",
        blog: "Blog",
        contact: "Contact",
        legal: "Legal",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
        security: "Security",
        allRightsReserved: "All rights reserved.",

        // ==========================================
        // AUTH PAGES
        // ==========================================
        signIn: "Sign In",
        signUp: "Sign Up",
        email: "Email",
        password: "Password",
        confirmPassword: "Confirm Password",
        forgotPassword: "Forgot Password?",
        dontHaveAccount: "Don't have an account?",
        alreadyHaveAccount: "Already have an account?",
        createAccount: "Create Account",
        welcomeBack: "Welcome Back",
        createYourAccount: "Create Your Account",
        enterCredentials: "Enter your credentials to access your dashboard",
        joinPlatform: "Join thousands of founders taking control of their finances",

        // ==========================================
        // INTEGRATIONS
        // ==========================================
        connectYourData: "Connect Your Data",
        connectSubtitle: "Sync sales, costs, orders, and inventory automatically from your tools.",
        connecting: "Connecting...",
        connected: "Connected",
        connectStore: "Connect Store",
        enterStoreUrl: "Enter your store URL",

        // ==========================================
        // KPIs & METRICS
        // ==========================================
        grossRevenue: "Gross Revenue",
        operatingExpenses: "Operating Expenses",
        netOperatingProfit: "Net Operating Profit",
        netMargin: "Net Margin %",

        // ==========================================
        // TRENDS & STATUS
        // ==========================================
        topLineGrowth: "Top-line growth",
        opexOptimization: "OpEx Optimization",
        cashFlowPositive: "Cash Flow Positive",
        burnRateAlert: "Burn Rate Alert",
        highEfficiency: "High Efficiency",
        needsOptimization: "Needs Optimization",
        profitable: "Profitable",
        breakEvenTarget: "Break-even target",
        healthyMargin: "Healthy margin",
        lowMargin: "Low margin",
        startStrong: "Start strong",
        operatingExpensesTrend: "Operating expenses",

        // ==========================================
        // CHARTS
        // ==========================================
        revenueGrowthTrajectory: "Revenue Growth Trajectory",
        opexAllocation: "OpEx Allocation",
        awaitingData: "Awaiting transaction data to visualize growth.",
        noExpenseData: "No expense data available for categorization.",

        // ==========================================
        // LOADING & ERRORS
        // ==========================================
        aggregatingData: "Aggregating financial data...",
        retryConnection: "Retry Connection",
        loading: "Loading...",
        error: "Error",
        tryAgain: "Try Again",
        somethingWentWrong: "Something went wrong",

        // ==========================================
        // LEGAL PAGES
        // ==========================================
        privacyPolicyTitle: "Privacy Policy",
        termsOfServiceTitle: "Terms of Service",
        lastUpdated: "Last Updated",
        dataCollection: "Data Collection",
        dataUsage: "How We Use Your Data",
        thirdPartyIntegrations: "Third-Party Integrations",
        storageAndSecurity: "Storage & Security",
        yourRights: "Your Rights",
        cookies: "Cookies",
        contactUs: "Contact Us",

        // ==========================================
        // MISC
        // ==========================================
        changeLanguage: "عربي",
        close: "Close",
        save: "Save",
        cancel: "Cancel",
        submit: "Submit",
        back: "Back",
        next: "Next",

        // ==========================================
        // META ONBOARDING
        // ==========================================
        metaSelectTitle: "Select your Facebook Page",
        metaSelectDescription: "This page helps us link ad activity with orders and revenue.",
        noItemsFound: "No items available yet",
        fetchingAssets: "Fetching assets...",
        optional: "Optional",
        selectAdAccount: "Select Ad Account",
        selectAdAccountDesc: "We’ll use this to sync ad spend and profit analysis",
        choosePixel: "Choose Pixel",
        choosePixelDesc: "Select the pixel used for tracking conversions and revenue",
        pickCatalog: "Pick Catalog",
        pickCatalogDesc: "Optionally link a product catalog for item-level analysis",
        reviewSelections: "Review Selections",
        reviewSelectionsDesc: "Confirm your configuration before syncing data",

        step: "Step",
        pageID: "Page ID",
        connectedToBM: "Connected to Business Manager",
        products: "products",
        admin: "Admin",
        advertiser: "Advertiser",

        // Why Choose Us (Onboarding)
        whyChooseUsOnboarding: "Why top brands trust us",
        benefitClarity: "Real-time Financial Clarity",
        benefitClarityDesc: "Ditch the spreadsheets. Get P&L visibility in seconds.",
        benefitAccuracy: "100% Data Accuracy",
        benefitAccuracyDesc: "Direct integration ensures your numbers always match.",
        benefitSecurity: "Bank-Grade Security",
        benefitSecurityDesc: "Read-only access. We never modify your campaigns.",

        continue: "Continue",
        completingSetup: "Completing Setup...",
    },

    ar: {
        // ==========================================
        // NAVIGATION & LAYOUT
        // ==========================================
        financialOverview: "الملخص المالي",
        overviewSubtitle: "رؤية فورية للأداء وكفاءة النمو",
        dashboard: "لوحة التحكم",
        transactions: "المعاملات المالية",
        analytics: "التحليلات",
        settings: "الإعدادات",
        filter: "تصفية",
        refreshData: "تحديث البيانات",
        signOut: "تسجيل الخروج",

        // ==========================================
        // HERO SECTION
        // ==========================================
        heroTitle: "شوف ماليات شركتك بوضوح",
        heroTitleHighlight: "في لوحة تحكم واحدة",
        heroSubtitle: "اربط كل قنوات البيع والتكاليف والعمليات علشان تعرف فوراً أرباحك والتدفق النقدي ونقطة التعادل — من غير جداول Excel.",
        startFree: "ابدأ مجاناً",
        seeHowItWorks: "شوف إزاي بتشتغل",
        totalRevenue: "إجمالي الإيرادات",
        netProfit: "صافي الربح",
        expenses: "المصروفات",
        profitBadge: "+24% ربح",

        // ==========================================
        // WHY US SECTION
        // ==========================================
        whyUsTitle: "ليه المؤسسين بيختارونا",
        whyUsSubtitle: "بدلاً من الأدوات المالية التقليدية",
        ourPlatform: "منصتنا",
        traditionalTools: "الأدوات التقليدية",
        realTimeSync: "مزامنة لحظية",
        manualUploads: "رفع يدوي",
        autoCategorizationFeature: "تصنيف ذكي بالذكاء الاصطناعي",
        spreadsheetsManual: "جداول Excel يدوية",
        investorReadyReports: "تقارير جاهزة للمستثمرين",
        rawDataExports: "بيانات خام",
        oneDashboard: "لوحة تحكم موحدة",
        multipleTools: "أدوات متعددة ومنفصلة",
        builtForFounders: "مبنية للمؤسسين",
        builtForAccountants: "مبنية للمحاسبين",

        // ==========================================
        // FEATURES SECTION
        // ==========================================
        featuresTitle: "كل اللي تحتاجه",
        featuresSubtitle: "أدوات قوية لإدارة ماليات شركتك",

        // ==========================================
        // PRICING SECTION
        // ==========================================
        pricingTitle: "أسعار بسيطة وشفافة",
        pricingSubtitle: "اختار الخطة المناسبة لشركتك",
        monthly: "شهري",
        yearly: "سنوي",
        perMonth: "/شهر",
        getStarted: "ابدأ الآن",
        mostPopular: "الأكثر شيوعاً",

        // ==========================================
        // FOOTER
        // ==========================================
        footerBrandDesc: "النظام المالي المتكامل للتجارة الإلكترونية الحديثة. وضّح أرقامك، كبّر أرباحك.",
        platform: "المنصة",
        home: "الرئيسية",
        howItWorks: "كيف تعمل",
        pricing: "الأسعار",
        login: "تسجيل الدخول",
        company: "الشركة",
        aboutUs: "من نحن",
        careers: "الوظائف",
        blog: "المدونة",
        contact: "تواصل معنا",
        legal: "قانوني",
        privacyPolicy: "سياسة الخصوصية",
        termsOfService: "شروط الخدمة",
        security: "الأمان",
        allRightsReserved: "جميع الحقوق محفوظة.",

        // ==========================================
        // AUTH PAGES
        // ==========================================
        signIn: "تسجيل الدخول",
        signUp: "إنشاء حساب",
        email: "البريد الإلكتروني",
        password: "كلمة المرور",
        confirmPassword: "تأكيد كلمة المرور",
        forgotPassword: "نسيت كلمة المرور؟",
        dontHaveAccount: "ماعندكش حساب؟",
        alreadyHaveAccount: "عندك حساب بالفعل؟",
        createAccount: "إنشاء حساب",
        welcomeBack: "أهلاً بعودتك",
        createYourAccount: "أنشئ حسابك",
        enterCredentials: "أدخل بياناتك للوصول للوحة التحكم",
        joinPlatform: "انضم لآلاف المؤسسين اللي بيتحكموا في مالياتهم",

        // ==========================================
        // INTEGRATIONS
        // ==========================================
        connectYourData: "اربط بياناتك",
        connectSubtitle: "زامن المبيعات والتكاليف والطلبات والمخزون تلقائياً.",
        connecting: "جاري الربط...",
        connected: "متصل",
        connectStore: "ربط المتجر",
        enterStoreUrl: "أدخل رابط متجرك",

        // ==========================================
        // KPIs & METRICS
        // ==========================================
        grossRevenue: "إجمالي الإيرادات",
        operatingExpenses: "المصروفات التشغيلية",
        netOperatingProfit: "صافي الربح التشغيلي",
        netMargin: "هامش الربح الصافي",

        // ==========================================
        // TRENDS & STATUS
        // ==========================================
        topLineGrowth: "نمو الإيرادات",
        opexOptimization: "تحسين المصروفات",
        cashFlowPositive: "تدفق نقدي إيجابي",
        burnRateAlert: "تنبيه: معدل الحرق",
        highEfficiency: "كفاءة عالية",
        needsOptimization: "بحاجة للتحسين",
        profitable: "ربحية جيدة",
        breakEvenTarget: "مستهدف نقطة التعادل",
        healthyMargin: "هامش صحي",
        lowMargin: "هامش منخفض",
        startStrong: "بداية قوية",
        operatingExpensesTrend: "مصروفات تشغيلية",

        // ==========================================
        // CHARTS
        // ==========================================
        revenueGrowthTrajectory: "مسار نمو الإيرادات",
        opexAllocation: "توزيع المصروفات التشغيلية",
        awaitingData: "جاري انتظار البيانات لرسم مسار النمو...",
        noExpenseData: "لا توجد مصروفات للتصنيف حالياً.",

        // ==========================================
        // LOADING & ERRORS
        // ==========================================
        aggregatingData: "جاري تجميع البيانات المالية...",
        retryConnection: "أعد المحاولة",
        loading: "جاري التحميل...",
        error: "خطأ",
        tryAgain: "حاول مرة أخرى",
        somethingWentWrong: "حدث خطأ ما",

        // ==========================================
        // LEGAL PAGES
        // ==========================================
        privacyPolicyTitle: "سياسة الخصوصية",
        termsOfServiceTitle: "شروط الخدمة",
        lastUpdated: "آخر تحديث",
        dataCollection: "جمع البيانات",
        dataUsage: "كيف نستخدم بياناتك",
        thirdPartyIntegrations: "التكاملات مع الطرف الثالث",
        storageAndSecurity: "التخزين والأمان",
        yourRights: "حقوقك",
        cookies: "ملفات تعريف الارتباط",
        contactUs: "تواصل معنا",

        // ==========================================
        // MISC
        // ==========================================
        changeLanguage: "English",
        close: "إغلاق",
        save: "حفظ",
        cancel: "إلغاء",
        submit: "إرسال",
        back: "رجوع",
        next: "التالي",

        // ==========================================
        // META ONBOARDING
        // ==========================================
        metaSelectTitle: "اختر صفحة فيسبوك",
        metaSelectDescription: "تساعدنا هذه الصفحة في ربط نشاط الإعلانات بالطلبات والإيرادات.",
        noItemsFound: "لا توجد عناصر متاحة حتى الآن",
        fetchingAssets: "جاري جلب البيانات...",
        optional: "اختياري",
        selectAdAccount: "اختر حساب إعلاني",
        selectAdAccountDesc: "سنستخدم هذا لمزامنة إنفاق الإعلانات وتحليل الأرباح",
        choosePixel: "اختر البيكسل",
        choosePixelDesc: "اختر البيكسل المستخدم لتتبع التحويلات والإيرادات",
        pickCatalog: "اختر الكتالوج",
        pickCatalogDesc: "اختيارياً، اربط كتالوج المنتجات لتحليل مستوى العناصر",
        reviewSelections: "مراجعة الاختيارات",
        reviewSelectionsDesc: "أكد إعداداتك قبل مزامنة البيانات",

        step: "خطوة",
        pageID: "معرف الصفحة",
        connectedToBM: "متصل بمدير الأعمال",
        products: "منتجات",
        admin: "مسؤول",
        advertiser: "معلن",

        // Why Choose Us (Onboarding)
        whyChooseUsOnboarding: "لماذا تثق بنا العلامات التجارية الكبرى",
        benefitClarity: "وضوح مالي فوري",
        benefitClarityDesc: "تخلص من الجداول. احصل على رؤية للأرباح والخسائر في ثوانٍ.",
        benefitAccuracy: "دقة بيانات 100%",
        benefitAccuracyDesc: "التكامل المباشر يضمن تطابق أرقامك دائمًا.",
        benefitSecurity: "أمان بمستوى البنوك",
        benefitSecurityDesc: "وصول للقراءة فقط. لن نقوم بتعديل حملاتك أبدًا.",

        continue: "متابعة",
        completingSetup: "جاري إكمال الإعداد...",
    }
};

// Type helper for translation keys
export type TranslationKey = keyof typeof translations['en'];
