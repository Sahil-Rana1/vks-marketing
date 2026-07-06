import Contact from '../models/Contact.js';
import sendEmail from '../utils/sendEmail.js';

/**
 * @desc    Submit a contact inquiry
 * @route   POST /api/contacts
 * @access  Public
 */
export const submitContactInquiry = async (req, res, next) => {
  const { name, email, subject, message } = req.body;

  try {
    const contact = await Contact.create({
      name,
      email,
      subject,
      message
    });

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully. We will get back to you shortly!',
      contact
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all contact messages (Admin only)
 * @route   GET /api/contacts
 * @access  Private/Admin
 */
export const getContactMessages = async (req, res, next) => {
  try {
    const messages = await Contact.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: messages.length, messages });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reply to a contact inquiry (Admin only)
 * @route   POST /api/contacts/:id/reply
 * @access  Private/Admin
 */
export const replyToContactMessage = async (req, res, next) => {
  const { replyMessage } = req.body;

  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    contact.status = 'Replied';
    contact.replyMessage = replyMessage;
    await contact.save();

    // Send email notification to customer with admin's reply
    await sendEmail({
      email: contact.email,
      subject: `Reply to your inquiry: ${contact.subject} - VKS Marketing`,
      message: `Hello ${contact.name},\n\nThank you for reaching out to VKS Marketing. Here is our response to your query:\n\n"${replyMessage}"\n\nBest regards,\nCustomer Support Team\nVKS Marketing`,
      html: `
        <div style="font-family: 'Poppins', sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e0e0e0;">
          <h2 style="color: #F59E0B; margin-bottom: 20px;">VKS Marketing</h2>
          <p>Hello <b>${contact.name}</b>,</p>
          <p>Thank you for reaching out. Here is our support response to your message regarding "<i>${contact.subject}</i>":</p>
          <blockquote style="border-left: 4px solid #F59E0B; padding-left: 15px; margin: 20px 0; color: #111827; font-style: italic;">
            ${replyMessage}
          </blockquote>
          <p style="font-size: 13px; color: #6B7280; margin-top: 30px;">Best regards,<br>Support Team<br>VKS Marketing</p>
        </div>
      `
    });

    res.status(200).json({ success: true, message: 'Reply sent and recorded successfully', contact });
  } catch (error) {
    next(error);
  }
};
