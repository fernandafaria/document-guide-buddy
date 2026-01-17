import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Map from "./pages/Map";
import ActiveCheckIns from "./pages/ActiveCheckIns";
import CheckInHistory from "./pages/CheckInHistory";
import CheckInSuccess from "./pages/CheckInSuccess";
import Discovery from "./pages/Discovery";
import Filters from "./pages/Filters";
import Matches from "./pages/Matches";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import ProfileDetail from "./pages/ProfileDetail";
import MatchScreen from "./pages/MatchScreen";
import LikeSent from "./pages/LikeSent";
import Likes from "./pages/Likes";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import NotificationSettings from "./pages/NotificationSettings";
import PrivacySettings from "./pages/PrivacySettings";
import AccountSettings from "./pages/AccountSettings";
import HelpSettings from "./pages/HelpSettings";
import Onboarding from "./pages/Onboarding";
import SignupPhotos from "./pages/SignupPhotos";
import SignupInfo from "./pages/SignupInfo";
import SignupInterests from "./pages/SignupInterests";
import EmptyState from "./pages/EmptyState";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup-info" element={<SignupInfo />} />
        <Route path="/signup-interests" element={<SignupInterests />} />
        <Route path="/signup-photos" element={<SignupPhotos />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
        <Route path="/active-checkins" element={<ProtectedRoute><ActiveCheckIns /></ProtectedRoute>} />
        <Route path="/checkin-history" element={<ProtectedRoute><CheckInHistory /></ProtectedRoute>} />
        <Route path="/check-in-success" element={<ProtectedRoute><CheckInSuccess /></ProtectedRoute>} />
        <Route path="/discovery" element={<ProtectedRoute><Discovery /></ProtectedRoute>} />
        <Route path="/filters" element={<ProtectedRoute><Filters /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
        <Route path="/likes" element={<ProtectedRoute><Likes /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><ProfileDetail /></ProtectedRoute>} />
        <Route path="/match" element={<ProtectedRoute><MatchScreen /></ProtectedRoute>} />
        <Route path="/like-sent" element={<ProtectedRoute><LikeSent /></ProtectedRoute>} />
        <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
        <Route path="/settings/privacy" element={<ProtectedRoute><PrivacySettings /></ProtectedRoute>} />
        <Route path="/settings/account" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
        <Route path="/settings/help" element={<ProtectedRoute><HelpSettings /></ProtectedRoute>} />
        <Route path="/empty" element={<ProtectedRoute><EmptyState /></ProtectedRoute>} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
