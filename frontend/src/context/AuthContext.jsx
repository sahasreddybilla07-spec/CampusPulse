import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

/* ── Demo profiles (no Supabase account needed) ────────────── */
const DEMO_PROFILES = {
  student: {
    id: 'demo-student-id',
    name: 'Demo Student',
    email: 'student@campuspulse.edu',
    role: 'student',
    roll_no: '160122733001',
    branch: 'CSE',
    year: '3rd',
    phone: '9876543210',
    hostel_block: 'Block A',
    hostel_room: '301',
  },
  incharge: {
    id: 'demo-incharge-id',
    name: 'Demo In-Charge',
    email: 'incharge@campuspulse.edu',
    role: 'incharge',
    employee_id: 'EMP-001',
    designation: 'Block Warden',
    assigned_block: 'Block A',
    phone: '9876543211',
    is_active: true,
  },
  admin: {
    id: 'demo-admin-id',
    name: 'Demo Admin',
    email: 'admin@campuspulse.edu',
    role: 'admin',
    admin_level: 'Super Admin',
    phone: '9876543212',
  },
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDemo,  setIsDemo]  = useState(false)

  /* Fetch profile row from DB */
  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error && data) setProfile(data)
    else setProfile(null)
  }

  useEffect(() => {
    /* Check if a demo session exists in sessionStorage */
    const demoRole = sessionStorage.getItem('campuspulse_demo_role')
    if (demoRole && DEMO_PROFILES[demoRole]) {
      const dp = DEMO_PROFILES[demoRole]
      setUser({ id: dp.id, email: dp.email })
      setProfile(dp)
      setIsDemo(true)
      setLoading(false)
      return
    }

    /* Initial session check */
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id).finally(() => setLoading(false))
      else setLoading(false)
    })

    /* Listen for auth state changes */
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  /* ── Demo login (client-side only) ────────────────────────── */
  function loginDemo(role) {
    const dp = DEMO_PROFILES[role]
    if (!dp) throw new Error(`Unknown demo role: ${role}`)
    sessionStorage.setItem('campuspulse_demo_role', role)
    setUser({ id: dp.id, email: dp.email })
    setProfile(dp)
    setIsDemo(true)
    setLoading(false)
  }

  async function signOut() {
    if (isDemo) {
      sessionStorage.removeItem('campuspulse_demo_role')
      setIsDemo(false)
    } else {
      await supabase.auth.signOut()
    }
    setUser(null)
    setProfile(null)
  }

  /* Refresh profile after edits */
  async function refreshProfile() {
    if (isDemo) return // demo profiles are ephemeral
    if (user) await fetchProfile(user.id)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, isDemo, signOut, refreshProfile, loginDemo }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
