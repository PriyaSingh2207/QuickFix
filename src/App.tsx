import { Toaster } from "@/components/ui/toaster";
import { OfflineSyncManager } from "@/components/common/OfflineSyncManager";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Index } from "@/pages/Index";
import { NotFound } from "@/pages/NotFound";

import { ServicesPage } from "@/pages/Services";
import { FacilitiesPage } from "@/pages/Facilities";
import { CityAlertsPage } from "@/pages/CityAlerts";
import { JoinSquadPage } from "@/pages/JoinSquad";

import { WasteServicePage } from "@/services/WasteServicePage";
import { ParkingServicePage } from "@/services/ParkingServicePage";
import { PowerServicePage } from "@/services/PowerServicePage";
import { WifiServicePage } from "@/services/WifiServicePage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes (data remains fresh)
      gcTime: 10 * 60 * 1000,   // 10 minutes (garbage collection time)
      retry: 1,
      refetchOnWindowFocus: false, // Prevent background refetching on tab switch
    },
  },
});

import { ErrorBoundary } from "@/components/ErrorBoundary";

import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Signup } from "@/pages/Signup";
import { AppBootstrap } from "@/components/AppBootstrap";

import { OnboardingContainer } from "@/onboarding/OnboardingContainer";
import { LoginGuard } from "@/onboarding/LoginGuard";
import { Unauthorized } from "@/pages/Unauthorized";
import { ForgotPassword } from "@/pages/ForgotPassword";
import { UpdatePassword } from "@/pages/UpdatePassword";
import EmergencyDashboard from "@/pages/EmergencyDashboard";
import { OfficerPortal } from "@/pages/OfficerPortal";
import { ContractorPortal } from "@/pages/ContractorPortal";
import { MyComplaints } from "@/pages/MyComplaints";
import { ChatBot } from "@/components/chat/ChatBot";
import { LanguageProvider } from "@/contexts/LanguageContext";

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageProvider>
          <AuthProvider>
            <OfflineSyncManager />
            <AppBootstrap>
              <BrowserRouter>
                <ChatBot />
                <Routes>
                {/* Emergency Command Center - Isolated */}
                <Route path="/emergency" element={<EmergencyDashboard />} />

                {/* Urban Intelligence Engine - City Officer Portal */}
                <Route path="/officer-portal" element={<OfficerPortal />} />
                <Route path="/urban-intelligence" element={<OfficerPortal />} />

                {/* Contractor Portal & Government Tenders */}
                <Route path="/contractor-portal" element={<ContractorPortal />} />
                <Route path="/contractors" element={<ContractorPortal />} />
                <Route path="/tenders" element={<ContractorPortal />} />

                {/* Citizen Public Complaint Tracking & Rating */}
                <Route path="/my-complaints" element={<MyComplaints />} />
                <Route path="/track" element={<MyComplaints />} />

                {/* Onboarding */}
                <Route path="/onboarding" element={<OnboardingContainer />} />

                {/* Public Routes */}
                <Route path="/login" element={<LoginGuard />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/update-password" element={<UpdatePassword />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/complaints" element={<Index />} />
                  <Route path="/profile" element={<Index />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/services/waste" element={<WasteServicePage />} />
                  <Route path="/services/parking" element={<ParkingServicePage />} />
                  <Route path="/services/electricity" element={<PowerServicePage />} />
                  <Route path="/services/water" element={<ServicesPage />} />
                  <Route path="/services/wifi" element={<WifiServicePage />} />
                  <Route path="/facilities" element={<FacilitiesPage />} />
                  <Route path="/city-alerts" element={<CityAlertsPage />} />
                  <Route path="/join-squad" element={<JoinSquadPage />} />
                  <Route path="/events" element={<Index />} />
                  <Route path="/rewards" element={<Index />} />
                  <Route path="/settings" element={<Index />} />
                  <Route path="/missing" element={<Index />} />
                  <Route path="/helpline" element={<Index />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AppBootstrap>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
