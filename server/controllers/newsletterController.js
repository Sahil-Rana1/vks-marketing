import Newsletter from '../models/Newsletter.js';

/**
 * @desc    Subscribe to newsletter
 * @route   POST /api/newsletter/subscribe
 * @access  Public
 */
export const subscribeNewsletter = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address' });
    }

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (subscriber) {
      if (subscriber.isSubscribed) {
        return res.status(400).json({ success: false, message: 'You are already subscribed to our newsletter' });
      }

      // Re-subscribe if unsubscribed
      subscriber.isSubscribed = true;
      await subscriber.save();
      return res.status(200).json({ success: true, message: 'Subscribed to newsletter successfully!' });
    }

    await Newsletter.create({ email: email.toLowerCase() });
    res.status(201).json({ success: true, message: 'Subscribed to newsletter successfully!' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Unsubscribe from newsletter
 * @route   POST /api/newsletter/unsubscribe
 * @access  Public
 */
export const unsubscribeNewsletter = async (req, res, next) => {
  const { email } = req.body;

  try {
    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (!subscriber || !subscriber.isSubscribed) {
      return res.status(404).json({ success: false, message: 'Email address not found in our subscription list' });
    }

    subscriber.isSubscribed = false;
    await subscriber.save();

    res.status(200).json({ success: true, message: 'Unsubscribed from newsletter successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all newsletter subscribers (Admin only)
 * @route   GET /api/newsletter/subscribers
 * @access  Private/Admin
 */
export const getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Newsletter.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: subscribers.length, subscribers });
  } catch (error) {
    next(error);
  }
};
