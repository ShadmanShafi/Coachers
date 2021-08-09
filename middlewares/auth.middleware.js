const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      req.flash("error", "You do not have access!");
      res.redirect("login");
    }
  };
  module.exports = ensureAuthenticated;