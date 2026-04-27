import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, block, designation } = await req.json()

    if (!name || !email || !block || !designation) {
      return new Response(
        JSON.stringify({ error: 'name, email, block, and designation are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Auto-generate credentials
    const year       = new Date().getFullYear()
    const suffix     = Math.floor(Math.random() * 900 + 100)
    const employeeId = `IC-${year}-${suffix}`
    const tempPassword = 'IC-' + Math.random().toString(36).slice(2, 8).toUpperCase()

    // Admin Supabase client (service role — server-side only)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Create auth user
    const { data: authUser, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,       // skip email verification for staff
      user_metadata: {
        name,
        role:         'incharge',
        password_ref: tempPassword,
      }
    })

    if (createErr) {
      return new Response(
        JSON.stringify({ error: createErr.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Update profile with incharge-specific fields
    const { error: updateErr } = await adminClient
      .from('profiles')
      .update({
        name,
        role:                    'incharge',
        employee_id:             employeeId,
        designation,
        assigned_block:          block,
        password_ref:            tempPassword,
        password_reset_required: true,
        is_active:               true,
      })
      .eq('id', authUser.user.id)

    if (updateErr) {
      return new Response(
        JSON.stringify({ error: updateErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Return generated credentials to admin
    return new Response(
      JSON.stringify({
        success:      true,
        email,
        tempPassword,
        employeeId,
        block,
        name,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
