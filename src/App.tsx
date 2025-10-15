import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
          <Route path="/map" element={<Map />} />
          <Route path="/check-in-success" element={<CheckInSuccess />} />
          <Route path="/discovery" element={<Discovery />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<ProfileDetail />} />
          <Route path="/match" element={<MatchScreen />} />
          <Route path="/chat/:id" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
