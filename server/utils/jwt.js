const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = async (authToken) => {
  const obj = await jwt.verify(authToken, process.env.TOKEN_SECRET);
  return obj.id;
};
