import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Lightbulb, Store, TrendingUp, Check, Shield, Zap, Heart } from "lucide-react";
import { useState, useEffect } from "react";

const Index = () => {
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
      name: "Freelance",
      rating: 5,
      text: "Highly recommend! I would recommend anyone who has products to sell to use this platform. It's user-friendly and effective.",
      author: "Sarah J."
    },
    {
      name: "Excellent",
      rating: 5,
      text: "The platform has completely transformed how I manage my student business. Simple, efficient, and reliable.",
      author: "Kevin P."
    },
    {
      name: "Impressed!",
      rating: 5,
      text: "As a student entrepreneur, finding the right platform was challenging. Hallway made it incredibly easy to start selling.",
      author: "Mike R."
    },
    {
      name: "Amazing work!",
      rating: 5,
      text: "The support team is responsive and the features are exactly what student sellers need. Couldn't be happier!",
      author: "John Doe"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden" style={{
        background: 'linear-gradient(180deg, hsl(var(--hero-gradient-start)) 0%, hsl(var(--hero-gradient-end)) 100%)'
      }}>
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Your Campus <span className="italic" style={{ color: 'hsl(35 40% 45%)' }}>Marketplace</span>,<br />
              in Your Pocket.
            </h1>
            <p className="text-lg text-white/80">
              Launches on January 14, 2026...
            </p>
            
            {/* Countdown Timer */}
            <div className="flex gap-3 justify-center pt-4">
              {[
                { value: timeLeft.days, label: 'Days' },
                { value: timeLeft.hours, label: 'Hrs' },
                { value: timeLeft.minutes, label: 'Mins' },
                { value: timeLeft.seconds, label: 'Secs' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/95 rounded-lg p-3 min-w-[70px] shadow-md">
                  <div className="text-2xl font-bold text-foreground">{item.value}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2.5 rounded-full bg-white/90 border-0 w-64 text-sm placeholder:text-muted-foreground"
              />
              <Button size="lg" className="rounded-full px-6 text-sm" style={{
                backgroundColor: 'hsl(35 35% 40%)',
                color: 'white'
              }}>
                Join The Waitlist
              </Button>
            </div>

            {/* Phone Mockups */}
            <div className="pt-8 flex justify-center gap-3 items-end">
              <div className="w-40 h-80 bg-black/80 rounded-[2rem] border-4 border-gray-700 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl"></div>
                <div className="p-3 pt-8 bg-white h-full">
                  <div className="text-xs text-left mb-2">Merry Christmas, Ivan</div>
                  <div className="text-[8px] mb-2 bg-gray-100 rounded p-1">Search for a product or service...</div>
                  <div className="text-[10px] font-bold mb-1">x-mas sales</div>
                  <div className="grid grid-cols-2 gap-1">
                    <div className="bg-gray-200 rounded h-12"></div>
                    <div className="bg-gray-200 rounded h-12"></div>
                  </div>
                </div>
              </div>
              <div className="w-44 h-[22rem] bg-gradient-to-b from-amber-900 to-amber-950 rounded-[2.5rem] border-4 border-gray-700 relative overflow-hidden shadow-2xl flex items-center justify-center">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-7 bg-black rounded-b-3xl"></div>
                <div className="text-white text-4xl font-bold">H</div>
              </div>
              <div className="w-40 h-80 bg-black/80 rounded-[2rem] border-4 border-gray-700 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-black rounded-b-2xl"></div>
                <div className="p-3 pt-8 bg-white h-full">
                  <div className="text-[10px] font-bold mb-2 text-center">PS5 DualSense Controller</div>
                  <div className="bg-gray-200 rounded h-24 mb-2"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto">
          <p className="text-center text-muted-foreground mb-4">Sponsors</p>
          <div className="flex gap-8 justify-center items-center opacity-50">
            <div className="w-24 h-12 bg-muted rounded"></div>
            <div className="w-24 h-12 bg-muted rounded"></div>
            <div className="w-24 h-12 bg-muted rounded"></div>
          </div>
        </div>
      </section>

      {/* Designed To Help Students Thrive */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Designed To Help<br />Students <span className="italic">Thrive</span>
            </h2>
            <div className="flex gap-6 justify-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>VALUE</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>TRUST</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>SAFETY</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-8 text-center space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <Lightbulb className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Empower Student Projects</h3>
              <p className="text-muted-foreground">
                Give students a platform to showcase their creativity and turn ideas into reality.
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4 hover:shadow-lg transition-shadow bg-accent/5 border-accent/20">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <Store className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Build a Student-First Marketplace</h3>
              <p className="text-muted-foreground">
                A trusted space where students can buy, sell, and support each other's ventures.
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Create Opportunities to Earn</h3>
              <p className="text-muted-foreground">
                Help students gain financial independence while pursuing their passions.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
              Our Mission
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Your Marketplace, Built for Students Who Want<br />
              More Than Just <span className="italic">Shopping</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Hallway isn't just another marketplace — it's a student-first ecosystem designed to empower creativity, 
              foster collaboration, and create real opportunities for financial growth.
            </p>
          </div>

          <div className="mt-12 max-w-2xl mx-auto">
            <div className="aspect-video bg-card rounded-xl shadow-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=500&fit=crop" 
                alt="Students collaborating" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Save More Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
                Benefits
              </div>
              <h2 className="text-4xl font-bold text-foreground">
                Save More on Every <span className="italic text-accent">Purchase</span><br />
                You Make with Hallway
              </h2>
              <p className="text-muted-foreground">
                Discover exclusive deals, student discounts, and cashback rewards that make every purchase more rewarding.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Shield, text: "Secure transactions with buyer protection" },
                  { icon: Zap, text: "Instant notifications for deals and updates" },
                  { icon: Heart, text: "Support fellow student entrepreneurs" },
                  { icon: Check, text: "Easy returns and customer support" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-foreground">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="aspect-square bg-card rounded-xl shadow-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=600&fit=crop" 
                alt="Student using Hallway" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              What <span className="italic">Students</span> Are Saying
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students who have already discovered the power of our marketplace.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
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
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl font-bold text-foreground mb-12">
            Frequently asked questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "What can I sell on Hallway?",
                a: "You can sell a wide range of items including handmade crafts, digital products, services, and more."
              },
              {
                q: "Am I eligible?",
                a: "All currently enrolled students with valid student IDs are eligible to join Hallway."
              },
              {
                q: "How do I become a seller?",
                a: "Simply sign up, verify your student status, and start listing your products or services."
              },
              {
                q: "Is my data secure?",
                a: "Yes, we use industry-standard encryption and security measures to protect your information."
              },
              {
                q: "Why should students use this app?",
                a: "Hallway provides a trusted platform specifically designed for students to buy, sell, and support each other's projects."
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
        background: 'linear-gradient(180deg, hsl(var(--hero-gradient-start)) 0%, hsl(var(--hero-gradient-end)) 100%)'
      }}>
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Don't miss launch day.
            </h2>
            <p className="text-lg text-white/80">
              Stay in the loop today and enjoy perks exclusive to our first users.
            </p>
            
            {/* Countdown Timer */}
            <div className="flex gap-3 justify-center pt-2">
              {[
                { value: timeLeft.days, label: 'Days' },
                { value: timeLeft.hours, label: 'Hrs' },
                { value: timeLeft.minutes, label: 'Mins' },
                { value: timeLeft.seconds, label: 'Secs' }
              ].map((item, idx) => (
                <div key={idx} className="bg-white/95 rounded-lg p-3 min-w-[70px] shadow-md">
                  <div className="text-2xl font-bold text-foreground">{item.value}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <input
                type="email"
                placeholder="Your email address"
                className="px-4 py-2.5 rounded-full bg-white/90 border-0 w-64 text-sm placeholder:text-muted-foreground"
              />
              <Button size="lg" className="rounded-full px-6 text-sm" style={{
                backgroundColor: 'hsl(35 35% 40%)',
                color: 'white'
              }}>
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

export default Index;
