import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Configurações do Kanban
    const kanbanSettings = [
      {
        key: "kanbanAutoAdd",
        value: "disabled",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: "kanbanDefaultBoard",
        value: "",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        key: "kanbanDefaultColumn",
        value: "",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return queryInterface.bulkInsert("Settings", kanbanSettings, {});
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Settings", {
      key: ["kanbanAutoAdd", "kanbanDefaultBoard", "kanbanDefaultColumn"]
    });
  }
};
