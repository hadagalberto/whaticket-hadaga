import { Op } from "sequelize";
import Appointment from "../../models/Appointment";
import ServiceType from "../../models/ServiceType";

interface ListAppointmentFilters {
  start?: string;
  end?: string;
  status?: string;
  serviceTypeId?: string;
}

const ListAppointmentsService = async (
  filters: ListAppointmentFilters
): Promise<Appointment[]> => {
  const where: any = {};
  const andConditions: any[] = [];

  if (filters.start) {
    const start = new Date(filters.start);
    if (!Number.isNaN(start.getTime())) {
      andConditions.push({ endAt: { [Op.gt]: start } });
    }
  }

  if (filters.end) {
    const end = new Date(filters.end);
    if (!Number.isNaN(end.getTime())) {
      andConditions.push({ scheduledAt: { [Op.lt]: end } });
    }
  }

  if (andConditions.length > 0) {
    where[Op.and] = andConditions;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.serviceTypeId) {
    where.serviceTypeId = Number(filters.serviceTypeId);
  }

  const appointments = await Appointment.findAll({
    where,
    include: [ServiceType],
    order: [["scheduledAt", "ASC"]]
  });

  return appointments;
};

export default ListAppointmentsService;
