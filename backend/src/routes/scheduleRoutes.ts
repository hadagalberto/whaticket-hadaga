import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as ServiceTypeController from "../controllers/ServiceTypeController";
import * as AppointmentController from "../controllers/AppointmentController";

const scheduleRoutes = Router();

scheduleRoutes.get("/service-types", isAuth, ServiceTypeController.index);
scheduleRoutes.post("/service-types", isAuth, ServiceTypeController.store);
scheduleRoutes.put(
  "/service-types/:serviceTypeId",
  isAuth,
  ServiceTypeController.update
);
scheduleRoutes.delete(
  "/service-types/:serviceTypeId",
  isAuth,
  ServiceTypeController.remove
);

scheduleRoutes.get("/appointments", isAuth, AppointmentController.index);
scheduleRoutes.post("/appointments", isAuth, AppointmentController.store);
scheduleRoutes.put(
  "/appointments/:appointmentId",
  isAuth,
  AppointmentController.update
);
scheduleRoutes.delete(
  "/appointments/:appointmentId",
  isAuth,
  AppointmentController.remove
);

export default scheduleRoutes;
