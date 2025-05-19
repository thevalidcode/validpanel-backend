const nodemailer = require("nodemailer");
const { addDoc, getDocs, updateDoc } = require("../crud");
const { getTemplate } = require("./emailTemplates");

const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: "unix",
  path: "/usr/sbin/sendmail",
});

const interpolateHtml = (html, variables) => {
  return html.replace(/\{\{(.*?)\}\}/g, (_, variableName) => {
    return variables[variableName.trim()] || "";
  });
};

const getEmailTemplate = async (type, data, logoUrl) => {
  const templates = getDocs("notifications", null, {
    find: { field: "uid", operator: "===", value: "email_templates" },
  });

  const variables = {
    logo: logoUrl,
    ...data,
  };

  if (!templates[type]) {
    updateDoc("notifications", "email_templates", { [type]: "" });
  }
  const interpolatedHtml = interpolateHtml(templates[type] || "", variables);
  const defaultTemplate = getTemplate(type, variables);
  const htmlTemplate = interpolatedHtml ? interpolatedHtml : defaultTemplate;

  return {
    subject: `${type
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()} Notification`,
    html: htmlTemplate,
  };
};

const sendEmailConfig = async (from, to, type, data, logoUrl) => {
  const emailTemplate = await getEmailTemplate(type, data, logoUrl);
  try {
    const mailOptions = {
      from,
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    };

    let info = await transporter.sendMail(mailOptions);
    addDoc("notifications", {
      from,
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      timestamp: new Date(),
      status: "success",
      messageId: info.messageId,
      response: info.response,
    });
    return { success: true };
  } catch (error) {
    addDoc("notifications", {
      from,
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      timestamp: new Date(),
      status: "error",
      response: error.message,
    });
    return { success: false };
  }
};

const sendEmail = async (
  from = '"Valid Panel" <contact@validpanel.com>',
  to,
  type,
  data
) => {
  try {
    sendEmailConfig(
      from,
      to,
      type,
      data,
      "https://validpanel.com/static/media/ValidPanelLogo.png"
    );
  } catch (error) {
    console.error({ error });
  }
};

module.exports = { sendEmail };
