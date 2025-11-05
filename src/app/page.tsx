import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* 導航欄 */}
      <nav className="glass-effect fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 gradient-success rounded-lg"></div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                CFM System
              </span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">功能</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors">關於</a>
              <a href="/dashboard" className="gradient-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                進入系統
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* 英雄區 */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            永續發展 × 智能管理
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
            碳排管理系統
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            專業的永續碳排管理與監控平台
            <br />
            <span className="text-base text-gray-500">
              協助企業達成淨零目標，符合國際永續標準
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard"
              className="gradient-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all hover:-translate-y-1"
            >
              開始使用
            </Link>
            <a
              href="#features"
              className="bg-white text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-gray-200 hover:border-blue-500 transition-all hover:-translate-y-1"
            >
              了解更多
            </a>
          </div>
        </div>
      </section>

      {/* 統計數據 */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '99.9%', label: '系統可用性' },
              { value: '24/7', label: '即時監控' },
              { value: '1000+', label: '企業信賴' },
              { value: 'ISO', label: '國際認證' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold gradient-primary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 核心功能 */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">核心功能</h2>
            <p className="text-xl text-gray-600">全方位的碳管理解決方案</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FeatureCard
              href="/dashboard"
              gradient="from-blue-500 to-cyan-500"
              icon="📊"
              title="即時監控儀表板"
              description="實時追蹤企業碳排放數據，視覺化呈現趨勢與洞察"
              features={['即時數據更新', '多維度分析', '自定義報表']}
            />
            <FeatureCard
              href="/decision-model"
              gradient="from-green-500 to-emerald-500"
              icon="🧮"
              title="智能決策模型"
              description="基於數學模型的供應鏈與碳排放優化決策系統"
              features={['優化算法', '敏感性分析', '情境模擬']}
            />
            <FeatureCard
              href="/report"
              gradient="from-purple-500 to-pink-500"
              icon="📄"
              title="自動化報告生成"
              description="一鍵生成符合國際標準的永續發展報告書"
              features={['GRI 標準', 'TCFD 框架', '客製化內容']}
            />
            <FeatureCard
              href="/settings"
              gradient="from-orange-500 to-yellow-500"
              icon="⚙️"
              title="系統設定管理"
              description="靈活配置系統參數，符合企業個別需求"
              features={['權限管理', '數據整合', 'API 接口']}
            />
          </div>
        </div>
      </section>

      {/* CTA 區塊 */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-effect rounded-3xl p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">開始您的永續之旅</h2>
            <p className="text-xl text-gray-600 mb-8">
              立即使用碳排管理系統，加速企業永續轉型
            </p>
            <Link
              href="/dashboard"
              className="inline-block gradient-primary text-white px-10 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl transition-all hover:-translate-y-1"
            >
              立即開始
            </Link>
          </div>
        </div>
      </section>

      {/* 頁腳 */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 gradient-success rounded-lg"></div>
            <span className="text-xl font-bold">CFM System</span>
          </div>
          <p className="text-gray-400 mb-4">專業的永續碳排管理與監控平台</p>
          <p className="text-sm text-gray-500">
            © 2024 Carbon Footprint Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ href, gradient, icon, title, description, features }: {
  href: string;
  gradient: string;
  icon: string;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <Link href={href} className="group block">
      <div className="glass-effect rounded-2xl p-8 card-hover h-full">
        <div className={`w-16 h-16 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 mb-6">
          {description}
        </p>
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center text-sm text-gray-600">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
          了解更多
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
