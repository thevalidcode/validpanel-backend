import { Layout, LogoVars, TemplateResult } from "../components/EmailLayout";

export interface ForgotPasswordVars {
  email: string;
  token: string;
  logo: string;
}

export const forgotPassword = ({
  email,
  token,
  logo,
}: ForgotPasswordVars): TemplateResult => {
  const resetLink = `https://validpanel.com/reset-password?email=${encodeURIComponent(
    email
  )}&token=${encodeURIComponent(token)}`;

  const bodyContent = `
    <p style="font-size:16px; margin-bottom:20px;">Hello,</p>
    <p style="font-size:16px; margin-bottom:20px;">
      We received a request to reset your password. Click the button below to set a new password.
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
      ">Reset Password</a>
    </p>
    <p style="font-size:14px; color:#666;">
      If you did not request a password reset, you can safely ignore this email.
    </p>
  `;

  return Layout({
    subject: "Reset Your Password",
    children: bodyContent,
    logoUrl: logo,
  });
};

export const passwordChanged = ({ logo }: LogoVars): TemplateResult => {
  const bodyContent = `
    <p style="font-size:16px; margin-bottom:20px;">Hello,</p>

    <p style="font-size:16px; margin-bottom:20px;">
      Your password has been successfully changed. If you initiated this change, no further action is needed.
    </p>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#EDE9FE; padding:15px; border-radius:8px; text-align:center;">
          <span style="color:#7C3AED; font-weight:bold; font-size:16px;">Password Changed Successfully</span>
        </td>
      </tr>
    </table>

    <p style="font-size:14px; color:#666;">
      If you did NOT change your password, please <a href="https://validpanel.com/contact" style="color:#7C3AED; text-decoration:none;">contact support immediately</a>.
    </p>
  `;

  return Layout({
    subject: "Your Password Has Been Changed",
    children: bodyContent,
    logoUrl: logo,
  });
};
