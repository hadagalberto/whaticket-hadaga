import * as Yup from "yup";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Appointment, { AppointmentStatus } from "../../models/Appointment";
import ServiceType from "../../models/ServiceType";

interface CreateAppointmentData {
  customerName: string;
  customerContact?: string;
  location?: string;
  notes?: string;
  serviceTypeId: number;
  assignedUserId?: number;
  scheduledAt: string | Date;
  duration?: number;
  status?: AppointmentStatus;
}

const allowedStatuses: AppointmentStatus[] = [
  "scheduled",
  "confirmed",
  "completed",
  "canceled"
];

const CreateAppointmentService = async (
  data: CreateAppointmentData
): Promise<Appointment> => {
  const schema = Yup.object().shape({
    customerName: Yup.string().trim().required("ERR_APPOINTMENT_CUSTOMER"),
    serviceTypeId: Yup.number()
      .integer()
      .required("ERR_APPOINTMENT_SERVICE_TYPE"),
    scheduledAt: Yup.date().required("ERR_APPOINTMENT_DATE"),
    duration: Yup.number()
      .min(5)
      .max(24 * 60)
      .notRequired()
  });

  try {
    await schema.validate({
      customerName: data.customerName,
      serviceTypeId: data.serviceTypeId,
      scheduledAt: data.scheduledAt,
      duration: data.duration
    });
  } catch (error) {
    throw new AppError(error.message);
  }

  const serviceType = await ServiceType.findByPk(data.serviceTypeId);

  if (!serviceType) {
    throw new AppError("ERR_SERVICE_TYPE_NOT_FOUND", 404);
  }

  const start = new Date(data.scheduledAt);

  if (Number.isNaN(start.getTime())) {
    throw new AppError("ERR_APPOINTMENT_DATE");
  }

  const rawDuration = data.duration ?? serviceType.duration ?? 30;
  const duration = Math.max(5, Math.floor(rawDuration));

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new AppError("ERR_APPOINTMENT_DURATION");
  }

  const end = new Date(start.getTime() + duration * 60000);

  const status: AppointmentStatus = data.status ?? "scheduled";

  if (!allowedStatuses.includes(status)) {
    throw new AppError("ERR_APPOINTMENT_STATUS");
  }

  if (status !== "canceled") {
    const conflict = await Appointment.findOne({
      where: {
        status: {
          [Op.in]: ["scheduled", "confirmed"]
        },
        [Op.and]: [
          { scheduledAt: { [Op.lt]: end } },
          { endAt: { [Op.gt]: start } }
        ]
      }
    });

    if (conflict) {
      throw new AppError("ERR_APPOINTMENT_CONFLICT", 409);
    }
  }

  const appointment = await Appointment.create({
    customerName: data.customerName.trim(),
    customerContact: data.customerContact,
    location: data.location,
    notes: data.notes,
    serviceTypeId: serviceType.id,
    assignedUserId: data.assignedUserId,
    scheduledAt: start,
    endAt: end,
    duration,
    status
  });

  await appointment.reload({ include: [ServiceType] });

  return appointment;
};

export default CreateAppointmentService;
