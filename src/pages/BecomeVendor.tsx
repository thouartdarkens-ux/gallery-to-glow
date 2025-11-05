import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Smile, Target, MessageCircle, Users, Check } from "lucide-react";
import { useState, useEffect } from "react";

const BecomeVendor = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 140,
    hours: 1,
    minutes: 34,
    seconds: 25
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const testimonials = [
    {
      name: "Excellent!",
      rating: 5,
      text: "The platform has completely transformed how I manage my student business. Simple, efficient, and reliable for all my needs.",
      author: "Sarah M."
    },
    {
      name: "Amazing work!",
      rating: 5,
      text: "I've tried other platforms, but nothing compares to the support and features available here. Highly recommend!",
      author: "John Doe"
    },
    {
      name: "Impressed!",
      rating: 5,
      text: "As a student entrepreneur, finding the right platform was challenging. This made selling incredibly easy and profitable.",
      author: "Mike R."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground">
              Turn your <span className="italic text-accent">ideas</span> into<br />
              income
            </h1>
            <p className="text-xl text-muted-foreground">
              Join 1000+ students who are already turning their ideas into a full-fledged business.
            </p>
            
            {/* Countdown Timer */}
            <div className="flex gap-4 justify-center">
              {[
                { value: timeLeft.days, label: 'DAYS' },
                { value: timeLeft.hours, label: 'HRS' },
                { value: timeLeft.minutes, label: 'MIN' },
                { value: timeLeft.seconds, label: 'SEC' }
              ].map((item, idx) => (
                <div key={idx} className="bg-card border border-border rounded-lg p-4 min-w-[80px]">
                  <div className="text-3xl font-bold text-foreground">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-center">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-3 rounded-lg bg-card border border-input w-64"
              />
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-8 border-y border-border">
        <div className="container mx-auto">
          <p className="text-center text-muted-foreground mb-4">Sponsors</p>
          <div className="flex gap-8 justify-center items-center opacity-50">
            <div className="w-24 h-12 bg-muted rounded"></div>
            <div className="w-24 h-12 bg-muted rounded"></div>
            <div className="w-24 h-12 bg-muted rounded"></div>
          </div>
        </div>
      </section>

      {/* Why Sell Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-foreground mb-12 text-center">
            Why Sell On <span className="italic">Hallway?</span>
          </h2>

          <div className="max-w-5xl mx-auto space-y-12">
            {/* Mock UI Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-accent/10"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-48"></div>
                </div>
              </div>
              <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-center font-semibold">
                Start Selling Today
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Smile className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Keep it simple. Stay true to your brand
                </h3>
                <p className="text-muted-foreground">
                  Hallway gives you the tools to create your own branded storefront without the complexity. 
                  Focus on what you do best while we handle the technical details.
                </p>
              </Card>

              <Card className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Reach new, key targets
                </h3>
                <p className="text-muted-foreground">
                  Connect with thousands of students actively looking for products and services like yours. 
                  Our platform is built specifically for the student market.
                </p>
              </Card>

              <Card className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Get seller, 24/7 customer support
                </h3>
                <p className="text-muted-foreground">
                  Our dedicated support team is always here to help you succeed. From setup to sales, 
                  we're with you every step of the way.
                </p>
              </Card>

              <Card className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Join as we unite beginners
                </h3>
                <p className="text-muted-foreground">
                  Be part of a community that celebrates student entrepreneurship. Learn from others, 
                  share your experiences, and grow together.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Vendor Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-6 mb-12">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
              <div className="w-8 h-8 rounded-full bg-accent"></div>
            </div>
            <h2 className="text-4xl font-bold text-foreground">
              Become a Hallway Vendor
            </h2>
            <p className="text-muted-foreground">
              If you are a student, have an idea for an established business and want to scale and sell online, 
              Hallway is for you.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-2">Basic Information</h3>
              <p className="text-sm text-muted-foreground">
                Valid student ID, business registration (if applicable), and contact information.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-2">Product Details</h3>
              <p className="text-sm text-muted-foreground">
                Clear product descriptions, high-quality images, and competitive pricing strategy.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-2">Store Setup</h3>
              <p className="text-sm text-muted-foreground">
                Create your branded storefront with our easy-to-use tools and templates.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-2">Start Selling</h3>
              <p className="text-sm text-muted-foreground">
                Launch your store and start reaching thousands of potential customers today.
              </p>
            </Card>

            <div className="text-center pt-4">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Apply
              </Button>
            </div>
          </div>

          {/* Decorative Image */}
          <div className="mt-12 max-w-md mx-auto">
            <div className="aspect-square bg-card/50 rounded-xl"></div>
          </div>
        </div>
      </section>

      {/* Student Success Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Student <span className="italic text-accent">Success</span> & <span className="italic text-accent">Trust</span> Section
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from students who have transformed their ideas into thriving businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-accent/10"></div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-accent text-sm">★★★★★</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{testimonial.text}</p>
                <div className="text-xs text-muted-foreground">— {testimonial.author}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-foreground mb-12">
            Frequently asked questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "What can I sell on Hallway?",
                a: "You can sell physical products, digital goods, services, and more. From handmade crafts to tutoring services, if it's legal and relevant to students, you can sell it."
              },
              {
                q: "How do I get paid?",
                a: "Payments are processed securely and deposited directly to your linked bank account or payment method within 2-3 business days."
              },
              {
                q: "Are there any fees to get started?",
                a: "Signing up is completely free. We only take a small commission on successful sales to keep the platform running."
              },
              {
                q: "Do I need to have a tax ID?",
                a: "For most small-scale operations, a student ID is sufficient. However, for larger businesses, proper registration may be required."
              },
              {
                q: "Why should I join this platform?",
                a: "Hallway is built specifically for student entrepreneurs. You'll get access to a targeted audience, powerful tools, and a supportive community."
              }
            ].map((faq, idx) => (
              <Card key={idx} className="p-6">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>

          <div className="mt-8">
            <Button className="bg-primary text-primary-foreground">
              Contact us
            </Button>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="relative py-20 px-4 overflow-hidden" style={{
        background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)'
      }}>
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground">
              Don't miss launch day.
            </h2>
            <p className="text-xl text-primary-foreground/90">
              Stay in the loop today and enjoy perks exclusive to our first sellers.
            </p>
            
            {/* Countdown Timer */}
            <div className="flex gap-4 justify-center">
              {[
                { value: timeLeft.days, label: 'DAYS' },
                { value: timeLeft.hours, label: 'HRS' },
                { value: timeLeft.minutes, label: 'MIN' },
                { value: timeLeft.seconds, label: 'SEC' }
              ].map((item, idx) => (
                <div key={idx} className="bg-card rounded-lg p-4 min-w-[80px]">
                  <div className="text-3xl font-bold text-foreground">{item.value}</div>
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-center">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-3 rounded-lg bg-card border border-border w-64"
              />
              <Button size="lg" className="bg-card text-foreground hover:bg-card/90">
                Join Waitlist
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default BecomeVendor;
