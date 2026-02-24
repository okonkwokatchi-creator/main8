import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, BarChart3, Users, Receipt, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function Landing() {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    return <Redirect to="/" />;
  }

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="px-6 py-4 border-b border-border/40 backdrop-blur-md sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xl">K</span>
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">Kavid Plans</span>
          </div>
          <Button onClick={handleLogin} className="font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
            Get Started
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Now available for beta access
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground mb-6 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Master your business <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                finances & growth
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
              The all-in-one platform to track sales, manage expenses, and understand your customers. Built for modern entrepreneurs.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              <Button size="lg" onClick={handleLogin} className="h-12 px-8 text-lg rounded-xl shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
                Start for Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-lg rounded-xl">
                View Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-display font-bold mb-4">Everything you need to grow</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Stop using spreadsheets. Switch to a professional dashboard that gives you clarity and control.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={BarChart3}
                title="Real-time Analytics"
                description="Visualize your sales trends, profit margins, and growth with beautiful interactive charts."
              />
              <FeatureCard 
                icon={Receipt}
                title="Expense Tracking"
                description="Log expenses instantly and categorize them to see exactly where your money goes."
              />
              <FeatureCard 
                icon={Users}
                title="Customer Insights"
                description="Understand who your best customers are and keep track of their purchase history."
              />
            </div>
          </div>
        </section>

        {/* Social Proof / Trust */}
        <section className="py-24 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold mb-6">Built for speed and reliability</h2>
              <ul className="space-y-4">
                {[
                  "Secure Google Authentication",
                  "Instant cloud sync across devices",
                  "Export reports to CSV in one click",
                  "Dark mode for late night work",
                  "99.9% uptime guarantee"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Stock image for business/dashboard vibe */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10 border border-border">
              {/* business meeting office workspace */}
              <img 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80" 
                alt="Dashboard Preview" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <p className="text-white font-medium text-lg">"Kavid Plans transformed how I manage my bakery's finances."</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-border/50 text-center text-muted-foreground text-sm">
        <div className="max-w-7xl mx-auto px-6">
          <p>&copy; {new Date().getFullYear()} Kavid Plans. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center mb-4">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold font-display mb-2">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
