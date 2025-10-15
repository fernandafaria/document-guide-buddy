import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Map from "./pages/Map";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup-info" element={<SignupInfo />} />
          <Route path="/signup-interests" element={<SignupInterests />} />
          <Route path="/signup-photos" element={<SignupPhotos />} />
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><Map /></ProtectedRoute>} />
          <Route path="/check-in-success" element={<ProtectedRoute><CheckInSuccess /></ProtectedRoute>} />
          <Route path="/discovery" element={<ProtectedRoute><Discovery /></ProtectedRoute>} />
          <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><ProfileDetail /></ProtectedRoute>} />
          <Route path="/match" element={<ProtectedRoute><MatchScreen /></ProtectedRoute>} />
          <Route path="/chat/:id" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/empty" element={<ProtectedRoute><EmptyState /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
