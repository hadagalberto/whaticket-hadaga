import { Request, Response } from "express";
import KanbanColumn from "../models/KanbanColumn";

// Criar nova coluna
export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, color, kanbanBoardId, position } = req.body;

    const kanbanColumn = await KanbanColumn.create({
      name,
      color,
      kanbanBoardId,
      position: position || 0
    });

    return res.status(201).json(kanbanColumn);
  } catch (error) {
    console.error("Error creating kanban column:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Atualizar coluna
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { kanbanColumnId } = req.params;
    const { name, color, position, ticketLimit } = req.body;

    const kanbanColumn = await KanbanColumn.findByPk(kanbanColumnId);

    if (!kanbanColumn) {
      return res.status(404).json({ error: "Kanban column not found" });
    }

    await kanbanColumn.update({ name, color, position, ticketLimit });

    return res.json(kanbanColumn);
  } catch (error) {
    console.error("Error updating kanban column:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Deletar coluna
export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { kanbanColumnId } = req.params;

    const kanbanColumn = await KanbanColumn.findByPk(kanbanColumnId);

    if (!kanbanColumn) {
      return res.status(404).json({ error: "Kanban column not found" });
    }

    await kanbanColumn.destroy();

    return res.json({ message: "Kanban column deleted successfully" });
  } catch (error) {
    console.error("Error deleting kanban column:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
