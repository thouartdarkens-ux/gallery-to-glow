import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";

const LandingPage = () => {
  const [days, setDays] = useState(140);
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(34);
  const [seconds, setSeconds] = useState(29);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => {
        if (prev === 0) {
          setMinutes(prev => {
            if (prev === 0) {
              setHours(prev => {
                if (prev === 0) {
                  setDays(prev => prev - 1);
                  return 23;
                }
                return prev - 1;
              });
              return 59;
            }
            return prev - 1;
          });
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      <Header />

      <div
        className="relative w-full py-20 px-4 bg-cover bg-center"
        style={{ backgroundImage: 'url(/Background%20(1).jpg)' }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Your Campus Marketplace<br />in Your Pocket.
          </h1>
          <p className="text-lg text-white/90 mb-8">
            Launches on January 14, 2026.
          </p>

          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-lg">
              <div className="text-3xl font-bold text-white">{String(days).padStart(3, '0')}</div>
              <div className="text-xs text-white/80 uppercase">Days</div>
            </div>
            <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-lg">
              <div className="text-3xl font-bold text-white">{String(hours).padStart(2, '0')}</div>
              <div className="text-xs text-white/80 uppercase">Hours</div>
            </div>
            <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-lg">
              <div className="text-3xl font-bold text-white">{String(minutes).padStart(2, '0')}</div>
              <div className="text-xs text-white/80 uppercase">Minutes</div>
            </div>
            <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-lg">
              <div className="text-3xl font-bold text-white">{String(seconds).padStart(2, '0')}</div>
              <div className="text-xs text-white/80 uppercase">Seconds</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <input
              type="email"
              placeholder="Enter your email address"
              className="px-6 py-3 rounded-lg text-gray-900 flex-1 max-w-xs"
            />
            <Button className="bg-amber-700 hover:bg-amber-800 text-white px-8">
              Join Hallway
            </Button>
          </div>

          <div className="flex justify-center gap-4 text-white text-sm">
            <a href="#" className="hover:underline">Terms</a>
            <span>•</span>
            <a href="#" className="hover:underline">Privacy</a>
          </div>
        </div>
      </div>

      <div className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center gap-8 mb-16 text-center text-gray-600">
            <div>
              <div className="text-3xl font-bold text-amber-700 mb-2">500K+</div>
              <p>Students</p>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-700 mb-2">$2M+</div>
              <p>Transactions</p>
            </div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Designed To Help<br />Students Thrive
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            More than just a marketplace—it's a movement to support student success.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-xl border border-amber-100 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-amber-700 rounded-full flex items-center justify-center mb-4">
                <Star className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Empower Student Projects</h3>
              <p className="text-gray-600">Support innovative student-led initiatives and bring ideas to life.</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-xl border border-amber-100 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-amber-700 rounded-full flex items-center justify-center mb-4">
                <Star className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Build a Student-First Marketplace</h3>
              <p className="text-gray-600">A platform designed by students, for students, with their needs first.</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-white p-8 rounded-xl border border-amber-100 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-amber-700 rounded-full flex items-center justify-center mb-4">
                <Star className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Create Opportunities to Earn</h3>
              <p className="text-gray-600">Multiple ways for students to monetize their skills and talents.</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-white rounded-2xl p-12 border border-amber-100">
            <h2 className="text-4xl font-bold text-center mb-4">
              Your Marketplace, Built for Students Who Want<br />More Than Just Shopping
            </h2>
            <p className="text-center text-gray-600 max-w-2xl mx-auto">
              Hallway is redefining the student commerce space by focusing on empowerment, community, and real value.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h2 className="text-4xl font-bold mb-4">
                Save More on Every Purchase<br />You Make with Hallway
              </h2>
              <p className="text-gray-600 mb-8">
                Get exclusive deals, cashback rewards, and discounts tailored just for students. Shop smarter, save more.
              </p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Exclusive Discounts</h4>
                    <p className="text-sm text-gray-600">Student-only deals from trusted brands</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Cashback Rewards</h4>
                    <p className="text-sm text-gray-600">Earn cash back on every purchase</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Bundle Savings</h4>
                    <p className="text-sm text-gray-600">Save even more when you buy together</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-amber-100 h-96 rounded-2xl"></div>
          </div>

          <div className="bg-amber-700 text-white rounded-2xl p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">What Students Are Saying</h2>
            <p className="max-w-2xl mx-auto mb-12">
              Join thousands of students who are already part of the Hallway community.
            </p>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white/10 p-6 rounded-xl text-left">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-300">★</span>
                  ))}
                </div>
                <p className="text-sm mb-4">"Excellent platform for finding unique student-made products!"</p>
                <p className="font-semibold text-sm">Sarah K.</p>
              </div>
              <div className="bg-white/10 p-6 rounded-xl text-left">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-300">★</span>
                  ))}
                </div>
                <p className="text-sm mb-4">"Amazing way to earn money while helping other students!"</p>
                <p className="font-semibold text-sm">Alex R.</p>
              </div>
              <div className="bg-white/10 p-6 rounded-xl text-left">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-300">★</span>
                  ))}
                </div>
                <p className="text-sm mb-4">"So impressed with the community and support here."</p>
                <p className="font-semibold text-sm">Jordan M.</p>
              </div>
              <div className="bg-white/10 p-6 rounded-xl text-left">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-300">★</span>
                  ))}
                </div>
                <p className="text-sm mb-4">"The best platform for student entrepreneurs. Highly recommend!"</p>
                <p className="font-semibold text-sm">Taylor L.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12">Frequently Asked Questions</h2>

          <div className="space-y-6 max-w-3xl">
            <details className="border-b pb-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-semibold text-lg">
                What is Hallway?
                <ChevronRight className="group-open:rotate-90 transition" size={20} />
              </summary>
              <p className="text-gray-600 mt-4">
                Hallway is a student-first marketplace designed to empower students to buy, sell, and support projects in one place.
              </p>
            </details>
            <details className="border-b pb-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-semibold text-lg">
                Why join Hallway?
                <ChevronRight className="group-open:rotate-90 transition" size={20} />
              </summary>
              <p className="text-gray-600 mt-4">
                Join Hallway to access exclusive discounts, earn money, support student projects, and be part of a thriving student community.
              </p>
            </details>
            <details className="border-b pb-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-semibold text-lg">
                How do I get a product?
                <ChevronRight className="group-open:rotate-90 transition" size={20} />
              </summary>
              <p className="text-gray-600 mt-4">
                Browse our marketplace, find products you love, and purchase them directly. It's that simple!
              </p>
            </details>
            <details className="border-b pb-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-semibold text-lg">
                How do I apply to be a vendor?
                <ChevronRight className="group-open:rotate-90 transition" size={20} />
              </summary>
              <p className="text-gray-600 mt-4">
                Fill out our vendor application form and our team will review it. We're looking for creative student entrepreneurs!
              </p>
            </details>
            <details className="border-b pb-6 cursor-pointer group">
              <summary className="flex justify-between items-center font-semibold text-lg">
                Is my data safe on Hallway?
                <ChevronRight className="group-open:rotate-90 transition" size={20} />
              </summary>
              <p className="text-gray-600 mt-4">
                Yes! We use industry-standard encryption and security protocols to protect your data.
              </p>
            </details>
          </div>
        </div>
      </div>

      <div
        className="relative w-full py-20 px-4 bg-cover bg-center"
        style={{ backgroundImage: 'url(/Background%20(1).jpg)' }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Don't miss launch day.
          </h2>

          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-lg">
              <div className="text-3xl font-bold text-white">{String(days).padStart(3, '0')}</div>
              <div className="text-xs text-white/80 uppercase">Days</div>
            </div>
            <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-lg">
              <div className="text-3xl font-bold text-white">{String(hours).padStart(2, '0')}</div>
              <div className="text-xs text-white/80 uppercase">Hours</div>
            </div>
            <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-lg">
              <div className="text-3xl font-bold text-white">{String(minutes).padStart(2, '0')}</div>
              <div className="text-xs text-white/80 uppercase">Minutes</div>
            </div>
            <div className="bg-white/20 backdrop-blur px-6 py-3 rounded-lg">
              <div className="text-3xl font-bold text-white">{String(seconds).padStart(2, '0')}</div>
              <div className="text-xs text-white/80 uppercase">Seconds</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Enter your email address"
              className="px-6 py-3 rounded-lg text-gray-900 flex-1 max-w-xs"
            />
            <Button className="bg-white text-amber-700 hover:bg-gray-100 px-8 font-semibold">
              Join Hallway
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;
