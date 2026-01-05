export interface EmailLayoutProps {
  subject: string;
  children: string; // HTML content for the body
  logoUrl?: string;
}

export interface TemplateResult {
  subject: string;
  html: string;
}

export interface LogoVars {
  logo: string;
}

export const Header = (logoUrl?: string) => `
  <tr>
    <td style="padding:0;">
      <table role="presentation" style="width:100%; border-collapse:collapse;">
        <tr>
          <td style="padding:32px 40px; background:#FFFFFF; border-bottom:1px solid #E5E7EB;">
            <img 
              src="${logoUrl || "https://validpanel.com/logo.png"}" 
              alt="Valid Panel" 
              width="140" 
              height="auto"
              style="display:block; max-width:140px; height:auto;"
            />
          </td>
        </tr>
      </table>
    </td>
  </tr>
`;

export const Footer = () => `
  <tr>
    <td style="padding:0;">
      <table role="presentation" style="width:100%; border-collapse:collapse;">
        <!-- Divider -->
        <tr>
          <td style="padding:0 40px;">
            <div style="height:1px; background:#E5E7EB; margin:0;"></div>
          </td>
        </tr>
        <!-- Footer Content -->
        <tr>
          <td style="padding:32px 40px; background:#FAFAFA;">
            <table role="presentation" style="width:100%; border-collapse:collapse;">
              <tr>
                <td style="padding-bottom:16px; text-align:center;">
                  <table role="presentation" style="display:inline-block; border-collapse:collapse;">
                    <tr>
                      <td style="padding:0 12px;">
                        <a href="https://validpanel.com/pricing" style="color:#6B7280; text-decoration:none; font-size:13px;">Pricing</a>
                      </td>
                      <td style="padding:0 12px; color:#D1D5DB;">|</td>
                      <td style="padding:0 12px;">
                        <a href="https://validpanel.com/contact-us" style="color:#6B7280; text-decoration:none; font-size:13px;">Support</a>
                      </td>
                      <td style="padding:0 12px; color:#D1D5DB;">|</td>
                      <td style="padding:0 12px;">
                        <a href="https://validpanel.com/privacy" style="color:#6B7280; text-decoration:none; font-size:13px;">Privacy</a>
                      </td>
                      <td style="padding:0 12px; color:#D1D5DB;">|</td>
                      <td style="padding:0 12px;">
                        <a href="https://validpanel.com/terms" style="color:#6B7280; text-decoration:none; font-size:13px;">Terms</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding-top:0; text-align:center; font-size:13px; line-height:20px; color:#9CA3AF;">
                  &copy; ${new Date().getFullYear()} Valid Panel. All rights reserved.
                </td>
              </tr>
              <tr>
                <td style="padding-top:8px; text-align:center; font-size:12px; line-height:18px; color:#9CA3AF;">
                  This email was sent from Valid Panel. If you have any questions, please contact us at
                  <a href="mailto:support@validpanel.com" style="color:#7C3AED; text-decoration:none;">support@validpanel.com</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
`;

export const Layout = ({
  subject,
  children,
  logoUrl,
}: EmailLayoutProps): TemplateResult => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${subject}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin:0; padding:0; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color:#F3F4F6; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;">
  <!-- Preheader (hidden) -->
  <div style="display:none; font-size:1px; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; mso-hide:all;">
    ${subject}
  </div>
  
  <!-- Email Container -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; background-color:#F3F4F6; margin:0; padding:0;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <!-- Main Email Card -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px; background:#FFFFFF; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);">
          ${Header(logoUrl)}
          
          <!-- Body Content -->
          <tr>
            <td style="padding:40px; font-size:15px; line-height:24px; color:#1F2937; background:#FFFFFF;">
              ${children}
            </td>
          </tr>
          
          ${Footer()}
        </table>
        
        <!-- Bottom Spacer -->
        <table role="presentation" style="width:100%; max-width:600px; margin-top:16px;">
          <tr>
            <td style="text-align:center; font-size:12px; line-height:18px; color:#9CA3AF; padding:0 16px;">
              You are receiving this email because you are a valued member of Valid Panel.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
  return { subject, html };
};
