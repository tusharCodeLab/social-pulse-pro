import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Brain, 
  Zap, 
  Shield, 
  ArrowRight,
  Sparkles,
  LineChart,
  MessageSquare
} from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Deep insights into your social media performance with real-time metrics and trends."
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Leverage artificial intelligence to uncover hidden patterns and opportunities."
  },
  {
    icon: TrendingUp,
    title: "Trend Detection",
    description: "Stay ahead with automatic detection of emerging trends in your niche."
  },
  {
    icon: MessageSquare,
    title: "Sentiment Analysis",
    description: "Understand how your audience feels about your content and brand."
  },
  {
    icon: Users,
    title: "Audience Intelligence",
    description: "Know your audience demographics, behaviors, and peak engagement times."
  },
  {
    icon: Zap,
    title: "Best Time to Post",
    description: "Optimize your posting schedule based on when your audience is most active."
  }
];

const stats = [
  { value: "10M+", label: "Posts Analyzed" },
  { value: "500K+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
  { value: "150+", label: "Countries" }
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
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background Effects */}
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
              <span className="text-sm text-primary font-medium">AI-Powered Social Analytics</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-foreground">Transform Your</span>
              <br />
              <span className="gradient-text">Social Media Strategy</span>
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Unlock powerful insights with advanced AI analytics. Understand your audience, 
              track sentiment, and grow your social presence like never before.
            </p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/auth?mode=signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 h-14 text-lg">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="border-border hover:bg-accent px-8 h-14 text-lg">
                  View Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
            <div className="rounded-2xl border border-border overflow-hidden shadow-2xl bg-card">
              <div className="aspect-video bg-gradient-to-br from-card to-muted p-8 relative">
                {/* Mock Dashboard Preview */}
                <div className="grid grid-cols-4 gap-4 h-full opacity-80">
                  <div className="col-span-1 space-y-4">
                    <div className="h-8 bg-muted rounded-lg shimmer" />
                    <div className="h-6 bg-muted rounded-lg w-3/4 shimmer" />
                    <div className="h-6 bg-muted rounded-lg w-1/2 shimmer" />
                    <div className="h-6 bg-muted rounded-lg w-2/3 shimmer" />
                  </div>
                  <div className="col-span-3 grid grid-cols-3 gap-4">
                    <div className="metric-card rounded-xl p-4">
                      <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                      <div className="h-8 bg-primary/20 rounded w-3/4" />
                    </div>
                    <div className="metric-card rounded-xl p-4">
                      <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                      <div className="h-8 bg-purple-500/20 rounded w-3/4" />
                    </div>
                    <div className="metric-card rounded-xl p-4">
                      <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                      <div className="h-8 bg-amber-500/20 rounded w-3/4" />
                    </div>
                    <div className="col-span-2 metric-card rounded-xl p-4">
                      <div className="h-full flex items-end gap-2">
                        {[40, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                          <div key={i} className="flex-1 bg-primary/30 rounded-t" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="metric-card rounded-xl p-4">
                      <div className="h-full flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin" style={{ animationDuration: '3s' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-y border-border bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Everything You Need to
              <span className="gradient-text"> Succeed</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools and insights to elevate your social media game
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

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-primary/5" />
            <div className="absolute inset-0 bg-card/80 backdrop-blur-xl" />
            
            <div className="relative p-12 md:p-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">14-Day Free Trial</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
                Ready to Boost Your
                <br />
                <span className="gradient-text">Social Media Presence?</span>
              </h2>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Join thousands of marketers and creators who trust SocialPulse 
                for their analytics needs.
              </p>
              
              <Link to="/auth?mode=signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 h-14 text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
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
          <p className="text-muted-foreground text-sm">
            © 2024 SocialPulse. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
