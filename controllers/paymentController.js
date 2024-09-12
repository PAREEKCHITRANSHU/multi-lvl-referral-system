const Payment = require("../models/Payment");
const User = require("../models/User");

// Process Payment
const processPayment = async (req, res) => {
  const { userId, amount } = req.body;

  try {
    // Create a new payment record with a pending status
    const payment = new Payment({
      userId,
      amount,
      status: "pending",
    });

    // Save the payment record
    await payment.save();

    // Simulate payment success
    payment.status = "completed";
    await payment.save();

    // Update referral bonuses
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Direct referrer
    if (user.referredBy) {
      const referrer = await User.findOne({ referralCode: user.referredBy });
      if (referrer) {
        referrer.bonus += 50; // Direct referral bonus
        await referrer.save();

        // Level 1 referrer
        if (referrer.referredBy) {
          const referrerLevel1 = await User.findOne({
            referralCode: referrer.referredBy,
          });
          if (referrerLevel1) {
            referrerLevel1.bonus += 25; // Level 1 bonus
            await referrerLevel1.save();

            // Level 2 referrer
            if (referrerLevel1.referredBy) {
              const referrerLevel2 = await User.findOne({
                referralCode: referrerLevel1.referredBy,
              });
              if (referrerLevel2) {
                referrerLevel2.bonus += 15; // Level 2 bonus
                await referrerLevel2.save();
              }
            }
          }
        }
      }
    }

    // Respond with the updated payment information
    res.status(200).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { processPayment };
