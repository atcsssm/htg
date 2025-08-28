import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyOTPRequest {
  user_id: string;
  otp_code: string;
  otp_type: 'email' | 'mobile';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, otp_code, otp_type }: VerifyOTPRequest = await req.json()

    const { createClient } = await import('npm:@supabase/supabase-js@2')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 Verifying OTP:', { user_id, otp_type, otp_code })

    // Find the OTP record using correct table and column names
    const { data: otpRecord, error: findError } = await supabase
      .from('tbl_otp_verifications')
      .select('*')
      .eq('tov_user_id', user_id)
      .eq('tov_otp_code', otp_code)
      .eq('tov_otp_type', otp_type)
      .eq('tov_is_verified', false)
      .gte('tov_expires_at', new Date().toISOString())
      .order('tov_created_at', { ascending: false })
      .limit(1)
      .single()

    if (findError || !otpRecord) {
      console.error('OTP not found or expired:', findError)
      
      // Increment attempts for security
      await supabase
        .from('tbl_otp_verifications')
        .update({ tov_attempts: (otpRecord.tov_attempts || 0) + 1 })
        .eq('tov_user_id', user_id)
        .eq('tov_otp_type', otp_type)
        .eq('tov_is_verified', false)

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid or expired OTP. Please request a new code.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Check attempts limit (max 5 attempts)
    if (otpRecord.tov_attempts >= 5) {
      console.error('Too many attempts for OTP:', otpRecord.tov_id)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Too many failed attempts. Please request a new OTP.' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429 
        }
      )
    }

    console.log('✅ Valid OTP found, marking as verified')

    // Mark OTP as verified
    const { error: updateOTPError } = await supabase
      .from('tbl_otp_verifications')
      .update({ tov_is_verified: true })
      .eq('tov_id', otpRecord.tov_id)

    if (updateOTPError) {
      console.error('Failed to update OTP status:', updateOTPError)
      throw updateOTPError
    }

    // Update user verification status using correct table and column names
    const updateData: any = {}
    if (otp_type === 'email') {
      updateData.tu_email_verified = true
    } else if (otp_type === 'mobile') {
      updateData.tu_mobile_verified = true
      // Also mark user as fully verified when mobile is verified
      updateData.tu_is_verified = true
    }

    const { error: updateUserError } = await supabase
      .from('tbl_users')
      .update(updateData)
      .eq('tu_id', user_id)

    if (updateUserError) {
      console.warn('Failed to update user verification status:', updateUserError)
      // Don't throw error here as OTP is already verified
    } else {
      console.log('✅ User verification status updated')
    }

    // Send welcome email if this was mobile verification (final step)
    if (otp_type === 'mobile') {
      try {
        await sendWelcomeEmail(user_id, supabase)
      } catch (emailError) {
        console.warn('Failed to send welcome email:', emailError)
        // Don't fail the verification if welcome email fails
      }
    }

    console.log('🎉 OTP verification completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${otp_type} verified successfully`,
        verification_complete: otp_type === 'mobile'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error verifying OTP:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Verification failed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function sendWelcomeEmail(userId: string, supabase: any) {
  try {
    console.log('📧 Sending welcome email for user:', userId)

    // Get user data using correct table and column names
    const { data: userData } = await supabase
      .from('tbl_users')
      .select(`
        tu_email,
        tbl_user_profiles (
          tup_first_name,
          tup_sponsorship_number
        )
      `)
      .eq('tu_id', userId)
      .single()

    if (!userData) {
      console.warn('User data not found for welcome email')
      return
    }

    // Get system settings
    const { data: settings } = await supabase
      .from('tbl_system_settings')
      .select('tss_setting_key, tss_setting_value')

    const settingsMap = settings?.reduce((acc: any, setting: any) => {
      acc[setting.tss_setting_key] = setting.tss_setting_value
      return acc
    }, {}) || {}

    const siteName = settingsMap.site_name?.replace(/"/g, '') || 'HanakhaDeals'
    const firstName = userData.tbl_user_profiles?.tup_first_name || 'User'
    const sponsorshipNumber = userData.tbl_user_profiles?.tup_sponsorship_number || 'N/A'

    // Create welcome email content
    const emailSubject = `Welcome to ${siteName}! Your Account is Ready`
    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to ${siteName}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 20px; 
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header { 
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .content { 
            padding: 40px 30px; 
          }
          .welcome-box {
            background: linear-gradient(135deg, #f8fff9 0%, #e8f5e8 100%);
            border: 2px solid #28a745;
            padding: 30px;
            border-radius: 12px;
            margin: 20px 0;
            text-align: center;
          }
          .sponsorship-number {
            font-size: 24px;
            font-weight: bold;
            color: #28a745;
            font-family: 'Courier New', monospace;
            letter-spacing: 2px;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d; 
            font-size: 14px; 
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to ${siteName}!</h1>
            <p>Your MLM journey starts here</p>
          </div>
          <div class="content">
            <h2 style="color: #495057;">Hello ${firstName}!</h2>
            <p style="color: #6c757d; font-size: 16px; line-height: 1.6;">
              Congratulations! Your account has been successfully created and verified. 
              You're now part of our growing community of entrepreneurs.
            </p>
            
            <div class="welcome-box">
              <h3 style="color: #28a745; margin-top: 0;">Your Account Details</h3>
              <p style="margin: 10px 0;"><strong>Sponsorship Number:</strong></p>
              <div class="sponsorship-number">${sponsorshipNumber}</div>
              <p style="color: #6c757d; font-size: 14px; margin-top: 15px;">
                Keep this number safe - you'll need it for referrals!
              </p>
            </div>
            
            <h3 style="color: #495057;">What's Next?</h3>
            <ul style="color: #6c757d; line-height: 1.8;">
              <li>Choose your subscription plan to activate your account</li>
              <li>Complete your profile information</li>
              <li>Start building your network</li>
              <li>Explore our training materials and resources</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SITE_URL') || 'https://mlmplatform.com'}/customer/dashboard" class="cta-button">
                Access Your Dashboard
              </a>
            </div>
            
            <p style="color: #495057;">
              If you have any questions, our support team is here to help. 
              Welcome aboard and here's to your success!
            </p>
          </div>
          <div class="footer">
            <p>This email was sent to ${userData.tu_email}</p>
            <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    // Send welcome email via Resend through Supabase
    const { data, error } = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/resend`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${siteName} <onboarding@resend.dev>`,
        to: userData.tu_email,
        subject: emailSubject,
        html: emailBody,
      }),
    }).then(res => res.json())

    if (error) {
      console.error('Failed to send welcome email via Resend:', error)
    } else {
      console.log('✅ Welcome email sent successfully')
    }

  } catch (error) {
    console.error('❌ Failed to send welcome email:', error)
    throw error
  }
}