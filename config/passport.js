const LocalStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
const User = require("./../models/User.model");
const Admin = require("./../models/Admin.model")

module.exports = (passport) => {
  // For Regular Users
  passport.use('userLocal',
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {

      //Match User
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            return done(null, false, {
              message: "This email is not registered",
            });
          } else {
              
            //Match Password
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: "Password incorrect" });
              }
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    })
  );

  passport.use('adminLocal',
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {

      //Match User
      Admin.findOne({ email: email })
        .then((user) => {
          if (!user) {
            return done(null, false, {
              message: "This email is not registered",
            });
          } else {
              
            //Match Password
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: "Password incorrect" });
              }
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    })
  );
  
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    if(user!=null){
      done(null, user);
    }
  });
};