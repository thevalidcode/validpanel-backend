import { Layout, LogoVars, TemplateResult } from "../components/EmailLayout";

export interface AdminForgotPasswordVars {
  email: string;
  token: string;
  logo: string;
}

export const adminForgotPassword = ({
  email,
  token,
  logo,
}: AdminForgotPasswordVars): TemplateResult => {
  const resetLink = `https://validpanel.com/admin/reset-password?email=${encodeURIComponent(
    email
  )}&token=${encodeURIComponent(token)}`;

  const bodyContent = `
    <p style="font-size:16px; margin-bottom:20px;">Hello Admin,</p>
    <p style="font-size:16px; margin-bottom:20px;">
      We received a request to reset your admin password. Click the button below to set a new password.
    </p>
    <p style="text-align:center; margin-bottom:30px;">
      <a href="${resetLink}" style="
        background:#7C3AED;
        color:#fff;
        text-decoration:none;
        padding:12px 25px;
        border-radius:6px;
        font-weight:bold;
        display:inline-block;
      ">Reset Admin Password</a>
    </p>
    <p style="font-size:14px; color:#666;">
      If you did not request a password reset, you can safely ignore this email.
    </p>
  `;

  return Layout({
    subject: "Reset Your Admin Password",
    children: bodyContent,
    logoUrl: logo,
  });
};

export const adminPasswordChanged = ({ logo }: LogoVars): TemplateResult => {
  const bodyContent = `
    <p style="font-size:16px; margin-bottom:20px;">Hello Admin,</p>

    <p style="font-size:16px; margin-bottom:20px;">
      Your admin password has been successfully changed. If you initiated this change, no further action is needed.
    </p>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#EDE9FE; padding:15px; border-radius:8px; text-align:center;">
          <span style="color:#7C3AED; font-weight:bold; font-size:16px;">Admin Password Changed Successfully</span>
        </td>
      </tr>
    </table>

    <p style="font-size:14px; color:#666;">
      If you did NOT change your password, please <a href="https://validpanel.com/contact" style="color:#7C3AED; text-decoration:none;">contact support immediately</a>.
    </p>
  `;

  return Layout({
    subject: "Your Admin Password Has Been Changed",
    children: bodyContent,
    logoUrl: logo,
  });
};
