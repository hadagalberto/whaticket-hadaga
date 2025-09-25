import { Request, Response } from "express";
import ListAppointmentsService from "../services/AppointmentService/ListAppointmentsService";
import CreateAppointmentService from "../services/AppointmentService/CreateAppointmentService";
import UpdateAppointmentService from "../services/AppointmentService/UpdateAppointmentService";
import DeleteAppointmentService from "../services/AppointmentService/DeleteAppointmentService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { start, end, status, serviceTypeId } = req.query;

  const appointments = await ListAppointmentsService({
    start: start as string | undefined,
    end: end as string | undefined,
    status: status as string | undefined,
    serviceTypeId: serviceTypeId as string | undefined
  });

  return res.status(200).json(appointments);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const appointment = await CreateAppointmentService(req.body);
  return res.status(201).json(appointment);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { appointmentId } = req.params;
  const appointment = await UpdateAppointmentService(appointmentId, req.body);
  return res.status(200).json(appointment);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { appointmentId } = req.params;
  await DeleteAppointmentService(appointmentId);
  return res.status(204).send();
};
