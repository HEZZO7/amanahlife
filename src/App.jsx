import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { I18nProvider } from '@/lib/i18n';
import { ThemeProvider } from '@/lib/ThemeContext';
import { UserSettingsProvider, useUserSettings } from '@/lib/UserSettingsContext';

// Pages
import Onboarding from '@/pages/Onboarding';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import Finance from '@/pages/Finance';
import Goals from '@/pages/Goals';
import Planner from '@/pages/Planner';
import Spiritual from '@/pages/Spiritual';
import Ramadan from '@/pages/Ramadan';
import Family from '@/pages/Family';
import Learning from '@/pages/Learning';
import Work from '@/pages/Work';
import Wellness from '@/pages/Wellness';
import Analytics from '@/pages/Analytics';
import AIAssistant from '@/pages/AIAssistant';
import LifeReviews from '@/pages/LifeReviews';
import AchievementsDashboard from '@/pages/AchievementsDashboard';
import Archive from '@/pages/Archive';

// Layout
import AppLayout from '@/components/navigation/AppLayout';

const AppRoutes = () => {
  const { settings, loading } = useUserSettings();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--mizan-bg)' }}>
        <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--mizan-border)', borderTopColor: 'var(--mizan-emerald)' }} />
      </div>
    );
  }

  const onboarded = settings?.onboarding_completed === true;

  if (!onboarded) {
    return (
      <Routes>
        <Route path="*" element={<Onboarding />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/spiritual" element={<Spiritual />} />
        <Route path="/ramadan" element={<Ramadan />} />
        <Route path="/family" element={<Family />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/work" element={<Work />} />
        <Route path="/wellness" element={<Wellness />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai" element={<AIAssistant />} />
        <Route path="/reviews" element={<LifeReviews />} />
        <Route path="/achievements" element={<AchievementsDashboard />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <UserSettingsProvider>
      <AppRoutes />
    </UserSettingsProvider>
  );
};

function App() {
  return (
    <I18nProvider>
      <ThemeProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nProvider>
  )
}

export default App