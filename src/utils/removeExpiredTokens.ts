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

export default removeExpiredTokens;