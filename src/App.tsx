import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardProvider } from './context/DashboardContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Pricing } from './pages/Pricing';
import { VerifyEmail } from './pages/VerifyEmail';
import { ForgotPassword } from './pages/ForgotPassword';
import { UpdatePassword } from './pages/UpdatePassword';
import { SecurityActivity } from './pages/SecurityActivity';
import { Orders } from './pages/Orders';
import { Inventory } from './pages/Inventory';
import { AdsPerformance } from './pages/AdsPerformance';
import { Customers } from './pages/Customers';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { MetaSelect } from './pages/MetaSelect';
import { Costs } from './pages/Costs';
import { Settings } from './pages/Settings';
import { Reports } from './pages/Reports';
import { Support } from './pages/Support';
import { AccountsPayable } from './pages/AccountsPayable';
import { Shipping } from './pages/Shipping';
import { Manager } from './pages/Manager';
import { PaynestLoader } from './components/ui/PaynestLoader';

// Landing Page Components
import { Header } from './components/layout/Header';
import { Hero } from './components/sections/Hero';
import { ProductOverview } from './components/sections/ProductOverview';
import { Integrations } from './components/sections/Integrations';
import { HowItWorks } from './components/sections/HowItWorks';
import { TargetAudience } from './components/sections/TargetAudience';
import { WhyUs } from './components/sections/WhyUs';
import { Features } from './components/sections/Features';
import { ReportsPreview } from './components/sections/ReportsPreview';
import { Security } from './components/sections/Security';
import { Plans, FAQ } from './components/sections/Content';
import { Footer } from './components/layout/Footer';
import { HelpCenter } from './pages/HelpCenter';

const LandingPage = () => (
  <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
    <Header />
    <main>
      <Hero />
      <ProductOverview />
      <Integrations />
      <HowItWorks />
      <TargetAudience />
      <WhyUs />
      <Features />
      <ReportsPreview />
      <Security />
      <Plans />
      <FAQ />
      <Footer />
    </main>
  </div>
);

import { UploadProvider } from './context/UploadContext';
import { UploadModal } from './components/upload/UploadModal';

// ... imports

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <UploadProvider>
            <Router>
              <DashboardProvider>
                <UploadModal />
                <Routes>
                  {/* Public Landing Page */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signin" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/auth" element={<Navigate to="/login" replace />} />

                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/meta/select" element={<MetaSelect />} />
                  <Route path="/test-loading" element={<PaynestLoader />} />

                  {/* Protected Dashboard Routes */}
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="costs" element={<Costs />} />
                  <Route path="ads" element={<AdsPerformance />} />
                  <Route path="transactions" element={<div>Transactions Page</div>} />
                  <Route path="analytics" element={<div>Analytics Page</div>} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="support" element={<Support />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="settings/security" element={<SecurityActivity />} />
                  <Route path="accounts-payable" element={<AccountsPayable />} />
                  <Route path="shipping" element={<Shipping />} />
                  <Route path="manager" element={<Manager />} />
                  <Route path="/help-center" element={<HelpCenter />} />
                </Routes>
              </DashboardProvider>
            </Router>
          </UploadProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
