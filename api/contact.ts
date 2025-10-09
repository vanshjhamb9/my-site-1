import type { VercelRequest, VercelResponse } from '@vercel/node';
import { contactFormSchema, insertLeadSchema } from '../shared/schema.js';
import { getStorage } from './_utils/storage.js';
import { Resend } from 'resend';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = contactFormSchema.safeParse(req.body);
    
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Invalid form data', 
        details: result.error.issues 
      });
    }

    const { name, email, businessNeeds, message } = result.data;
    
    // Save lead to database
    const storage = getStorage();
    await storage.createLead({
      name,
      email,
      businessNeeds,
      message: message || null
    });
    
    // Send email notification
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      // Still return success since the lead was saved
      return res.status(200).json({ 
        success: true, 
        message: "Your message has been received! We'll get back to you soon." 
      });
    }

    const resend = new Resend(resendApiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    
    await resend.emails.send({
      from: fromEmail,
      to: 'sales@neuralcoderai.com',
      subject: `New Contact Inquiry from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Business Needs:</strong> ${businessNeeds}</p>
        <p><strong>Message:</strong> ${message || 'No message provided'}</p>
        <hr>
        <p><small>This email was sent from the contact form on your website.</small></p>
      `,
    });

    return res.status(200).json({ 
      success: true, 
      message: "Your message has been sent successfully! We'll get back to you soon." 
    });
  } catch (error: any) {
    console.error('Contact form error:', error);
    return res.status(500).json({ 
      error: 'Failed to send message. Please try again later.',
      details: error.message 
    });
  }
}
