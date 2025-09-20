import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("AiAgents", "maxMessages", {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("AiAgents", "maxMessages");
  }
};
