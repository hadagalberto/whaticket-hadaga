import * as Yup from "yup";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Appointment, { AppointmentStatus } from "../../models/Appointment";
import ServiceType from "../../models/ServiceType";

interface UpdateAppointmentData {
  customerName?: string;
  customerContact?: string;
  location?: string;
  notes?: string;
  serviceTypeId?: number;
  assignedUserId?: number | null;
  scheduledAt?: string | Date;
  duration?: number;
  status?: AppointmentStatus;
}

const allowedStatuses: AppointmentStatus[] = [
  "scheduled",
  "confirmed",
  "completed",
  "canceled"
];

const UpdateAppointmentService = async (
  id: string,
  data: UpdateAppointmentData
): Promise<Appointment> => {
  const appointment = await Appointment.findByPk(id, {
    include: [ServiceType]
  });

  if (!appointment) {
    throw new AppError("ERR_APPOINTMENT_NOT_FOUND", 404);
  }

  const schema = Yup.object().shape({
    customerName: Yup.string().trim().notRequired(),
    scheduledAt: Yup.date().notRequired(),
    duration: Yup.number()
      .min(5)
      .max(24 * 60)
      .notRequired()
  });

  try {
    await schema.validate({
      customerName: data.customerName,
      scheduledAt: data.scheduledAt,
      duration: data.duration
    });
  } catch (error) {
    throw new AppError(error.message);
  }

  const updates: Record<string, unknown> = {};

  if (data.customerName !== undefined) {
    updates.customerName = data.customerName.trim();
  }

  if (data.customerContact !== undefined) {
    updates.customerContact = data.customerContact;
  }

  if (data.location !== undefined) {
    updates.location = data.location;
  }

  if (data.notes !== undefined) {
    updates.notes = data.notes;
  }

  if (data.assignedUserId !== undefined) {
    updates.assignedUserId = data.assignedUserId;
  }

  let serviceType: ServiceType | null = appointment.serviceType || null;

  if (data.serviceTypeId !== undefined) {
    const newServiceType = await ServiceType.findByPk(data.serviceTypeId);
    if (!newServiceType) {
      throw new AppError("ERR_SERVICE_TYPE_NOT_FOUND", 404);
    }
    serviceType = newServiceType;
    updates.serviceTypeId = newServiceType.id;
  } else if (!serviceType) {
    const loadedServiceType = (await appointment.$get(
      "serviceType"
    )) as ServiceType | null;
    if (loadedServiceType) {
      serviceType = loadedServiceType;
    }
  }

  let start = appointment.scheduledAt;

  if (data.scheduledAt !== undefined) {
    const newStart = new Date(data.scheduledAt);
    if (Number.isNaN(newStart.getTime())) {
      throw new AppError("ERR_APPOINTMENT_DATE");
    }
    start = newStart;
    updates.scheduledAt = start;
  }

  let duration = appointment.duration;

  if (data.duration !== undefined) {
    const normalized = Math.max(5, Math.floor(data.duration));
    if (!Number.isFinite(normalized) || normalized <= 0) {
      throw new AppError("ERR_APPOINTMENT_DURATION");
    }
    duration = normalized;
  } else if (data.serviceTypeId !== undefined && serviceType?.duration) {
    duration = serviceType.duration;
  }

  const end = new Date(start.getTime() + duration * 60000);
  updates.endAt = end;
  updates.duration = duration;

  const status: AppointmentStatus = data.status ?? appointment.status;

  if (!allowedStatuses.includes(status)) {
    throw new AppError("ERR_APPOINTMENT_STATUS");
  }

  updates.status = status;

  if (status !== "canceled") {
    const conflict = await Appointment.findOne({
      where: {
        id: { [Op.ne]: appointment.id },
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

  await appointment.update(updates);
  await appointment.reload({ include: [ServiceType] });

  return appointment;
};

export default UpdateAppointmentService;
