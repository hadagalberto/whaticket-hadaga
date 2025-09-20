import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Primeiro, adicionar a coluna como nullable
    await queryInterface.addColumn("AiAgents", "transferQueueId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "Queues", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE"
    });

    // Buscar a primeira fila disponível para usar como padrão
    const [queues] = await queryInterface.sequelize.query(
      'SELECT id FROM "Queues" ORDER BY id LIMIT 1'
    );

    if (queues.length > 0) {
      const defaultQueueId = (queues[0] as any).id;

      // Atualizar todos os registros existentes com a fila padrão
      await queryInterface.sequelize.query(
        `UPDATE "AiAgents" SET "transferQueueId" = ${defaultQueueId} WHERE "transferQueueId" IS NULL`
      );
    }

    // Agora alterar a coluna para NOT NULL
    await queryInterface.changeColumn("AiAgents", "transferQueueId", {
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
