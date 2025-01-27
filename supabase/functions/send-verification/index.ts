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
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, verificationToken }: VerificationEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Blockward <onboarding@resend.dev>",
      to: [email],
      subject: "Verify your Blockward account",
      html: `
        <h1>Welcome to Blockward!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${Deno.env.get("SITE_URL")}/verify?token=${verificationToken}">
          Verify Email
        </a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <p>Best regards,<br>The Blockward Team</p>
      `,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
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