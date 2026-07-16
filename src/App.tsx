import { lazy, Suspense, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const HowItWorksPage = lazy(() => import("./pages/HowItWorksPage"));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage"));
const FAQsPage = lazy(() => import("./pages/FAQsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const SmartAdvisorPage = lazy(() => import("./pages/SmartAdvisorPage"));
const PropertyDetailPage = lazy(() => import("./pages/PropertyDetailPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const TenantDashboard = lazy(() => import("./pages/dashboards/TenantDashboard"));
const TenantProfileSetup = lazy(() => import("./pages/TenantProfileSetup"));
const LandlordDashboard = lazy(() => import("./pages/dashboards/LandlordDashboard"));
const AgentDashboard = lazy(() => import("./pages/dashboards/AgentDashboard"));
const AffiliateDashboard = lazy(() => import("./pages/dashboards/AffiliateDashboard"));
const ApplicationsPage = lazy(() => import("./pages/ApplicationsPage"));
const CreateListingPage = lazy(() => import("./pages/CreateListingPage"));
const EditPropertyPage = lazy(() => import("./pages/EditPropertyPage"));
const MyPropertiesPage = lazy(() => import("./pages/MyPropertiesPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));
const ChatRoomsPage = lazy(() => import("./pages/ChatRoomsPage"));
const ProfileSettingsPage = lazy(() => import("./pages/ProfileSettingsPage"));
const SavedPropertiesPage = lazy(() => import("./pages/SavedPropertiesPage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const AdminOverviewPage = lazy(() => import("./pages/admin/AdminOverviewPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminApprovalsPage = lazy(() => import("./pages/admin/AdminApprovalsPage"));
const AdminRoleRequestsPage = lazy(() => import("./pages/admin/AdminRoleRequestsPage"));
const AdminRoleAuditPage = lazy(() => import("./pages/admin/AdminRoleAuditPage"));
const AdminPropertiesPage = lazy(() => import("./pages/admin/AdminPropertiesPage"));
const AdminVerificationsPage = lazy(() => import("./pages/admin/AdminVerificationsPage"));
const AdminApplicationsPage = lazy(() => import("./pages/admin/AdminApplicationsPage"));
const AdminAnnouncementsPage = lazy(() => import("./pages/admin/AdminAnnouncementsPage"));
const AdminActivityPage = lazy(() => import("./pages/admin/AdminActivityPage"));
const AdminAffiliatesPage = lazy(() => import("./pages/admin/AdminAffiliatesPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading page">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function Protected({ roles, children }: { roles: Parameters<typeof ProtectedRoute>[0]["allowedRoles"]; children: ReactNode }) {
  return <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ComparisonProvider>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/faqs" element={<FAQsPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/advisor" element={<SmartAdvisorPage />} />
                    <Route path="/property/:id" element={<PropertyDetailPage />} />
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                  </Route>

                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />

                  <Route element={<PublicLayout />}>
                    <Route path="/dashboard/tenant" element={<Protected roles={["tenant"]}><TenantDashboard /></Protected>} />
                    <Route path="/profile/setup" element={<Protected roles={["tenant"]}><TenantProfileSetup /></Protected>} />
                    <Route path="/dashboard/landlord" element={<Protected roles={["landlord"]}><LandlordDashboard /></Protected>} />
                    <Route path="/dashboard/agent" element={<Protected roles={["agent"]}><AgentDashboard /></Protected>} />
                    <Route path="/dashboard/affiliate" element={<Protected roles={["affiliate"]}><AffiliateDashboard /></Protected>} />
                    <Route path="/affiliate" element={<Protected roles={["tenant", "landlord", "agent", "admin", "affiliate"]}><AffiliateDashboard /></Protected>} />
                    <Route path="/applications" element={<Protected roles={["tenant"]}><ApplicationsPage /></Protected>} />
                    <Route path="/property/create" element={<Protected roles={["landlord", "agent"]}><CreateListingPage /></Protected>} />
                    <Route path="/property/:id/edit" element={<Protected roles={["landlord", "agent"]}><EditPropertyPage /></Protected>} />
                    <Route path="/my-properties" element={<Protected roles={["landlord", "agent"]}><MyPropertiesPage /></Protected>} />
                    <Route path="/messages" element={<Protected roles={["tenant", "landlord", "agent"]}><MessagesPage /></Protected>} />
                    <Route path="/chat-rooms" element={<Protected roles={["tenant", "landlord", "agent"]}><ChatRoomsPage /></Protected>} />
                    <Route path="/settings/profile" element={<Protected roles={["tenant", "landlord", "agent", "admin", "affiliate"]}><ProfileSettingsPage /></Protected>} />
                    <Route path="/saved" element={<Protected roles={["tenant", "landlord", "agent"]}><SavedPropertiesPage /></Protected>} />
                    <Route path="/notifications" element={<Protected roles={["tenant", "landlord", "agent", "admin", "affiliate"]}><NotificationsPage /></Protected>} />
                  </Route>

                  <Route path="/admin" element={<Protected roles={["admin"]}><AdminLayout /></Protected>}>
                    <Route index element={<AdminOverviewPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="approvals" element={<AdminApprovalsPage />} />
                    <Route path="role-requests" element={<AdminRoleRequestsPage />} />
                    <Route path="role-audit" element={<AdminRoleAuditPage />} />
                    <Route path="properties" element={<AdminPropertiesPage />} />
                    <Route path="verifications" element={<AdminVerificationsPage />} />
                    <Route path="applications" element={<AdminApplicationsPage />} />
                    <Route path="announcements" element={<AdminAnnouncementsPage />} />
                    <Route path="activity" element={<AdminActivityPage />} />
                    <Route path="affiliates" element={<AdminAffiliatesPage />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ComparisonProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
