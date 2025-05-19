const templates = {
  forgetPassword: ({ name, random_password, logo }) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Password</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
        }
        .header img {
          max-width: 150px;
        }
        .content {
          line-height: 1.6;
        }
        .verification-code {
          background-color: #f9f9f9;
          padding: 10px;
          border-radius: 8px;
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          letter-spacing: 4px;
          margin: 20px 0;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${logo}" alt="Company Logo">
        </div>
        <div class="content">
          <h1>Password Reset Request</h1>
          <p>Hi ${name},</p>
          <p>We received a request to reset the password for your account. Please use the password below to login to your account:</p>
          <div class="verification-code">${random_password}</div>
          <p>If you did not request a password reset, please ignore this email. You can change the password after you've logged into your acount if you wish.</p>
          <p>Thank you!</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Valid Panel. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `,
};

const getTemplate = (type, variables) => {
  if (templates[type]) {
    return templates[type](variables);
  } else {
    throw new Error(`Email template for type ${type} not found.`);
  }
};

module.exports = { getTemplate };
