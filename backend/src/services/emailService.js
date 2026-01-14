import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
  constructor() {
    this.transporter = null;
    this.init();
  }

  async init() {
    try {
      // Check if email service is enabled
      if (process.env.SMTP_ENABLED === "false") {
        console.log("📧 Email service is disabled");
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Verify connection
      if (process.env.NODE_ENV === "development") {
        await this.transporter.verify();
        console.log("✅ Email service initialized successfully");
      }
    } catch (error) {
      console.error("❌ Email service initialization failed:", error);
      console.log("💡 Set SMTP_ENABLED=false in .env to disable email service");
    }
  }

  /**
   * Load email template
   * @param {string} templateName - Template file name
   * @returns {Promise<string>} Template content
   */
  async loadTemplate(templateName) {
    try {
      const templatePath = path.join(
        __dirname,
        "../templates/emails",
        `${templateName}.html`
      );
      return await fs.readFile(templatePath, "utf-8");
    } catch (error) {
      console.error(`Failed to load email template: ${templateName}`, error);
      return this.getDefaultTemplate();
    }
  }

  /**
   * Get default email template
   * @returns {string} Default template
   */
  getDefaultTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{subject}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 12px 24px; background: #FF9800; color: white; text-decoration: none; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Memory Lane</h1>
          </div>
          <div class="content">
            {{content}}
          </div>
          <div class="footer">
            <p>&copy; 2024 Memory Lane. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Replace template variables
   * @param {string} template - Template content
   * @param {Object} data - Data to replace
   * @returns {string} Processed template
   */
  processTemplate(template, data) {
    let processed = template;

    Object.keys(data).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      processed = processed.replace(regex, data[key] || "");
    });

    return processed;
  }

  /**
   * Send email
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.template - Template name
   * @param {Object} options.data - Template data
   * @param {string} options.html - Direct HTML content
   * @param {string} options.text - Plain text content
   * @returns {Promise<Object>} Send result
   */
  async sendEmail(options) {
    // Check if email service is disabled
    if (process.env.SMTP_ENABLED === "false") {
      console.log(
        `📧 Email would be sent to ${options.to}: ${options.subject} (Email service disabled)`
      );
      return { messageId: "disabled", accepted: [options.to] };
    }

    if (!this.transporter) {
      throw new Error("Email service not initialized");
    }

    const { to, subject, template, data = {}, html, text } = options;

    let emailHtml = html;
    let emailText = text;

    // Process template if provided
    if (template) {
      const templateContent = await this.loadTemplate(template);
      emailHtml = this.processTemplate(templateContent, { ...data, subject });
    } else if (!html) {
      // Use default template with content
      const defaultTemplate = this.getDefaultTemplate();
      emailHtml = this.processTemplate(defaultTemplate, {
        ...data,
        subject,
        content: data.content || "No content provided",
      });
    }

    const mailOptions = {
      from: `${process.env.FROM_NAME || "Memory Lane"} <${
        process.env.FROM_EMAIL || process.env.SMTP_USER
      }>`,
      to,
      subject,
      html: emailHtml,
      text: emailText,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}: ${subject}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(user) {
    return this.sendEmail({
      to: user.email,
      subject: "Welcome to Memory Lane!",
      template: "welcome",
      data: {
        name: user.getFullName(),
        email: user.email,
      },
    });
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(user, verificationUrl) {
    return this.sendEmail({
      to: user.email,
      subject: "Verify your email address",
      template: "email-verification",
      data: {
        name: user.getFullName(),
        verificationUrl,
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(user, resetUrl) {
    return this.sendEmail({
      to: user.email,
      subject: "Password Reset Request",
      template: "password-reset",
      data: {
        name: user.getFullName(),
        resetUrl,
        expiresIn: "10 minutes",
      },
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(user, order) {
    return this.sendEmail({
      to: user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      template: "order-confirmation",
      data: {
        name: user.getFullName(),
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        items: order.items,
        shippingAddress: order.shippingAddress,
      },
    });
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(user, order, oldStatus) {
    const statusMessages = {
      confirmed: "Your order has been confirmed and is being prepared.",
      packing: "Your order is being packed for shipment.",
      shipping: "Your order has been shipped and is on its way.",
      delivered: "Your order has been delivered successfully.",
      cancelled: "Your order has been cancelled.",
      returned: "Your order return has been processed.",
    };

    return this.sendEmail({
      to: user.email,
      subject: `Order Update - ${order.orderNumber}`,
      template: "order-status-update",
      data: {
        name: user.getFullName(),
        orderNumber: order.orderNumber,
        status: order.status,
        statusMessage:
          statusMessages[order.status] || "Your order status has been updated.",
      },
    });
  }

  /**
   * Send bulk emails
   * @param {Array} emails - Array of email options
   * @returns {Promise<Array>} Results array
   */
  async sendBulkEmails(emails) {
    const results = [];

    for (const email of emails) {
      try {
        const result = await this.sendEmail(email);
        results.push({ success: true, result, email: email.to });
      } catch (error) {
        results.push({ success: false, error: error.message, email: email.to });
      }
    }

    return results;
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export convenience functions
export const sendEmail = (options) => emailService.sendEmail(options);
export const sendWelcomeEmail = (user) => emailService.sendWelcomeEmail(user);
export const sendEmailVerification = (user, url) =>
  emailService.sendEmailVerification(user, url);
export const sendPasswordReset = (user, url) =>
  emailService.sendPasswordReset(user, url);
export const sendOrderConfirmation = (user, order) =>
  emailService.sendOrderConfirmation(user, order);
export const sendOrderStatusUpdate = (user, order, oldStatus) =>
  emailService.sendOrderStatusUpdate(user, order, oldStatus);
export const sendBulkEmails = (emails) => emailService.sendBulkEmails(emails);

export default emailService;
