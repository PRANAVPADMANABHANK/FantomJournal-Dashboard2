const bcrypt = require('bcrypt');
const saltRounds = 10; // You can adjust the number of salt rounds

const hashPassword = async (req, res, next) => {
  try {
    if (req.body.password) {
      // Hash the password
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      // Replace the plain text password with the hashed password
      req.body.password = hashedPassword;
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = hashPassword;
