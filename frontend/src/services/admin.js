import { supabase } from '../lib/supabase'

/* ── Get all complaints (admin view) ───────────────────────── */
export async function getAllComplaints() {
  const { data, error } = await supabase
    .from('complaints')
    .select(`*,
      student:profiles!complaints_student_id_fkey(name, roll_no, email),
      incharge:profiles!complaints_incharge_id_fkey(name, assigned_block)
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/* ── Get all incharges ──────────────────────────────────────── */
export async function getAllIncharges() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'incharge')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/* ── Get all students ───────────────────────────────────────── */
export async function getAllStudents() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student')
    .order('name', { ascending: true })
  if (error) throw error
  return data
}

/* ── Create incharge via database RPC ──────────────────────── */
export async function createIncharge({ name, email, block, designation, phone }) {
  const { data, error } = await supabase.rpc('create_incharge', {
    p_name: name,
    p_email: email,
    p_block: block,
    p_designation: designation || '',
    p_phone: phone || ''
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data // { email, tempPassword, employeeId, name, block }
}

/* ── Toggle incharge active status ─────────────────────────── */
export async function toggleInchargeStatus(userId, currentStatus) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: !currentStatus })
    .eq('id', userId)
  if (error) throw error
}

/* ── Remove incharge (deactivate, don't delete) ─────────────── */
export async function removeIncharge(userId) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: false })
    .eq('id', userId)
  if (error) throw error
}

/* ── Reassign complaint to different incharge ───────────────── */
export async function reassignComplaint(complaintId, inchargeId) {
  const { error } = await supabase
    .from('complaints')
    .update({ incharge_id: inchargeId })
    .eq('id', complaintId)
  if (error) throw error
}

/* ── Get system analytics via RPC ───────────────────────────── */
export async function getAnalyticsSummary() {
  const { data, error } = await supabase.rpc('get_analytics_summary')
  if (error) throw error
  return data
}

/* ── Update admin/incharge profile ─────────────────────────── */
export async function updateAdminProfile(userId, fields) {
  const { error } = await supabase
    .from('profiles')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw error
}
