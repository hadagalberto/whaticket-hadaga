import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Verificar se existem filas
    const [queues] = await queryInterface.sequelize.query(
      "SELECT id FROM Queues ORDER BY id LIMIT 1"
    );

    if (queues.length === 0) {
      throw new Error(
        "No queues found. Please create at least one queue before running this migration."
      );
    }

    const defaultQueueId = (queues[0] as any).id;

    // Criar tabela AiAgents completa
    await queryInterface.createTable("AiAgents", {
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
      transferQueueId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: defaultQueueId,
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

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("AiAgents");
  }
};
