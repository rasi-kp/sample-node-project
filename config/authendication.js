//Authendiaction is isAuth

const isAuth = (req, res, next) => {
    if (req.session.loggedIn) {
      next();
    } else {
      res.redirect('/')
    }
  };

  module.exports = isAuth;