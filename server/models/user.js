module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,            // Validates email format
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,           // This will store the hashed password
      validate: {
        notEmpty: true,
        len: [6, 100],            // Password length constraints
      },
    },
  }, {
    timestamps: true,
    tableName: 'users',           // Optional: set table name explicitly
  });

  return User;
};
