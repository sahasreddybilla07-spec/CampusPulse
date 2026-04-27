import { supabase } from '../lib/supabase'

/* ── Generate complaint ID ──────────────────────────────────── */
async function nextComplaintId() {
  const { count } = await supabase
    .from('complaints')
    .select('*', { count: 'exact', head: true })
  return `CP-${String((count || 0) + 1).padStart(3, '0')}`
}

/* ── Fetch complaints for a student ────────────────────────── */
export async function getMyComplaints(studentId) {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/* ── Submit a new complaint ─────────────────────────────────── */
export async function submitComplaint({ studentId, title, category, block, description, anonymous, sentiment, imageFile }) {
  let image_url = null

  // Upload image if provided
  if (imageFile) {
    const ext  = imageFile.name.split('.').pop()
    const path = `${studentId}/${Date.now()}.${ext}`
    const { data: uploaded, error: uploadErr } = await supabase.storage
      .from('complaint-images')
      .upload(path, imageFile, { upsert: false })
    if (!uploadErr) {
      const { data: urlData } = supabase.storage.from('complaint-images').getPublicUrl(uploaded.path)
      image_url = urlData.publicUrl
    }
  }

  // Auto-assign incharge based on block
  let incharge_id = null
  if (block) {
    const { data: ic } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'incharge')
      .eq('assigned_block', block)
      .eq('is_active', true)
      .limit(1)
      .single()
    if (ic) incharge_id = ic.id
  }

  const id = await nextComplaintId()

  const { data, error } = await supabase
    .from('complaints')
    .insert({
      id, student_id: studentId, incharge_id,
      title, category, block, description,
      anonymous, sentiment, image_url,
      priority: 'Medium', status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/* ── Fetch notifications for a user ────────────────────────── */
export async function getNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

/* ── Mark notification read ─────────────────────────────────── */
export async function markNotificationRead(id) {
  await supabase.from('notifications').update({ read: true }).eq('id', id)
}

/* ── Mark all notifications read ───────────────────────────── */
export async function markAllNotificationsRead(userId) {
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId)
}

/* ── Fetch complaints assigned to an incharge ──────────────── */
export async function getAssignedComplaints(inchargeId) {
  // First get the incharge's assigned block
  const { data: profile } = await supabase
    .from('profiles')
    .select('assigned_block')
    .eq('id', inchargeId)
    .single()

  const block = profile?.assigned_block

  // Fetch complaints for this block OR directly assigned to this incharge
  let query = supabase
    .from('complaints')
    .select(`*, student:profiles!complaints_student_id_fkey(name, roll_no, email, phone)`)
    .order('created_at', { ascending: false })

  if (block) {
    query = query.or(`incharge_id.eq.${inchargeId},block.eq.${block}`)
  } else {
    query = query.eq('incharge_id', inchargeId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

/* ── Update complaint status ────────────────────────────────── */
export async function updateComplaintStatus(id, status) {
  const { error } = await supabase
    .from('complaints')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

/* ── Update student profile ─────────────────────────────────── */
export async function updateProfile(userId, fields) {
  const { error } = await supabase
    .from('profiles')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw error
}

/* ── Change password ────────────────────────────────────────── */
export async function changePassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}
