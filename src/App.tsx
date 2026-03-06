import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSettingsStore } from "@/stores/settingsStore";
import { AuthProvider } from "@/contexts/AuthContext";
import { InstagramSyncProvider } from "@/components/InstagramSyncProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import InstagramOverview from "./pages/InstagramOverview";
import PostsAnalysis from "./pages/PostsAnalysis";
import AudienceInsights from "./pages/AudienceInsights";
import Sentiment from "./pages/Sentiment";
import Trends from "./pages/Trends";
import InstagramBestTime from "./pages/InstagramBestTime";
import InstagramContentStudio from "./pages/InstagramContentStudio";

import YouTubeAnalytics from "./pages/YouTubeAnalytics";
import YouTubePostsAnalysis from "./pages/YouTubePostsAnalysis";
import YouTubeAudience from "./pages/YouTubeAudience";
import YouTubeSentiment from "./pages/YouTubeSentiment";
import YouTubeTrends from "./pages/YouTubeTrends";
import FacebookAnalytics from "./pages/FacebookAnalytics";
import FacebookPosts from "./pages/FacebookPosts";
import FacebookAudience from "./pages/FacebookAudience";
import FacebookSentiment from "./pages/FacebookSentiment";
import FacebookTrends from "./pages/FacebookTrends";

import Settings from "./pages/Settings";
import ContentCalendar from "./pages/ContentCalendar";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
  }, [theme]);

  return (
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
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/instagram-overview" element={<InstagramOverview />} />
                <Route path="/posts" element={<PostsAnalysis />} />
                <Route path="/audience" element={<AudienceInsights />} />
                <Route path="/sentiment" element={<Sentiment />} />
                <Route path="/trends" element={<Trends />} />
                <Route path="/instagram-best-time" element={<InstagramBestTime />} />
                <Route path="/instagram-content-studio" element={<InstagramContentStudio />} />
                <Route path="/youtube-analytics" element={<YouTubeAnalytics />} />
                <Route path="/youtube-posts" element={<YouTubePostsAnalysis />} />
                <Route path="/youtube-audience" element={<YouTubeAudience />} />
                <Route path="/youtube-sentiment" element={<YouTubeSentiment />} />
                <Route path="/youtube-trends" element={<YouTubeTrends />} />
                <Route path="/facebook-analytics" element={<FacebookAnalytics />} />
                <Route path="/facebook-posts" element={<FacebookPosts />} />
                <Route path="/facebook-audience" element={<FacebookAudience />} />
                <Route path="/facebook-sentiment" element={<FacebookSentiment />} />
                <Route path="/facebook-trends" element={<FacebookTrends />} />
                <Route path="/content-calendar" element={<ContentCalendar />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </InstagramSyncProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
