import { QueryInterface } from "sequelize";
import bcrypt from "bcryptjs";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Gerar hash da senha
    const passwordHash = await bcrypt.hash("123456", 8);

    return queryInterface.bulkInsert(
      "Users",
      [
        {
          name: "Hadagalberto Junior",
          email: "hadagalberto.junior1@gmail.com",
          passwordHash: passwordHash,
          profile: "user",
          tokenVersion: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Users", {
      email: "hadagalberto.junior1@gmail.com"
    });
  }
};
