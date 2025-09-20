import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("AiAgents", "transferQueueId", {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "Queues", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("AiAgents", "transferQueueId");
  }
};
