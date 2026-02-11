const express = require('express');
const {registerUser, loginUser} = require('../controllers/authControllers');
const {protect} = require('../middleware/authMiddleware');

const router = express.Router(); //  mini version of the Express app, used to group related routes together.

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Access granted",
    user: {
      id: req.user.id,
      role: req.user.role
    }
  });
});

module.exports = router;
