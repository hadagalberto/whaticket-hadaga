import { Router } from "express";
import isAuth from "../middleware/isAuth";
import isAdmin from "../middleware/isAdmin";

import * as AiAgentController from "../controllers/AiAgentController";

const aiAgentRoutes = Router();

aiAgentRoutes.get("/ai-agents", isAuth, isAdmin, AiAgentController.index);

aiAgentRoutes.post("/ai-agents", isAuth, isAdmin, AiAgentController.store);

aiAgentRoutes.post(
  "/ai-agents/validate-key",
  isAuth,
  isAdmin,
  AiAgentController.validateApiKey
);

aiAgentRoutes.get(
  "/ai-agents/:aiAgentId",
  isAuth,
  isAdmin,
  AiAgentController.show
);

aiAgentRoutes.put(
  "/ai-agents/:aiAgentId",
  isAuth,
  isAdmin,
  AiAgentController.update
);

aiAgentRoutes.delete(
  "/ai-agents/:aiAgentId",
  isAuth,
  isAdmin,
  AiAgentController.remove
);

export default aiAgentRoutes;
