// User Model

// Dependencies
// use Model and Datatype from sequelize
const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");
// use bcrypt for password hashing
const bcrypt = require("bcrypt");

// create the User model
class User extends Model {
  // set up a method to run on a user instance to check the password as provided
  // in the login route against the hashed database password
  checkPassword(loginPw) {
    return bcrypt.compareSync(loginPw, this.password);
  }
}

// define the table columns and configuration
User.init(
  {
    id: {
      type: DataTypes.INTEGER,

      allowNull: false,

      primaryKey: true,

      autoIncrement: true,
    },

    username: {
      type: DataTypes.STRING,

      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },

    email: {
      type: DataTypes.STRING,

      allowNull: false,

      unique: true,

      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING,

      allowNull: false,
      validate: {
        len: [4],
      },
    },
  },
  {
    hooks: {
      async beforeCreate(newUserData) {
        newUserData.password = await bcrypt.hash(newUserData.password, 10);
        return newUserData;
      },

      async beforeUpdate(updatedUserData) {
        updatedUserData.password = await bcrypt.hash(
          updatedUserData.password,
          10
        );
        return updatedUserData;
      },
    },

    sequelize,

    timestamps: false,

    freezeTableName: true,

    underscored: true,

    modelName: "user",
  }
);

module.exports = User;
