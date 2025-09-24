import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Verificar se existe pelo menos um usuário
    const [users] = await queryInterface.sequelize.query(
      "SELECT id FROM Users ORDER BY id LIMIT 1"
    );

    if (users.length === 0) {
      throw new Error(
        "No users found. Please create at least one user before running this migration."
      );
    }

    const defaultUserId = (users[0] as any).id;

    // Criar quadro Kanban padrão
    const [kanbanBoardResults] = await queryInterface.sequelize.query(`
      INSERT INTO KanbanBoards (name, description, isActive, position, userId, createdAt, updatedAt)
      VALUES ('Quadro Principal', 'Quadro Kanban principal para gerenciamento de tickets', true, 0, ${defaultUserId}, NOW(), NOW())
    `);

    // Obter o ID do quadro criado
    const [boardId] = await queryInterface.sequelize.query(
      "SELECT id FROM KanbanBoards WHERE name = 'Quadro Principal' ORDER BY id DESC LIMIT 1"
    );

    if ((boardId as any[]).length === 0) {
      throw new Error("Failed to create default Kanban board");
    }

    const kanbanBoardId = (boardId[0] as any).id;

    // Criar colunas padrão
    const defaultColumns = [
      { name: "A Fazer", color: "#f44336", position: 0 },
      { name: "Em Andamento", color: "#ff9800", position: 1 },
      { name: "Aguardando", color: "#2196f3", position: 2 },
      { name: "Concluído", color: "#4caf50", position: 3 }
    ];

    for (const column of defaultColumns) {
      await queryInterface.sequelize.query(`
        INSERT INTO KanbanColumns (name, color, position, ticketLimit, isActive, kanbanBoardId, createdAt, updatedAt)
        VALUES ('${column.name}', '${column.color}', ${column.position}, 0, true, ${kanbanBoardId}, NOW(), NOW())
      `);
    }

    return Promise.resolve();
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(
      "DELETE FROM KanbanColumns WHERE kanbanBoardId IN (SELECT id FROM KanbanBoards WHERE name = 'Quadro Principal')"
    );
    await queryInterface.sequelize.query(
      "DELETE FROM KanbanBoards WHERE name = 'Quadro Principal'"
    );
    return Promise.resolve();
  }
};
