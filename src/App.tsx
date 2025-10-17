import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Map from "./pages/Map";
import ActiveCheckIns from "./pages/ActiveCheckIns";
import CheckInHistory from "./pages/CheckInHistory";
import CheckInSuccess from "./pages/CheckInSuccess";
import Discovery from "./pages/Discovery";
import Matches from "./pages/Matches";
import Profile from "./pages/Profile";
import ProfileDetail from "./pages/ProfileDetail";
import MatchScreen from "./pages/MatchScreen";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
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
        <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><ProfileDetail /></ProtectedRoute>} />
        <Route path="/match" element={<ProtectedRoute><MatchScreen /></ProtectedRoute>} />
        <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
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
