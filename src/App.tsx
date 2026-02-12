import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { InstagramSyncProvider } from "@/components/InstagramSyncProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PostsAnalysis from "./pages/PostsAnalysis";
import AudienceInsights from "./pages/AudienceInsights";
import Sentiment from "./pages/Sentiment";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AITools from "./pages/AITools";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <InstagramSyncProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/posts" element={<ProtectedRoute><PostsAnalysis /></ProtectedRoute>} />
              <Route path="/audience" element={<ProtectedRoute><AudienceInsights /></ProtectedRoute>} />
              <Route path="/sentiment" element={<ProtectedRoute><Sentiment /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/ai-tools" element={<ProtectedRoute><AITools /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </InstagramSyncProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
