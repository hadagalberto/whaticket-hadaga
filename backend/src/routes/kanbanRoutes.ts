import express from "express";
import isAuth from "../middleware/isAuth";

import * as KanbanController from "../controllers/KanbanController";
import * as KanbanColumnController from "../controllers/KanbanColumnController";

const kanbanRoutes = express.Router();

// Rotas para Kanban Boards
kanbanRoutes.get("/kanban", isAuth, KanbanController.index);
kanbanRoutes.post("/kanban", isAuth, KanbanController.store);
kanbanRoutes.put("/kanban/:kanbanBoardId", isAuth, KanbanController.update);
kanbanRoutes.delete("/kanban/:kanbanBoardId", isAuth, KanbanController.remove);
kanbanRoutes.post("/kanban/move-ticket", isAuth, KanbanController.moveTicket);

// Rotas para Kanban Columns
kanbanRoutes.post("/kanban-columns", isAuth, KanbanColumnController.store);
kanbanRoutes.put(
  "/kanban-columns/:kanbanColumnId",
  isAuth,
  KanbanColumnController.update
);
kanbanRoutes.delete(
  "/kanban-columns/:kanbanColumnId",
  isAuth,
  KanbanColumnController.remove
);

export default kanbanRoutes;
