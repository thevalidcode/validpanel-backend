import { Layout, LogoVars, TemplateResult } from "../components/EmailLayout";
import circularIcon from "./components/circularIcon";

export interface CouponUsedOwnerVars extends LogoVars {
  couponCode: string;
  ownerName?: string;
  subscriberName: string;
  subscriberEmail: string;
  planName: string;
  amountSaved: string;
  currency: string;
  usedAt: string;
}

export const couponUsedOwner = ({
  couponCode,
  ownerName,
  subscriberName,
  subscriberEmail,
  planName,
  amountSaved,
  currency,
  usedAt,
  logo,
}: CouponUsedOwnerVars): TemplateResult => {
  const bodyContent = `
    <table role="presentation" style="width:100%; border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:20px; text-align:center;">
          ${circularIcon("🏷️", "linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)")}
          <h1 style="color:#1F2937; margin:0 0 10px 0; font-size:24px; font-weight:700;">
            Coupon Used
          </h1>
          <p style="color:#6B7280; margin:0; font-size:14px;">
            ${couponCode} was redeemed on a subscription payment.
          </p>
        </td>
      </tr>
    </table>

    <p style="font-size:16px; line-height:1.6; margin:20px 0; color:#333;">
      Hi ${ownerName || "there"},
    </p>

    <table role="presentation" style="width:100%; margin:20px 0; border-collapse:collapse;">
      <tr>
        <td style="background:#EFF6FF; padding:20px; border-radius:12px; border:1px solid #BFDBFE;">
          <table role="presentation" style="width:100%; border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px; width:150px;">Coupon Code:</td>
              <td style="padding:8px 0; color:#111827; font-size:14px; font-weight:600;">${couponCode}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Subscriber:</td>
              <td style="padding:8px 0; color:#111827; font-size:14px; font-weight:600;">${subscriberName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Subscriber Email:</td>
              <td style="padding:8px 0; color:#111827; font-size:14px; font-weight:600;">${subscriberEmail}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Plan:</td>
              <td style="padding:8px 0; color:#111827; font-size:14px; font-weight:600;">${planName}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Amount Saved:</td>
              <td style="padding:8px 0; color:#111827; font-size:14px; font-weight:600;">${currency} ${amountSaved}</td>
            </tr>
            <tr>
              <td style="padding:8px 0; color:#6B7280; font-size:14px;">Used At:</td>
              <td style="padding:8px 0; color:#111827; font-size:14px; font-weight:600;">${usedAt}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="font-size:14px; line-height:1.6; margin:18px 0 0; color:#6B7280;">
      This notification is sent when your coupon is redeemed on Valid Panel.
    </p>
  `;

  return Layout({
    subject: `Coupon Redeemed: ${couponCode}`,
    children: bodyContent,
    logoUrl: logo,
  });
};
