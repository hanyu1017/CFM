import Link from 'next/link';
import { Leaf, LayoutDashboard, Brain, FileText, Settings } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      <nav className="glass-effect fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                CFM System
              </span>
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                href="/dashboard"
                className="gradient-primary text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            <Leaf className="w-4 h-4" />
            Carbon Footprint Management
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
            CFM System
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Professional Carbon Management & Monitoring Platform
          </p>
          <Link
            href="/dashboard"
            className="inline-block gradient-primary text-white px-10 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all hover:-translate-y-1"
          >
            Start Now
          </Link>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              href="/dashboard"
              icon={<LayoutDashboard className="w-8 h-8" />}
              title="Dashboard"
              description="Real-time carbon emission monitoring"
            />
            <FeatureCard
              href="/decision-model"
              icon={<Brain className="w-8 h-8" />}
              title="Decision Model"
              description="AI-driven optimization"
            />
            <FeatureCard
              href="/report"
              icon={<FileText className="w-8 h-8" />}
              title="Reports"
              description="Automated report generation"
            />
            <FeatureCard
              href="/settings"
              icon={<Settings className="w-8 h-8" />}
              title="Settings"
              description="System configuration"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ href, icon, title, description }: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="group block">
      <div className="glass-effect rounded-2xl p-6 card-hover h-full">
        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 text-sm">
          {description}
        </p>
      </div>
    </Link>
  );
}
