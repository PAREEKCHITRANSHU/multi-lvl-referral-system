const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Token not provided." });
  }

  const jwtToken = token.startsWith("Bearer ") ? token.slice(7).trim() : token;

  try {
    // Verify the token
    const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);
    // console.log("Token verified:", isVerified);

    // Fetch user details without password
    const userData = await User.findOne({
      email: isVerified.email.toLowerCase(),
    }).select({
      password: 0,
    });

    if (!userData) {
      return res.status(404).json({ message: "User not found." });
    }
    // Attach user data and token to request
    req.token = jwtToken;
    req.user = userData;
    req.userID = userData._id;

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      message: "Unauthorized. Invalid or expired token. Please Login again",
    });
  }
};

module.exports = authMiddleware;
