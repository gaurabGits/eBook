const User = require("../models/user");

const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (req.user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Admin access only" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { adminOnly };
