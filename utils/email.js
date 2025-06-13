const nodemailer = require("nodemailer");
const { addDoc } = require("../crud");
const { getTemplate } = require("./emailTemplates");

const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: "unix",
  path: "/usr/sbin/sendmail",
});

const getEmailTemplate = (type, data, logoUrl) => {
  const variables = {
    logo: logoUrl,
    ...data,
  };
  const defaultTemplate = getTemplate(type, variables);

  return {
    subject: `${type
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()} Notification`,
    html: defaultTemplate,
  };
};

const sendEmailConfig = async (from, to, type, data, logoUrl) => {
  const emailTemplate = getEmailTemplate(type, data, logoUrl);
  try {
    const mailOptions = {
      from,
      to,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      headers: {
        "List-Unsubscribe":
          "<mailto:unsubscribe@validpanel.com>, <https://validpanel.com/unsubscribe>",
      },
    };

    let info = await transporter.sendMail(mailOptions);
    await addDoc("email_notifications", {
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
    await addDoc("email_notifications", {
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
      "https://validpanel.com/assets/ValidPanel-CLfY079M.png"
    );
  } catch (error) {
    console.error({ error });
  }
};

module.exports = { sendEmail };
