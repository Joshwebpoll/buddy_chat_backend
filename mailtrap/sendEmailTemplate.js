function VerifyEmailTemplate(name, verificationCode) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #dddddd;
            border-radius: 5px;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #dddddd;
        }
        .header h1 {
            color: #333333;
            font-size: 24px;
            margin: 0;
        }
        .content {
            padding: 20px;
            color: #555555;
            line-height: 1.6;
            font-size: 16px;
        }
        .code-container {
            text-align: center;
            margin: 20px 0;
        }
        .code {
            background-color: #f4f4f4;
            color: #333333;
            font-size: 24px;
            font-weight: bold;
            padding: 10px 20px;
            border: 1px dashed #dddddd;
            display: inline-block;
            letter-spacing: 2px;
        }
        .footer {
            text-align: center;
            color: #aaaaaa;
            font-size: 12px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Verify Your Email</h1>
        </div>
        <div class="content">
            <p>Hello ${name},</p>
            <p>Thank you for signing up with TaskTracker! To complete your registration, please use the verification code below:</p>
            <div class="code-container">
                <div class="code">${verificationCode}</div>
            </div>
            <p>Enter this code in the app or website to verify your email address. This code will expire in 1 hours. If you did not sign up with us, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TaskTracker. All rights reserved.</p>
            <p>If you have any issues, please contact our support team at [support email].</p>
        </div>
    </div>
</body>
</html>

`;
}

function resetPasswordUserLink(user, resentLink, platform) {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #dddddd;
            border-radius: 5px;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #dddddd;
        }
        .header h1 {
            color: #333333;
            font-size: 24px;
            margin: 0;
        }
        .content {
            padding: 20px;
            color: #555555;
            line-height: 1.6;
            font-size: 16px;
        }
        .button-container {
            text-align: center;
            margin: 20px 0;
        }
        .button {
           background-color: #4CAF50;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            color: #aaaaaa;
            font-size: 12px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Reset Your Password</h1>
        </div>
        <div class="content">
            <p>Hello ${user.name},</p>
            <p>We received a request to reset your password. Please click the button or enter the otp below to set a new password:</p>
            <div class="button-container">
                ${
                  platform === "mobile"
                    ? `<h1>${resentLink}</h1>`
                    : `<a href="http://${resentLink}" class="button" style="color:#ffffff;">Reset My Password</a>`
                }
            </div>
            <p>This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TaskTracker. All rights reserved.</p>
            <p>If you have any issues, please contact our support team at [support email].</p>
        </div>
    </div>
</body>
</html>

    
    
    `;
}

function sendSuccessEmailToUser(user) {
  return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verified Successfully</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #dddddd;
            border-radius: 5px;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #dddddd;
        }
        .header h1 {
            color: #4CAF50;
            font-size: 24px;
            margin: 0;
        }
        .content {
            padding: 20px;
            color: #555555;
            line-height: 1.6;
            font-size: 16px;
        }
        .button-container {
            text-align: center;
            margin: 20px 0;
        }
        .button {
            background-color: #4CAF50;
            color: #ffffff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            color: #aaaaaa;
            font-size: 12px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Email Verified Successfully!</h1>
        </div>
        <div class="content">
            <p>Hello ${user},</p>
            <p>Thank you for verifying your email address. Your email has been successfully verified, and your account is now fully activated!</p>
            <p>You can now log in and enjoy all the features we offer.</p>
            <div class="button-container">
                <a href="[Login URL]" class="button">Go to Dashboard</a>
            </div>
            <p>If you have any questions or need support, feel free to contact our team at [support email].</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TaskTracker. All rights reserved.</p>
            <p>If you did not verify this email, please disregard this message.</p>
        </div>
    </div>
</body>
</html>

    
    `;
}

function sendResetEmailToUser(user) {
  return `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border: 1px solid #dddddd;
            border-radius: 5px;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #dddddd;
        }
        .header h1 {
            color: #4CAF50;
            font-size: 24px;
            margin: 0;
        }
        .content {
            padding: 20px;
            color: #555555;
            line-height: 1.6;
            font-size: 16px;
        }
        .footer {
            text-align: center;
            color: #aaaaaa;
            font-size: 12px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Password Reset Successful</h1>
        </div>
        <div class="content">
            <p>Hello ${user.name},</p>
            <p>Your password has been successfully reset. You can now log in with your new password.</p>
            <p>If you did not request this change, please contact our support team immediately to secure your account.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} TaskTracker. All rights reserved.</p>
            <p>If you need further assistance, feel free to contact us at [support email].</p>
        </div>
    </div>
</body>
</html>

  
  `;
}
module.exports = {
  VerifyEmailTemplate,
  resetPasswordUserLink,
  sendSuccessEmailToUser,
  sendResetEmailToUser,
};
