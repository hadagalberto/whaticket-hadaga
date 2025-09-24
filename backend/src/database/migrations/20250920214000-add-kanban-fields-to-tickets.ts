import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Tickets", "kanbanColumnId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "KanbanColumns", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });

    await queryInterface.addColumn("Tickets", "kanbanPosition", {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Tickets", "kanbanColumnId");
    await queryInterface.removeColumn("Tickets", "kanbanPosition");
  }
};
