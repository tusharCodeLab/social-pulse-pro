import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  ArrowRight,
  Sparkles,
  LineChart,
  MessageSquare,
  Shield,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Multi-Platform Analytics",
    description: "Track likes, comments, reach, and engagement across Instagram, YouTube, and Facebook in one dashboard."
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Get personalized recommendations from Gemini AI to improve your content strategy across all platforms."
  },
  {
    icon: TrendingUp,
    title: "Trend Detection",
    description: "Automatically detect performance trends and content patterns for each connected platform."
  },
  {
    icon: MessageSquare,
    title: "Sentiment Analysis",
    description: "Understand how your audience feels about your content with AI comment analysis on every platform."
  },
  {
    icon: Shield,
    title: "Spam Detection",
    description: "AI-powered spam filter to identify bot comments, phishing, and promotional spam across all channels."
  },
  {
    icon: Clock,
    title: "Best Time to Post",
    description: "Find your optimal posting times based on real engagement data from your posts."
  }
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <LineChart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SocialPulse</span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link to="/auth">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Sign In</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">AI-Powered Social Media Analytics</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-foreground">Understand Your</span>
              <br />
              <span className="gradient-text">Social Media Performance</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Connect Instagram, YouTube, and Facebook — unlock AI-powered analytics with sentiment analysis, 
              trend detection, spam filtering, and optimal posting times.
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/auth?mode=signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-14 text-lg">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              What You Get
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real data, real insights — powered by Gemini AI across all your platforms
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group metric-card rounded-2xl p-6 border border-border animated-border"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-primary/5" />
            <div className="absolute inset-0 bg-card/80 backdrop-blur-xl" />
            
            <div className="relative p-12 md:p-16 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Ready to Grow Your
                <br />
                <span className="gradient-text">Social Media Presence?</span>
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Sign up, connect your accounts, and start getting AI-powered insights in minutes.
              </p>
              
              <Link to="/auth?mode=signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 h-14 text-lg">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <LineChart className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">SocialPulse</span>
          </div>
          <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} SocialPulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
