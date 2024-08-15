const Users = require('../models/userModel');

const getAllUsers = async () => {
  return await User.findAll();
};

module.exports = {
  getAllUsers
}
