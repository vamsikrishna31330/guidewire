import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HiShieldCheck } from 'react-icons/hi'

const PLATFORMS = ['Zomato', 'Swiggy', 'Zepto', 'Blinkit', 'Other']
const PINCODES = [
  { code: '500001', city: 'Hyderabad' },
  { code: '600001', city: 'Chennai' },
  { code: '400001', city: 'Mumbai' },
  { code: '110001', city: 'Delhi' },
  { code: '560001', city: 'Bangalore' },
  { code: '700001', city: 'Kolkata' },
  { code: '411001', city: 'Pune' },
  { code: '530001', city: 'Visakhapatnam' },
  { code: '522001', city: 'Guntur' },
  { code: '521001', city: 'Vijayawada' },
]

export default function Register() {
  const { signUp, createWorkerProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1=email, 2=profile
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    name: '', phone: '', city: '', pincode: '', platform: 'Zomato', weeklyEarnings: '',
  })

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await signUp(form.email, form.password)
      setStep(2)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleProfile = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const selectedPincode = PINCODES.find(p => p.code === form.pincode)
      await createWorkerProfile({
        name: form.name,
        phone: form.phone,
        city: selectedPincode?.city || form.city,
        pincode: form.pincode,
        platform: form.platform,
        weeklyEarnings: parseFloat(form.weeklyEarnings),
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <HiShieldCheck className="w-12 h-12 text-gs-teal mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Create Your Account</h1>
          <p className="text-sm text-gs-text-muted mt-1">
            {step === 1 ? 'Step 1: Create login credentials' : 'Step 2: Complete your worker profile'}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center space-x-3 mb-8">
          <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-gs-teal' : 'bg-gs-border'}`} />
          <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-gs-teal' : 'bg-gs-border'}`} />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-gs-danger/10 border border-gs-danger/30 rounded-lg text-sm text-gs-danger">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSignUp} className="space-y-4" id="register-form-step1">
            <div>
              <label className="block text-sm font-medium text-gs-text-muted mb-1.5">Email</label>
              <input type="email" required className="gs-input" placeholder="your@email.com"
                value={form.email} onChange={(e) => updateForm('email', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gs-text-muted mb-1.5">Password</label>
              <input type="password" required className="gs-input" placeholder="Min 6 characters"
                value={form.password} onChange={(e) => updateForm('password', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gs-text-muted mb-1.5">Confirm Password</label>
              <input type="password" required className="gs-input" placeholder="Confirm password"
                value={form.confirmPassword} onChange={(e) => updateForm('confirmPassword', e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full gs-btn-primary !py-3">
              {loading ? 'Creating Account...' : 'Continue →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleProfile} className="space-y-4" id="register-form-step2">
            <div>
              <label className="block text-sm font-medium text-gs-text-muted mb-1.5">Full Name</label>
              <input type="text" required className="gs-input" placeholder="Your full name"
                value={form.name} onChange={(e) => updateForm('name', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gs-text-muted mb-1.5">Phone Number</label>
              <input type="tel" required className="gs-input" placeholder="+91 9XXXXXXXXX"
                value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gs-text-muted mb-1.5">Delivery Zone (Pincode)</label>
              <select required className="gs-select"
                value={form.pincode} onChange={(e) => updateForm('pincode', e.target.value)}>
                <option value="">Select your zone</option>
                {PINCODES.map(p => (
                  <option key={p.code} value={p.code}>{p.code} — {p.city}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gs-text-muted mb-1.5">Platform</label>
              <select required className="gs-select"
                value={form.platform} onChange={(e) => updateForm('platform', e.target.value)}>
                {PLATFORMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gs-text-muted mb-1.5">Weekly Earnings (₹)</label>
              <input type="number" required className="gs-input" placeholder="e.g. 3000"
                value={form.weeklyEarnings} onChange={(e) => updateForm('weeklyEarnings', e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full gs-btn-primary !py-3">
              {loading ? 'Saving Profile...' : 'Complete Registration ✓'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gs-text-muted mt-6">
          Already have an account? <Link to="/login" className="text-gs-teal hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}
