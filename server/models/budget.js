module.exports = (sequelize, DataTypes) => {
  const Budget = sequelize.define('Budget', {
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    limit: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    timestamps: true,
    tableName: 'budgets',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'category']
      }
    ]
  });

  Budget.associate = models => {
    Budget.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Budget;
};
