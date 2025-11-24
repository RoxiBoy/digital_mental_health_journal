const bcrypt = require("bcryptjs")

bcrypt.compare("Jotarokun1@", "$2b$10$F3fyNrJL2boyYUa4RURtf.UL8.T0t0cM7cdmepVn0X3UhUKzkZiO2")
  .then(result => console.log("MATCH?", result))
