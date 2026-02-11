const User = require("../models/user");

const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.role === "admin") {
      next();
    } else {
      res.status(403).json({ message: "Admin access only" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { adminOnly };
