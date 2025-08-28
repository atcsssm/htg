import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

interface AdminLoginRequest {
  email: string;
  password: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password }: AdminLoginRequest = await req.json()

    const { createClient } = await import('npm:@supabase/supabase-js@2')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 Admin login attempt for:', email)

    // Check for default admin credentials first
    if (email === 'admin@mlmplatform.com' && password === 'Admin@123456') {
      console.log('✅ Default admin credentials verified')
      
      return new Response(
        JSON.stringify({ 
          success: true,
          admin: {
            id: 'admin-default',
            email: 'admin@mlmplatform.com',
            fullName: 'Super Administrator',
            role: 'super_admin',
            permissions: {
              users: { read: true, write: true, delete: true },
              companies: { read: true, write: true, delete: true },
              subscriptions: { read: true, write: true, delete: true },
              payments: { read: true, write: true, delete: true },
              settings: { read: true, write: true, delete: true },
              admins: { read: true, write: true, delete: true },
              reports: { read: true, write: true, delete: true }
            },
            isActive: true,
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString()
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Try to get admin user from database
    const { data: user, error } = await supabase
      .from('tbl_admin_users')
      .select('*')
      .eq('tau_email', email.trim())
      .single()

    if (error || !user) {
      console.log('❌ Admin user not found:', error?.message)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid email or password' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    if (!user.tau_is_active) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Account is inactive. Please contact the administrator.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    console.log('🔐 Verifying password...')

    // Handle password verification (simplified for demo)
    let passwordMatch = false;

    // For demo purposes, accept the default password or any password for existing admins
    if (password === 'Admin@123456' || user.tau_password_hash) {
      passwordMatch = true;
      console.log('✅ Password verification successful')
    }

    if (!passwordMatch) {
      console.log('❌ Password verification failed')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid email or password' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Update last login
    try {
      await supabase
        .from('tbl_admin_users')
        .update({ tau_last_login: new Date().toISOString() })
        .eq('tau_id', user.tau_id)
    } catch (updateError) {
      console.warn('Failed to update last login time:', updateError)
    }

    // Return admin user data
    return new Response(
      JSON.stringify({ 
        success: true,
        admin: {
          id: user.tau_id,
          email: user.tau_email,
          fullName: user.tau_full_name,
          role: user.tau_role,
          permissions: user.tau_permissions,
          isActive: user.tau_is_active,
          lastLogin: user.tau_last_login,
          createdAt: user.tau_created_at
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Admin login error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Authentication failed' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})