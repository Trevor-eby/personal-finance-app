const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,    // Validates email format
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,   // This stores the hashed password
      validate: {
        notEmpty: true,
        len: [6, 100],    // Password length constraints
      },
    },
  }, {
    timestamps: true,
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  });

  User.associate = (models) => {
    User.hasMany(models.Transaction, { foreignKey: 'userId', as: 'transactions' });
  };

  return User;
};
