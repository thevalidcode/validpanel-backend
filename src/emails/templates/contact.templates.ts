import { Layout, LogoVars, TemplateResult } from "../components/EmailLayout";

export interface ContactMessageUserVars extends LogoVars {
  firstName: string;
  lastName: string;
}

export interface ContactMessageAdminVars extends LogoVars {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  uid: string;
}

/**
 * User confirmation email after submitting a contact message
 */
export const contactMessageUserConfirmation = ({
  firstName,
  lastName,
  logo,
}: ContactMessageUserVars): TemplateResult => {
  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px;">
          <h2 style="color:#7C3AED; margin:0 0 10px 0; font-size:24px;">Thank You for Contacting Us!</h2>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Hello ${firstName} ${lastName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      We've received your message and appreciate you taking the time to reach out to us. Our support team has been notified and will review your inquiry promptly.
    </p>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="background:linear-gradient(135deg, #EDE9FE 0%, #F3E8FF 100%); padding:20px; border-radius:8px; border-left:4px solid #7C3AED;">
          <p style="margin:0; font-size:15px; color:#5B21B6; font-weight:600;">
            ⏱️ Expected Response Time
          </p>
          <p style="margin:8px 0 0 0; font-size:14px; color:#6B21A8;">
            Our team typically responds within <strong>24 hours</strong> during business days.
          </p>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      In the meantime, feel free to explore our resources:
    </p>

    <table role="presentation" style="width:100%; border-collapse:collapse; margin-bottom:25px;">
      <tr>
        <td style="padding:10px 0;">
          <a href="https://validpanel.com/docs" style="color:#7C3AED; text-decoration:none; font-size:15px;">
            📚 Documentation Center
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;">
          <a href="https://validpanel.com/faq" style="color:#7C3AED; text-decoration:none; font-size:15px;">
            ❓ Frequently Asked Questions
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding:10px 0;">
          <a href="https://validpanel.com/community" style="color:#7C3AED; text-decoration:none; font-size:15px;">
            👥 Community Forum
          </a>
        </td>
      </tr>
    </table>

    <p style="font-size:14px; line-height:1.6; color:#666; margin-top:30px; padding-top:20px; border-top:1px solid #E5E7EB;">
      If you have any urgent concerns, please don't hesitate to reach out to us directly at 
      <a href="mailto:support@validpanel.com" style="color:#7C3AED; text-decoration:none;">support@validpanel.com</a>
    </p>

    <table role="presentation" style="width:100%; margin-top:25px; border-collapse:collapse;">
      <tr>
        <td style="text-align:center; padding:15px; background:#F9FAFB; border-radius:8px;">
          <p style="margin:0; font-size:14px; color:#6B7280;">
            <strong>Need immediate help?</strong>
          </p>
          <p style="margin:8px 0 0 0;">
            <a href="https://validpanel.com/support" style="
              background:#7C3AED;
              color:#fff;
              text-decoration:none;
              padding:10px 20px;
              border-radius:6px;
              font-weight:600;
              display:inline-block;
              font-size:14px;
              margin-top:8px;
            ">Visit Support Center</a>
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: "We've Received Your Message - ValidPanel Support",
    children: bodyContent,
    logoUrl: logo,
  });
};

/**
 * Admin notification email when a new contact message is received
 */
export const contactMessageAdminNotification = ({
  firstName,
  lastName,
  email,
  message,
  uid,
  logo,
}: ContactMessageAdminVars): TemplateResult => {
  const adminPanelLink = `https://admin.validpanel.com/contact-messages/${uid}`;

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px;">
          <h2 style="color:#7C3AED; margin:0 0 10px 0; font-size:24px;">New Contact Message Received</h2>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#FEF3C7; padding:15px; border-radius:8px; border-left:4px solid #F59E0B;">
          <p style="margin:0; font-size:14px; color:#92400E; font-weight:600;">
            ⚡ Action Required: New customer inquiry
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; border-collapse:collapse; margin-bottom:25px; background:#F9FAFB; border-radius:8px; overflow:hidden;">
      <tr>
        <td style="padding:20px;">
          <h3 style="margin:0 0 15px 0; color:#111827; font-size:16px; border-bottom:2px solid #E5E7EB; padding-bottom:10px;">
            Contact Information
          </h3>
          
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0; width:120px;">
                <strong style="color:#6B7280; font-size:14px;">Name:</strong>
              </td>
              <td style="padding:8px 0;">
                <span style="color:#111827; font-size:14px;">${firstName} ${lastName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0; width:120px;">
                <strong style="color:#6B7280; font-size:14px;">Email:</strong>
              </td>
              <td style="padding:8px 0;">
                <a href="mailto:${email}" style="color:#7C3AED; text-decoration:none; font-size:14px;">${email}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0; width:120px;">
                <strong style="color:#6B7280; font-size:14px;">Message ID:</strong>
              </td>
              <td style="padding:8px 0;">
                <span style="color:#6B7280; font-size:12px; font-family:monospace;">${uid}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; border-collapse:collapse; margin-bottom:25px; background:#FFFFFF; border:1px solid #E5E7EB; border-radius:8px; overflow:hidden;">
      <tr>
        <td style="padding:20px;">
          <h3 style="margin:0 0 15px 0; color:#111827; font-size:16px; border-bottom:2px solid #E5E7EB; padding-bottom:10px;">
            Message Content
          </h3>
          <div style="
            background:#F9FAFB;
            padding:15px;
            border-radius:6px;
            border-left:3px solid #7C3AED;
            font-size:14px;
            line-height:1.6;
            color:#374151;
            white-space:pre-wrap;
            word-wrap:break-word;
          ">${message}</div>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin-top:25px; border-collapse:collapse;">
      <tr>
        <td style="text-align:center; padding:20px; background:#EDE9FE; border-radius:8px;">
          <p style="margin:0 0 12px 0; font-size:14px; color:#5B21B6; font-weight:600;">
            Quick Actions
          </p>
          <a href="${adminPanelLink}" style="
            background:#7C3AED;
            color:#fff;
            text-decoration:none;
            padding:12px 24px;
            border-radius:6px;
            font-weight:600;
            display:inline-block;
            font-size:14px;
            margin:5px;
          ">View in Admin Panel</a>
          <a href="mailto:${email}" style="
            background:#fff;
            color:#7C3AED;
            border:2px solid #7C3AED;
            text-decoration:none;
            padding:10px 24px;
            border-radius:6px;
            font-weight:600;
            display:inline-block;
            font-size:14px;
            margin:5px;
          ">Reply Directly</a>
        </td>
      </tr>
    </table>

    <p style="font-size:13px; line-height:1.6; color:#9CA3AF; margin-top:25px; padding-top:20px; border-top:1px solid #E5E7EB; text-align:center;">
      This is an automated notification from ValidPanel Contact Form System
    </p>
  `;

  return Layout({
    subject: `New Contact Message from ${firstName} ${lastName}`,
    children: bodyContent,
    logoUrl: logo,
  });
};
