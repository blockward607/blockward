
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { Resend } from 'npm:resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, verificationToken, teacherName, className } = await req.json();
    
    if (!email || !verificationToken) {
      return new Response(
        JSON.stringify({
          error: 'Missing required parameters: email and verificationToken are required'
        }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    console.log(`Sending verification email to ${email} with token ${verificationToken}`);
    
    // Get Resend API key from environment
    const RESEND_API_KEY = Deno.env.get("Resend");
    if (!RESEND_API_KEY) {
      console.error("Missing Resend API key");
      return new Response(
        JSON.stringify({
          error: 'Server configuration error: Missing API key'
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }
    
    // Initialize Resend with the API key
    const resend = new Resend(RESEND_API_KEY);
    
    // Generate the join URL with the token
    const joinUrl = `https://blockward.app/classes?code=${verificationToken}`;
    
    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'Blockward <noreply@blockward.app>',
      to: [email],
      subject: `Join ${className || 'a classroom'} on Blockward`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #7e22ce; text-align: center;">Blockward Classroom Invitation</h1>
          <p>Hello,</p>
          <p>${teacherName || 'A teacher'} has invited you to join their class "${className || 'Classroom'}" on Blockward, an educational platform for interactive learning.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${joinUrl}" style="background-color: #7e22ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Join Classroom</a>
          </div>
          <p>If the button doesn't work, you can also manually enter this code after logging in:</p>
          <p style="text-align: center; font-family: monospace; font-size: 24px; letter-spacing: 2px; background: #f3f4f6; padding: 10px; border-radius: 4px;">${verificationToken}</p>
          <p>If you don't have a Blockward account yet, you'll be guided to create one when you click the join link.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 12px; text-align: center;">This is an automated message from Blockward. Please do not reply to this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
      return new Response(
        JSON.stringify({
          error: `Failed to send email: ${error.message}`
        }), 
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    console.log('Email sent successfully:', data);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Verification email sent successfully'
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error('Unhandled error:', error);
    
    return new Response(
      JSON.stringify({
        error: `Internal Server Error: ${error.message}`
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
