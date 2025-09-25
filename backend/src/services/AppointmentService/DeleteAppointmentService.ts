import AppError from "../../errors/AppError";
import Appointment from "../../models/Appointment";

const DeleteAppointmentService = async (id: string): Promise<void> => {
  const appointment = await Appointment.findByPk(id);

  if (!appointment) {
    throw new AppError("ERR_APPOINTMENT_NOT_FOUND", 404);
  }

  await appointment.destroy();
};

export default DeleteAppointmentService;
