// Email-safe circular icon helper
// Returns a small table-based snippet to ensure centering works across email clients
export const circularIcon = (emoji: string, background: string) => {
  return `
  <table role="presentation" align="center" style="margin:0 auto 15px;">
    <tr>
      <td style="width:60px; height:60px; background:${background}; border-radius:50%; text-align:center; vertical-align:middle;">
        <div style="display:inline-block; line-height:60px; font-size:28px;">${emoji}</div>
      </td>
    </tr>
  </table>
  `;
};

export default circularIcon;
