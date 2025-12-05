import Link from 'next/link';
import Image from 'next/image';
import { LayoutDashboard, Brain, FileText, Settings } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      <nav className="glass-effect fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden">
                <Image
                  src="/images/logo.png"
                  alt="碳智匯"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                碳智匯
              </span>
            </Link>
            <div className="flex space-x-2 sm:space-x-4">
              <Link
                href="/dashboard"
                className="gradient-primary text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base font-medium"
              >
                開始使用
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8 sm:mb-12 flex justify-center">
            <div className="w-32 h-32 sm:w-48 sm:h-48 rounded-full overflow-hidden shadow-2xl">
              <Image
                src="/images/logo.png"
                alt="碳智匯"
                width={192}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 bg-clip-text text-transparent leading-tight">
            碳智匯
          </h1>
          <p className="text-base sm:text-xl md:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto px-4">
            專業的碳排管理與監控平台
          </p>
          <Link
            href="/dashboard"
            className="inline-block gradient-primary text-white px-8 py-3 sm:px-10 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0"
          >
            立即開始
          </Link>
        </div>
      </section>

      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <FeatureCard
              href="/dashboard"
              icon={<LayoutDashboard className="w-7 h-7 sm:w-8 sm:h-8" />}
              title="Dashboard"
              description="Real-time carbon emission monitoring"
            />
            <FeatureCard
              href="/decision-model"
              icon={<Brain className="w-7 h-7 sm:w-8 sm:h-8" />}
              title="Decision Model"
              description="AI-driven optimization"
            />
            <FeatureCard
              href="/report"
              icon={<FileText className="w-7 h-7 sm:w-8 sm:h-8" />}
              title="Reports"
              description="Automated report generation"
            />
            <FeatureCard
              href="/settings"
              icon={<Settings className="w-7 h-7 sm:w-8 sm:h-8" />}
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
      <div className="glass-effect rounded-xl sm:rounded-2xl p-5 sm:p-6 card-hover h-full min-h-[160px] sm:min-h-[180px] flex flex-col">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl flex items-center justify-center text-white mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 text-sm sm:text-base flex-grow">
          {description}
        </p>
      </div>
    </Link>
  );
}
