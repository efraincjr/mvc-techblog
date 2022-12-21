// An index file to gather the models and export them for use

// User model
const User = require("./User");
// Post model
const Post = require("./Post");
// Comment model
const Comment = require("./Comment");

// Create associations between the models
// User-Post relationship
User.hasMany(Post, {
  foreignKey: "user_id",
});

Post.belongsTo(User, {
  foreignKey: "user_id",
});

Comment.belongsTo(User, {
  foreignKey: "user_id",
  onDelete: "cascade",
  hooks: true,
});

Comment.belongsTo(Post, {
  foreignKey: "post_id",
  onDelete: "cascade",
  hooks: true,
});

User.hasMany(Comment, {
  foreignKey: "user_id",
  onDelete: "cascade",
  hooks: true,
});

Post.hasMany(Comment, {
  foreignKey: "post_id",
  onDelete: "cascade",
  hooks: true,
});

// Export the modules
module.exports = { User, Post, Comment };
