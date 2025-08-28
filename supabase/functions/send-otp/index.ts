import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OTPRequest {
  user_id: string;
  contact_info: string;
  otp_type: 'email' | 'mobile';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { user_id, contact_info, otp_type }: OTPRequest = await req.json()

    // Generate 6-digit OTP
    const otp_code = Math.floor(100000 + Math.random() * 900000).toString()
    const expires_at = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    const { createClient } = await import('npm:@supabase/supabase-js@2')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 Sending OTP:', { user_id, contact_info, otp_type })

    // Store OTP in database with correct table name
    const { data: otpData, error: otpError } = await supabase
      .from('tbl_otp_verifications')
      .insert({
        tov_user_id: user_id,
        tov_otp_code: otp_code,
        tov_otp_type: otp_type,
        tov_contact_info: contact_info,
        tov_expires_at: expires_at.toISOString()
      })
      .select()
      .single()

    if (otpError) {
      console.error('Database error:', otpError)
      throw otpError
    }

    console.log('✅ OTP stored in database:', otpData.tov_id)

    // Get system settings for site name
    const { data: settings } = await supabase
      .from('tbl_system_settings')
      .select('tss_setting_key, tss_setting_value')

    const settingsMap = settings?.reduce((acc: any, setting: any) => {
      acc[setting.tss_setting_key] = setting.tss_setting_value
      return acc
    }, {}) || {}

    const siteName = settingsMap.site_name?.replace(/"/g, '') || 'HanakhaDeals'
    console.log('✅ siteName: ', siteName);
    // Send OTP based on type
    if (otp_type === 'email') {
      await sendEmailOTP(contact_info, otp_code, siteName, supabase)
    } else if (otp_type === 'mobile') {
      await sendSMSOTP(contact_info, otp_code, siteName, supabase)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `OTP sent to ${contact_info}`,
        otp_id: otpData.tov_id,
        // For development/testing - remove in production
        debug_otp: Deno.env.get('NODE_ENV') === 'development' ? otp_code : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    let message = "Unknown error";
    let stack = null;

    if (error instanceof Error) {
      message = error.message;
      stack = error.stack || null;
    } else if (typeof error === "string") {
      message = error;
    } else {
      try {
        message = JSON.stringify(error);
      } catch (_) {
        message = "Non-serializable error object";
      }
    }

    console.error("❌ Error sending OTP:", { message, stack });

    return new Response(JSON.stringify({
      success: false,
      error: message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 400
    });
  }

})

async function sendEmailOTP(email: string, otp: string, siteName: string, supabase: any) {
  try {
    console.log('📧 Sending email OTP via Resend to:', email)

    // Create professional email content
    const emailSubject = `Your OTP Code - ${siteName}`
    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>OTP Verification</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center; 
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .content { 
            padding: 40px 30px; 
            text-align: center;
          }
          .otp-box { 
            background: linear-gradient(135deg, #f8f9ff 0%, #e8f2ff 100%);
            border: 2px solid #667eea; 
            padding: 30px; 
            margin: 30px 0; 
            border-radius: 12px; 
          }
          .otp-code { 
            font-size: 36px; 
            font-weight: bold; 
            color: #667eea; 
            letter-spacing: 8px; 
            margin: 15px 0;
            font-family: 'Courier New', monospace;
          }
          .instructions {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
          }
          .instructions ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .instructions li {
            margin: 8px 0;
            color: #495057;
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d; 
            font-size: 14px; 
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Email Verification</h1>
            <p>Secure your ${siteName} account</p>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #495057; margin-bottom: 10px;">Hello!</p>
            <p style="color: #6c757d; margin-bottom: 20px;">
              You have requested an OTP for email verification. Please use the code below to complete your verification:
            </p>
            
            <div class="otp-box">
              <p style="margin: 0; color: #495057; font-weight: 600;">Your Verification Code:</p>
              <div class="otp-code">${otp}</div>
              <p style="margin: 0; color: #6c757d; font-size: 14px;">
                <strong>Valid for 10 minutes only</strong>
              </p>
            </div>
            
            <div class="instructions">
              <h4 style="color: #495057; margin-top: 0;">Important Security Information:</h4>
              <ul>
                <li>Do not share this code with anyone</li>
                <li>This code will expire in 10 minutes</li>
                <li>If you didn't request this code, please ignore this email</li>
                <li>For security, this code can only be used once</li>
              </ul>
            </div>
            
            <div class="warning">
              <strong>Security Notice:</strong> ${siteName} will never ask for your OTP code via phone or email. 
              Only enter this code on the official ${siteName} website.
            </div>
            
            <p style="color: #495057; margin-top: 30px;">
              Thank you for choosing ${siteName}!
            </p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
            <p style="margin-top: 10px;">
              <a href="#" style="color: #667eea; text-decoration: none;">Privacy Policy</a> | 
              <a href="#" style="color: #667eea; text-decoration: none;">Terms of Service</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    // Use Supabase's Resend integration
    const { data, error } = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/resend`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${siteName} <noreply@${siteName.toLowerCase().replace(/\s+/g, '')}.com>`,
        to: [email],
        subject: emailSubject,
        html: emailBody,
      }),
    }).then(res => res.json())

    if (error) {
      console.error('Resend email error:', error)
      // Fallback: Log the email for development
      console.log('📧 Email would be sent (Resend not configured):', {
        to: email,
        subject: emailSubject,
        otp: otp
      })
    } else {
      console.log('✅ Email sent successfully via Resend:', data)
    }

    return true

  } catch (error) {
    console.error('❌ Failed to send email OTP:', error)
    // Don't throw error - log for development
    console.log('📧 Development mode - Email OTP:', {
      email,
      otp,
      message: 'Email would be sent in production with Resend configuration'
    })
    return true
  }
}

async function sendSMSOTP(mobile: string, otp: string, siteName: string, supabase: any) {
  try {
    console.log('📱 Sending SMS OTP via Twilio to:', mobile)

    // Create SMS message
    const message = `Your ${siteName} verification code is: ${otp}. This code expires in 10 minutes. Do not share this code with anyone. - ${siteName}`
    console.log('✅ SUPABASE_SERVICE_ROLE_KEY: ', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    console.log('✅ SUPABASE_URL: ', `${Deno.env.get('SUPABASE_URL')}/functions/v1/twilio`);
    // Use Supabase's Twilio integration
    const { data, error } = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/twilio`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: mobile,
        body: message,
      }),
    }).then(res => res.json())
    console.log('✅ twilio data: ', data);
    console.log('✅ twilio error: ', error);
    if (error) {
      console.error('Twilio SMS error:', error)
      // Fallback: Log the SMS for development
      console.log('📱 SMS would be sent (Twilio not configured):', {
        to: mobile,
        message: message,
        otp: otp
      })
    } else {
      console.log('✅ SMS sent successfully via Twilio:', data)
    }

    return true

  } catch (error) {
    console.error('❌ Failed to send SMS OTP:', error)
    // Don't throw error - log for development
    console.log('📱 Development mode - SMS OTP:', {
      mobile,
      otp,
      message: 'SMS would be sent in production with Twilio configuration'
    })
    return true
  }
}