import { Layout, LogoVars, TemplateResult } from "../components/EmailLayout";

export interface WelcomeUserVars extends LogoVars {
  firstName: string;
  email: string;
}

/**
 * Welcome email for new user registration
 */
export const welcomeUser = ({
  firstName,
  email,
  logo,
}: WelcomeUserVars): TemplateResult => {
  const dashboardUrl = "https://validpanel.com/analytics";
  const docsUrl = "https://validpanel.com/docs";
  const pricingUrl = "https://validpanel.com/pricing";

  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          <div style="
            width:80px;
            height:80px;
            background:linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
            border-radius:50%;
            margin:0 auto 20px;
            display:flex;
            align-items:center;
            justify-content:center;
          ">
            <span style="font-size:36px;">🎉</span>
          </div>
          <h1 style="color:#1F2937; margin:0 0 10px 0; font-size:28px; font-weight:700;">
            Welcome to Valid Panel!
          </h1>
          <p style="color:#6B7280; margin:0; font-size:16px;">
            Your account has been created successfully
          </p>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${firstName},
    </p>

    <p style="font-size:16px; line-height:1.6; margin-bottom:20px; color:#333;">
      Thank you for joining Valid Panel! We're excited to have you on board. Your journey to seamless store management starts now.
    </p>

    <table role="presentation" style="width:100%; margin:30px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#F9FAFB; padding:25px; border-radius:12px; border:1px solid #E5E7EB;">
          <h3 style="color:#7C3AED; margin:0 0 15px 0; font-size:18px;">
            🚀 Get Started in 3 Easy Steps
          </h3>
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:10px 0; vertical-align:top; width:30px;">
                <span style="
                  display:inline-block;
                  width:24px;
                  height:24px;
                  background:#7C3AED;
                  color:#fff;
                  border-radius:50%;
                  text-align:center;
                  line-height:24px;
                  font-size:12px;
                  font-weight:bold;
                ">1</span>
              </td>
              <td style="padding:10px 0 10px 10px;">
                <strong style="color:#333;">Choose a Plan</strong>
                <p style="margin:5px 0 0; color:#6B7280; font-size:14px;">
                  Select the subscription plan that fits your needs
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0; vertical-align:top; width:30px;">
                <span style="
                  display:inline-block;
                  width:24px;
                  height:24px;
                  background:#7C3AED;
                  color:#fff;
                  border-radius:50%;
                  text-align:center;
                  line-height:24px;
                  font-size:12px;
                  font-weight:bold;
                ">2</span>
              </td>
              <td style="padding:10px 0 10px 10px;">
                <strong style="color:#333;">Create Your Store</strong>
                <p style="margin:5px 0 0; color:#6B7280; font-size:14px;">
                  Set up your first store with our easy onboarding process
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 0; vertical-align:top; width:30px;">
                <span style="
                  display:inline-block;
                  width:24px;
                  height:24px;
                  background:#7C3AED;
                  color:#fff;
                  border-radius:50%;
                  text-align:center;
                  line-height:24px;
                  font-size:12px;
                  font-weight:bold;
                ">3</span>
              </td>
              <td style="padding:10px 0 10px 10px;">
                <strong style="color:#333;">Start Selling</strong>
                <p style="margin:5px 0 0; color:#6B7280; font-size:14px;">
                  Launch your store and begin growing your business
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:25px 0; border-collapse:collapse;">
      <tr>
        <td style="text-align:center;">
          <a href="${dashboardUrl}" style="
            display:inline-block;
            background:linear-gradient(135deg, #7C3AED 0%, #A855F7 100%);
            color:#fff;
            text-decoration:none;
            padding:14px 35px;
            border-radius:8px;
            font-weight:600;
            font-size:16px;
          ">Go to Dashboard</a>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin:30px 0; border-collapse:collapse;">
      <tr>
        <td style="padding:20px; background:#EDE9FE; border-radius:8px;">
          <p style="margin:0 0 10px 0; font-size:14px; color:#5B21B6; font-weight:600;">
            📧 Your Account Details
          </p>
          <p style="margin:0; font-size:14px; color:#6B21A8;">
            Email: <strong>${email}</strong>
          </p>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin-top:30px; border-collapse:collapse;">
      <tr>
        <td style="width:50%; padding-right:10px; vertical-align:top;">
          <a href="${docsUrl}" style="
            display:block;
            padding:15px;
            background:#F9FAFB;
            border-radius:8px;
            text-decoration:none;
            border:1px solid #E5E7EB;
          ">
            <span style="font-size:20px; display:block; margin-bottom:8px;">📚</span>
            <span style="color:#333; font-weight:600; font-size:14px; display:block;">Documentation</span>
            <span style="color:#6B7280; font-size:12px;">Learn the basics</span>
          </a>
        </td>
        <td style="width:50%; padding-left:10px; vertical-align:top;">
          <a href="${pricingUrl}" style="
            display:block;
            padding:15px;
            background:#F9FAFB;
            border-radius:8px;
            text-decoration:none;
            border:1px solid #E5E7EB;
          ">
            <span style="font-size:20px; display:block; margin-bottom:8px;">💎</span>
            <span style="color:#333; font-weight:600; font-size:14px; display:block;">View Plans</span>
            <span style="color:#6B7280; font-size:12px;">Choose your plan</span>
          </a>
        </td>
      </tr>
    </table>

    <table role="presentation" style="width:100%; margin-top:30px; border-collapse:collapse;">
      <tr>
        <td style="padding-top:20px; border-top:1px solid #E5E7EB;">
          <p style="margin:0; font-size:14px; color:#6B7280;">
            Best regards,<br>
            <strong style="color:#333;">The Valid Panel Team</strong>
          </p>
        </td>
      </tr>
    </table>
  `;

  return Layout({
    subject: "Welcome to Valid Panel! 🎉",
    children: bodyContent,
    logoUrl: logo,
  });
};
