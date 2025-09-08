'use client'

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, Users, TrendingUp, Award, Sparkles } from "lucide-react";

export default function Home() {
  const { data: session } = useSession();

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Learning",
      description: "Personalized study paths tailored to your learning style and pace."
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Progress Tracking",
      description: "Real-time analytics to monitor your improvement and identify weak areas."
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Smart Assessment",
      description: "Adaptive testing that adjusts difficulty based on your performance."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Community Learning",
      description: "Connect with fellow students and learn together."
    }
  ];

  const stats = [
    { number: "100+", label: "Active Students" },
    { number: "5k+", label: "Questions Solved" },
    { number: "95%", label: "Success Rate" },
    { number: "24/7", label: "AI Support" }
  ];

  return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Gradient Orbs */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-black/5 to-transparent dark:from-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-l from-black/5 to-transparent dark:from-white/5 rounded-full blur-3xl" />

          <div className="relative container mx-auto px-6 pt-20 pb-32">
            <div className="max-w-4xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 mb-8">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">AI-Powered Exam Preparation</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                Master Your{" "}
                <span className="relative">
                Exams
                <div className="absolute bottom-2 left-0 right-0 h-3 bg-black/10 dark:bg-white/10 -rotate-1 rounded" />
              </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                Revolutionize your study experience with AI-driven personalization,
                smart analytics, and adaptive learning that grows with you.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                {session ? (
                    <Link
                        href="/chat"
                        className="group inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Continue Learning
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                ) : (
                    <>
                      <Link
                          href="/signin"
                          className="group inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Get Started Free
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <button className="inline-flex items-center gap-2 px-8 py-4 border border-black/20 dark:border-white/20 rounded-full font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        Watch Demo
                      </button>
                    </>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
                {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-3xl font-bold mb-1">{stat.number}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold mb-4">
                Why Choose KMF.AI?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Experience the future of exam preparation with cutting-edge AI technology
                and personalized learning paths.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                  <div
                      key={index}
                      className="group p-8 rounded-2xl border border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-32 bg-gray-50 dark:bg-gray-950">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-8">
                Trusted by Students Country Wide
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
                Join the successful students who have improved their grades
                and achieved their academic goals with KMF.AI.
              </p>

              {/* Testimonial */}
              <div className="bg-white dark:bg-black rounded-2xl p-8 border border-black/10 dark:border-white/10 mb-12">
                <div className="flex items-center justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-5 h-5 bg-black dark:bg-white rounded-full mr-1" />
                  ))}
                </div>
                <blockquote className="text-lg mb-6">
                  &#34;KMF completely transformed my study routine. The AI-powered questions
                  helped me identify my weak areas and improve my scores by 40%.&#34;
                </blockquote>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-800 rounded-full" />
                  <div>
                    <div className="font-semibold">James Gatonye</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Form 4 Student</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Excel in Your Exams?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
                Start your journey to academic excellence today. No credit card required.
              </p>

              {!session && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/signin"
                        className="group inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black rounded-full font-semibold hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Start Free Trial
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button className="inline-flex items-center gap-2 px-8 py-4 border border-black/20 dark:border-white/20 rounded-full font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      Learn More
                    </button>
                  </div>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-black/10 dark:border-white/10">
          <div className="container mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">KMF.AI</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  © 2024 KMF.AI. All rights reserved.
                </div>
              </div>

              <div className="flex gap-8">
                <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
}