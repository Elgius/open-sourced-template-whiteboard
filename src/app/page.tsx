import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Palette,
  Save,
  Share2,
  Zap,
  Users,
  Smartphone,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Whiteboard by Elgius
            </span>
          </div>
          <Link href="/whiteboard">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Launch App
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your Ideas,
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}
              Unlimited Canvas
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Create, collaborate, and bring your ideas to life with our powerful
            whiteboard. Perfect for brainstorming, teaching, planning, and
            visual thinking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/whiteboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3"
              >
                Start Creating
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to visualize ideas
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful tools and intuitive design make it easy to create stunning
            visual content
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="p-6 hover:shadow-lg transition-shadow border-0 bg-white/60 backdrop-blur-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Palette className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Rich Drawing Tools
            </h3>
            <p className="text-gray-600">
              Pen, shapes, text, and more. Customize colors, stroke width, and
              styles to match your vision.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-0 bg-white/60 backdrop-blur-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Save className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Auto-Save & Sync
            </h3>
            <p className="text-gray-600">
              Never lose your work. Automatic saving ensures your creations are
              always protected.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-0 bg-white/60 backdrop-blur-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Lightning Fast
            </h3>
            <p className="text-gray-600">
              Smooth, responsive drawing experience with real-time rendering and
              minimal latency.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-0 bg-white/60 backdrop-blur-sm">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Team Collaboration
            </h3>
            <p className="text-gray-600">
              Work together in real-time. Perfect for remote teams, classrooms,
              and workshops.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-0 bg-white/60 backdrop-blur-sm">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Cross-Platform
            </h3>
            <p className="text-gray-600">
              Works seamlessly across desktop, tablet, and mobile devices.
              Create anywhere, anytime.
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow border-0 bg-white/60 backdrop-blur-sm">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
              <Share2 className="w-6 h-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Easy Sharing
            </h3>
            <p className="text-gray-600">
              Share your boards instantly with team members, students, or
              clients with a simple link.
            </p>
          </Card>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-r from-gray-50 to-gray-100 rounded-3xl mx-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Perfect for every use case
          </h2>
          <p className="text-lg text-gray-600">
            From education to business, our whiteboard adapts to your needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Education",
              desc: "Interactive lessons and student engagement",
            },
            {
              title: "Business",
              desc: "Strategy sessions and project planning",
            },
            { title: "Design", desc: "Wireframing and creative brainstorming" },
            {
              title: "Remote Work",
              desc: "Virtual meetings and collaboration",
            },
          ].map((useCase, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {useCase.title}
              </h3>
              <p className="text-gray-600">{useCase.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to bring your ideas to life?
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            Join thousands of creators, educators, and teams who trust our
            whiteboard for their visual collaboration needs.
          </p>
          <Link href="/whiteboard">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-12 py-4"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <Palette className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">Whiteboard</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2024 Whiteboard. Built with Next.js and creativity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
