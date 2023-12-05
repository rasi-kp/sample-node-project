const product = require('../config/productfetch');
const signup = require('../config/mongodbconn');

module.exports = {
    getCurrentUser: (req) => {
      return req.session.user;
    },
  
    findusername: async (username) => {
        return await signup.findOne({ username }); 
    },
    findallproduct: async()=>{
      return await product.find({});

    }

  };
