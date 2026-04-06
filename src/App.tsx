import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import LandingPage from "./pages/LandingPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import FeaturesPage from "./pages/FeaturesPage";
import FAQsPage from "./pages/FAQsPage";
import SearchPage from "./pages/SearchPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import TenantDashboard from "./pages/dashboards/TenantDashboard";
import TenantProfileSetup from "./pages/TenantProfileSetup";
import LandlordDashboard from "./pages/dashboards/LandlordDashboard";
import AgentDashboard from "./pages/dashboards/AgentDashboard";
import AffiliateDashboard from "./pages/dashboards/AffiliateDashboard";
import CreateListingPage from "./pages/CreateListingPage";
import EditPropertyPage from "./pages/EditPropertyPage";
import MyPropertiesPage from "./pages/MyPropertiesPage";
import MessagesPage from "./pages/MessagesPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ChatRoomsPage from "./pages/ChatRoomsPage";
import SavedPropertiesPage from "./pages/SavedPropertiesPage";
import AdminOverviewPage from "./pages/admin/AdminOverviewPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminApprovalsPage from "./pages/admin/AdminApprovalsPage";
import AdminPropertiesPage from "./pages/admin/AdminPropertiesPage";
import AdminVerificationsPage from "./pages/admin/AdminVerificationsPage";
import AdminApplicationsPage from "./pages/admin/AdminApplicationsPage";
import AdminAnnouncementsPage from "./pages/admin/AdminAnnouncementsPage";
import AdminActivityPage from "./pages/admin/AdminActivityPage";
import AdminRoleRequestsPage from "./pages/admin/AdminRoleRequestsPage";
import AdminAffiliatesPage from "./pages/admin/AdminAffiliatesPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ComparisonProvider>
            <Routes>
            {/* Public Website Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/faqs" element={<FAQsPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/property/:id" element={<PropertyDetailPage />} />
            </Route>
            
            {/* Auth Routes (no header/footer) */}
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            
            {/* Protected Dashboard Routes - with header/footer */}
            <Route element={<PublicLayout />}>
              <Route path="/dashboard/tenant" element={
                <ProtectedRoute allowedRoles={["tenant"]}>
                  <TenantDashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile/setup" element={
                <ProtectedRoute allowedRoles={["tenant"]}>
                  <TenantProfileSetup />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/landlord" element={
                <ProtectedRoute allowedRoles={["landlord"]}>
                  <LandlordDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/agent" element={
                <ProtectedRoute allowedRoles={["agent"]}>
                  <AgentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/affiliate" element={
                <ProtectedRoute allowedRoles={["affiliate"]}>
                  <AffiliateDashboard />
                </ProtectedRoute>
              } />
              <Route path="/affiliate" element={
                <ProtectedRoute allowedRoles={["tenant", "landlord", "agent", "admin", "affiliate"]}>
                  <AffiliateDashboard />
                </ProtectedRoute>
              } />
              
              {/* Property Management Routes */}
              <Route path="/property/create" element={
                <ProtectedRoute allowedRoles={["landlord", "agent"]}>
                  <CreateListingPage />
                </ProtectedRoute>
              } />
              <Route path="/property/:id/edit" element={
                <ProtectedRoute allowedRoles={["landlord", "agent"]}>
                  <EditPropertyPage />
                </ProtectedRoute>
              } />
              <Route path="/my-properties" element={
                <ProtectedRoute allowedRoles={["landlord", "agent"]}>
                  <MyPropertiesPage />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute allowedRoles={["tenant", "landlord", "agent"]}>
                  <MessagesPage />
                </ProtectedRoute>
              } />
              <Route path="/chat-rooms" element={
                <ProtectedRoute allowedRoles={["tenant", "landlord", "agent"]}>
                  <ChatRoomsPage />
                </ProtectedRoute>
              } />
              <Route path="/settings/profile" element={
                <ProtectedRoute allowedRoles={["tenant", "landlord", "agent", "admin", "affiliate"]}>
                  <ProfileSettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/saved" element={
                <ProtectedRoute allowedRoles={["tenant", "landlord", "agent"]}>
                  <SavedPropertiesPage />
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute allowedRoles={["tenant", "landlord", "agent", "admin", "affiliate"]}>
                  <NotificationsPage />
                </ProtectedRoute>
              } />
            </Route>

            {/* Admin Routes - with sidebar layout */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminOverviewPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="approvals" element={<AdminApprovalsPage />} />
              <Route path="role-requests" element={<AdminRoleRequestsPage />} />
              <Route path="properties" element={<AdminPropertiesPage />} />
              <Route path="verifications" element={<AdminVerificationsPage />} />
              <Route path="applications" element={<AdminApplicationsPage />} />
              <Route path="announcements" element={<AdminAnnouncementsPage />} />
              <Route path="activity" element={<AdminActivityPage />} />
              <Route path="affiliates" element={<AdminAffiliatesPage />} />
            </Route>
            
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ComparisonProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
