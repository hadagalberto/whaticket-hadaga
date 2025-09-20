import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("AiAgents", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      provider: {
        type: DataTypes.ENUM("openai", "gemini"),
        allowNull: false
      },
      apiKey: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      model: {
        type: DataTypes.STRING,
        allowNull: false
      },
      systemPrompt: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      temperature: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1.0
      },
      maxTokens: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1000
      },
      maxMessages: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      queueId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Queues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("AiAgents");
  }
};
