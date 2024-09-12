const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register user
const registerUser = async (req, res) => {
  const { name, email, password, referredBy } = req.body;
  const referralCode = Math.random().toString(36).substr(2, 8);

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      referralCode,
      referredBy,
    });

    await newUser.save();

    // Referral logic (bonus for referrer)

    if (referredBy) {
      const referrer = await User.findOne({ referralCode: referredBy });
      if (referrer) {
        referrer.referralCount += 1;
        referrer.bonus += 15; // Direct referral bonus
        referrer.referredUsers.push(newUser._id); // Add new user's ID to the referredUsers array
        await referrer.save();

        // Level 1 bonus
        if (referrer.referredBy) {
          const referrerLevel1 = await User.findOne({
            referralCode: referrer.referredBy,
          });
          if (referrerLevel1) {
            referrerLevel1.bonus += 10; // Level 1 bonus
            await referrerLevel1.save();

            // Level 2 bonus
            if (referrerLevel1.referredBy) {
              const referrerLevel2 = await User.findOne({
                referralCode: referrerLevel1.referredBy,
              });
              if (referrerLevel2) {
                referrerLevel2.bonus += 5; // Level 2 bonus
                await referrerLevel2.save();
              }
            }
          }
        }
      }
    }

    // Create JWT token
    const token = jwt.sign(
      { email: newUser.email, id: newUser._id }, //email lagaya..
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(201).json({ token, user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Create JWT token
    const token = jwt.sign(
      { email: user.email, id: user._id }, //email lgaaya
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { registerUser, loginUser };
