const UserService = require('../services/userService');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
