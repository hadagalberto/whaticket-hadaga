import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Verificar se existem filas disponíveis
    const [queues] = await queryInterface.sequelize.query(
      "SELECT id FROM Queues ORDER BY id LIMIT 1"
    );

    if (queues.length === 0) {
      throw new Error(
        "No queues found. Please create at least one queue before running this migration."
      );
    }

    const defaultQueueId = (queues[0] as any).id;

    // Adicionar a coluna diretamente como NOT NULL com valor padrão
    await queryInterface.addColumn("AiAgents", "transferQueueId", {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: defaultQueueId,
      references: { model: "Queues", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("AiAgents", "transferQueueId");
  }
};
