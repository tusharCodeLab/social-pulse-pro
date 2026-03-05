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
  Instagram,
  Youtube,
  Facebook,
  Users,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

const features = [
  {
    icon: BarChart3,
    title: "Multi-Platform Analytics",
    description: "Track likes, comments, reach, and engagement across Instagram, YouTube, and Facebook in one dashboard."
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Get personalized recommendations from AI to improve your content strategy across all platforms."
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

const stats = [
  { value: 3, suffix: "", label: "Platforms Supported", icon: Zap },
  { value: 6, suffix: "+", label: "AI-Powered Features", icon: Brain },
  { value: 100, suffix: "%", label: "Free to Use", icon: CheckCircle2 },
  { value: 24, suffix: "/7", label: "Real-Time Analytics", icon: BarChart3 },
];

const steps = [
  { step: "01", title: "Connect Your Accounts", description: "Link your Instagram, YouTube, and Facebook accounts in one click." },
  { step: "02", title: "AI Analyzes Your Data", description: "Our AI engine processes your posts, comments, and engagement patterns." },
  { step: "03", title: "Get Actionable Insights", description: "Receive personalized recommendations, trend alerts, and optimal posting times." },
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

          {/* Animated Stats Strip */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="text-center p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm"
              >
                <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  <AnimatedCounter value={stat.value} duration={1.5} />
                  <span>{stat.suffix}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Platform Logo Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 flex items-center justify-center gap-8"
          >
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Supported Platforms</span>
            {[
              { icon: Instagram, color: "text-[#E4405F]", name: "Instagram" },
              { icon: Youtube, color: "text-[#FF0000]", name: "YouTube" },
              { icon: Facebook, color: "text-[#1877F2]", name: "Facebook" },
            ].map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 + i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 border border-border/50"
              >
                <p.icon className={`w-5 h-5 ${p.color}`} />
                <span className="text-sm font-medium text-foreground">{p.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview Mockup */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl p-6 shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-chart-impressions/60" />
              <div className="w-3 h-3 rounded-full bg-chart-sentiment-positive/60" />
              <span className="ml-4 text-xs text-muted-foreground">SocialPulse Dashboard</span>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: "Total Followers", value: "24.8K", change: "+12.3%" },
                { label: "Engagement Rate", value: "4.7%", change: "+0.8%" },
                { label: "Total Reach", value: "182K", change: "+23.1%" },
                { label: "AI Score", value: "87/100", change: "+5pts" },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="rounded-xl bg-muted/30 border border-border/40 p-4"
                >
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{card.label}</p>
                  <p className="text-xl font-bold text-foreground mt-1">{card.value}</p>
                  <p className="text-xs text-chart-sentiment-positive mt-1">{card.change}</p>
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 rounded-xl bg-muted/20 border border-border/40 p-4 h-32 flex items-end gap-1">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                    className="flex-1 rounded-sm bg-gradient-to-t from-primary to-primary/40"
                  />
                ))}
              </div>
              <div className="rounded-xl bg-muted/20 border border-border/40 p-4 flex flex-col justify-center items-center">
                <div className="w-20 h-20 rounded-full border-4 border-primary/30 flex items-center justify-center relative">
                  <motion.div
                    initial={{ rotate: 0 }}
                    whileInView={{ rotate: 270 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary"
                  />
                  <span className="text-lg font-bold text-foreground">75%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">Positive Sentiment</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                viewport={{ once: true }}
                className="text-center relative"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-primary">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px bg-gradient-to-r from-primary/30 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
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
              Real data, real insights — powered by AI across all your platforms
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

      {/* Why SocialPulse */}
      <section className="py-16 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-muted-foreground mb-6">Why creators choose SocialPulse</p>
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {[
                "🔒 100% Free — No hidden fees or subscriptions",
                "🤖 AI-powered insights from your real data",
                "📊 Cross-platform analytics in one dashboard",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="px-5 py-3 rounded-xl bg-card/50 border border-border/50 text-sm text-muted-foreground"
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>
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
