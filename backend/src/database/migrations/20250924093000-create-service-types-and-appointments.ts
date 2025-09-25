import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("ServiceTypes", {
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30
      },
      color: {
        type: DataTypes.STRING,
        allowNull: true
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

    await queryInterface.createTable("Appointments", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      customerName: {
        type: DataTypes.STRING,
        allowNull: false
      },
      customerContact: {
        type: DataTypes.STRING,
        allowNull: true
      },
      location: {
        type: DataTypes.STRING,
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      serviceTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "ServiceTypes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT"
      },
      assignedUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      scheduledAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      endAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 30
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "scheduled"
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

    await queryInterface.addIndex("Appointments", ["scheduledAt"]);
    await queryInterface.addIndex("Appointments", ["endAt"]);
    await queryInterface.addIndex("Appointments", ["status"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("Appointments", ["status"]);
    await queryInterface.removeIndex("Appointments", ["endAt"]);
    await queryInterface.removeIndex("Appointments", ["scheduledAt"]);
    await queryInterface.dropTable("Appointments");
    await queryInterface.dropTable("ServiceTypes");
  }
};
