import { Link } from 'react-router-dom'
import { HiShieldCheck, HiLightningBolt, HiCurrencyRupee, HiClock, HiBadgeCheck, HiChartBar } from 'react-icons/hi'

const features = [
  {
    icon: HiLightningBolt,
    title: 'Instant Auto-Payouts',
    desc: 'Claims triggered automatically when disruptions are detected — zero paperwork.',
  },
  {
    icon: HiShieldCheck,
    title: 'Parametric Coverage',
    desc: 'Data-driven triggers: rain, heat, AQI spikes, curfews, and floods in your zone.',
  },
  {
    icon: HiCurrencyRupee,
    title: 'Affordable Premiums',
    desc: 'AI-calculated weekly premiums starting from ₹15/week based on your zone risk.',
  },
  {
    icon: HiClock,
    title: 'Real-Time Monitoring',
    desc: 'Continuous weather and air quality monitoring every 30 minutes across India.',
  },
  {
    icon: HiBadgeCheck,
    title: 'Trust-Based Pricing',
    desc: 'Build your trust score for discounted premiums. Zero-claim history = lower rates.',
  },
  {
    icon: HiChartBar,
    title: 'Anti-Fraud AI',
    desc: 'Fraud Confidence Score system prevents false claims while protecting honest workers.',
  },
]

const platforms = ['Zomato', 'Swiggy', 'Zepto', 'Blinkit']

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gs-teal/10 via-transparent to-cyan-500/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-gs-teal/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-gs-teal/10 border border-gs-teal/20 rounded-full px-4 py-2 mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-gs-teal rounded-full animate-pulse" />
              <span className="text-sm text-gs-teal font-medium">Built for India's 15M+ gig workers</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-fade-in">
              Delivery Disrupted?
              <br />
              <span className="gs-gradient-text">Get Paid Automatically.</span>
            </h1>

            <p className="text-lg sm:text-xl text-gs-text-muted max-w-2xl mx-auto mb-10 animate-fade-in">
              GigShield monitors weather, AQI, and curfews in your delivery zone. When disruptions hit,
              your payout triggers instantly — <strong className="text-gs-text">zero paperwork, zero manual claims.</strong>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up">
              <Link to="/register" className="gs-btn-primary text-lg !py-3.5 !px-8 w-full sm:w-auto">
                Get Protected — Free Signup
              </Link>
              <Link to="/login" className="gs-btn-secondary text-lg !py-3.5 !px-8 w-full sm:w-auto">
                Already a Member? Login
              </Link>
            </div>

            {/* Platform logos */}
            <div className="flex items-center justify-center space-x-8 text-gs-text-muted animate-fade-in">
              <span className="text-sm">Works with:</span>
              {platforms.map(p => (
                <span key={p} className="text-sm font-semibold border border-gs-border rounded-full px-4 py-1.5 hover:border-gs-teal/50 transition-colors">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gs-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">How GigShield Works</h2>
            <p className="text-gs-text-muted max-w-2xl mx-auto">Three simple steps to protect your income</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Sign Up & Set Zone', desc: 'Register with your pincode and delivery platform. Our AI calculates your personalized premium.' },
              { step: '02', title: 'Buy Weekly Coverage', desc: 'Choose your coverage types (rain, heat, AQI, curfew, flood) and pay your affordable weekly premium.' },
              { step: '03', title: 'Auto Payouts', desc: 'When a disruption is detected in your zone, your claim is created and payout triggered — automatically.' },
            ].map(item => (
              <div key={item.step} className="gs-card text-center group">
                <div className="w-14 h-14 bg-gs-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-gs-teal/20 transition-colors">
                  <span className="text-xl font-bold gs-gradient-text">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gs-text-muted text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why GigShield?</h2>
            <p className="text-gs-text-muted max-w-2xl mx-auto">AI-powered protection designed specifically for India's gig economy</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(feat => (
              <div key={feat.title} className="gs-card group">
                <feat.icon className="w-10 h-10 text-gs-teal mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                <p className="text-sm text-gs-text-muted">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-gs-teal/10 to-emerald-500/10">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Shield Your Earnings?</h2>
          <p className="text-gs-text-muted mb-8">Join thousands of gig workers across India who never worry about weather disruptions again.</p>
          <Link to="/register" className="gs-btn-primary text-lg !py-3.5 !px-10">
            Start Free — Get Your Quote
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gs-border">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gs-text-muted">
          <p>© 2026 GigShield by Team Syntax Shields — Guidewire DEVTrails 2026</p>
        </div>
      </footer>
    </div>
  )
}
