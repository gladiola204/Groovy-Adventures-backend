import Token from "../models/tokenModel";


// function to remove invalid tokens
const removeExpiredTokens = async () => {
    const currentTime = new Date();
    try {
      await Token.deleteMany({ expiresAt: { $lt: currentTime } });
      console.log('Expired tokens removed successfully');
    } catch (err) {
      console.log('Error removing expired tokens:', err);
    }
  };
  
  // We run a function to remove invalid tokens every 1 hour
  setInterval(removeExpiredTokens, 3600000);