import { Request, Response } from "express";
import { Op, literal } from "sequelize";
import KanbanBoard from "../models/KanbanBoard";
import KanbanColumn from "../models/KanbanColumn";
import Ticket from "../models/Ticket";
import Contact from "../models/Contact";
import User from "../models/User";
import Queue from "../models/Queue";

// Listar todos os quadros Kanban
export const index = async (req: Request, res: Response): Promise<Response> => {
  try {
    const kanbanBoards = await KanbanBoard.findAll({
      include: [
        {
          model: KanbanColumn,
          as: "columns",
          include: [
            {
              model: Ticket,
              as: "tickets",
              include: [{ model: Contact }, { model: User }, { model: Queue }],
              order: [["kanbanPosition", "ASC"]]
            }
          ],
          order: [["position", "ASC"]]
        }
      ],
      order: [["position", "ASC"]]
    });

    return res.json(kanbanBoards);
  } catch (error) {
    console.error("Error fetching kanban boards:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Criar novo quadro Kanban
export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, description } = req.body;
    const { id: userId } = req.user;

    const kanbanBoard = await KanbanBoard.create({
      name,
      description,
      userId
    });

    // Criar colunas padrão
    const defaultColumns = [
      { name: "A Fazer", color: "#f44336", position: 0 },
      { name: "Em Andamento", color: "#ff9800", position: 1 },
      { name: "Concluído", color: "#4caf50", position: 2 }
    ];

    for (const column of defaultColumns) {
      await KanbanColumn.create({
        ...column,
        kanbanBoardId: kanbanBoard.id
      });
    }

    const boardWithColumns = await KanbanBoard.findByPk(kanbanBoard.id, {
      include: [{ model: KanbanColumn, as: "columns" }]
    });

    return res.status(201).json(boardWithColumns);
  } catch (error) {
    console.error("Error creating kanban board:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Atualizar quadro Kanban
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { kanbanBoardId } = req.params;
    const { name, description } = req.body;

    const kanbanBoard = await KanbanBoard.findByPk(kanbanBoardId);

    if (!kanbanBoard) {
      return res.status(404).json({ error: "Kanban board not found" });
    }

    await kanbanBoard.update({ name, description });

    return res.json(kanbanBoard);
  } catch (error) {
    console.error("Error updating kanban board:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Deletar quadro Kanban
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { kanbanBoardId } = req.params;

    const kanbanBoard = await KanbanBoard.findByPk(kanbanBoardId);

    if (!kanbanBoard) {
      return res.status(404).json({ error: "Kanban board not found" });
    }

    await kanbanBoard.destroy();

    return res.json({ message: "Kanban board deleted successfully" });
  } catch (error) {
    console.error("Error deleting kanban board:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Mover ticket entre colunas
export const moveTicket = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { ticketId, kanbanColumnId, position } = req.body;

    const ticket = await Ticket.findByPk(ticketId);

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Atualizar posições dos outros tickets na coluna de destino
    await Ticket.update(
      { kanbanPosition: literal("kanbanPosition + 1") },
      {
        where: {
          kanbanColumnId,
          kanbanPosition: { [Op.gte]: position }
        }
      }
    );

    // Mover o ticket
    await ticket.update({
      kanbanColumnId,
      kanbanPosition: position
    });

    // Reorganizar posições na coluna de origem (se diferente da destino)
    if (ticket.kanbanColumnId !== kanbanColumnId) {
      await Ticket.update(
        { kanbanPosition: literal("kanbanPosition - 1") },
        {
          where: {
            kanbanColumnId: ticket.kanbanColumnId,
            kanbanPosition: {
              [Op.gt]: ticket.kanbanPosition
            }
          }
        }
      );
    }

    return res.json({ message: "Ticket moved successfully" });
  } catch (error) {
    console.error("Error moving ticket:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
