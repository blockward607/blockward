
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  verificationToken: string;
  teacherName?: string;
  className?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received email verification request");
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    const { email, verificationToken, teacherName, className }: VerificationEmailRequest = requestBody;

    if (!email || !verificationToken) {
      console.error("Missing required fields:", { email, verificationToken });
      return new Response(
        JSON.stringify({ error: "Email and verification token are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    console.log("Processing email request for:", { email, teacherName, className });

    let emailBody;
    let emailSubject;
    
    if (teacherName && className) {
      // This is a class invitation email
      emailSubject = `Invitation to join ${className} on Blockward`;
      emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h1 style="color: #8b5cf6; margin-bottom: 20px;">You're Invited to Join Blockward!</h1>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            <strong>${teacherName}</strong> has invited you to join their class <strong>${className}</strong> on Blockward.
          </p>
          <p style="font-size: 16px; line-height: 1.5; color: #333;">
            Click the button below to join the class:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get("SITE_URL") || "https://blockward.app"}/join-class?token=${verificationToken}" 
               style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Join Class
            </a>
          </div>
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you don't have a Blockward account yet, you'll be guided to create one after clicking the link.
          </p>
          <p style="font-size: 14px; color: #666;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="font-size: 14px; color: #666;">
              Best regards,<br>The Blockward Team
            </p>
          </div>
        </div>
      `;
    } else {
      // This is a standard verification email
      emailSubject = "Verify your Blockward account";
      emailBody = `
        <h1>Welcome to Blockward!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${Deno.env.get("SITE_URL") || "https://blockward.app"}/verify?token=${verificationToken}">
          Verify Email
        </a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>Best regards,<br>The Blockward Team</p>
      `;
    }

    console.log("Sending email with Resend API");
    
    const emailResponse = await resend.emails.send({
      from: "Blockward <onboarding@resend.dev>",
      to: [email],
      subject: emailSubject,
      html: emailBody,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
