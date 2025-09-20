import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query(`
      UPDATE Users 
      SET profile = 'admin' 
      WHERE email = 'hadagalberto.junior1@gmail.com'
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query(`
      UPDATE Users 
      SET profile = 'user' 
      WHERE email = 'hadagalberto.junior1@gmail.com'
    `);
  }
};
