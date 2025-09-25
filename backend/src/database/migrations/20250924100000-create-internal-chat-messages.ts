import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("InternalChatMessages", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    await queryInterface.addIndex("InternalChatMessages", ["createdAt"]);
    await queryInterface.addIndex("InternalChatMessages", ["userId"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("InternalChatMessages", ["userId"]);
    await queryInterface.removeIndex("InternalChatMessages", ["createdAt"]);
    await queryInterface.dropTable("InternalChatMessages");
  }
};
