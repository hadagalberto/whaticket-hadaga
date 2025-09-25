import * as Yup from "yup";
import AppError from "../../errors/AppError";
import ServiceType from "../../models/ServiceType";

interface UpdateServiceTypeData {
  name?: string;
  description?: string;
  duration?: number;
  color?: string;
}

const UpdateServiceTypeService = async (
  id: string,
  data: UpdateServiceTypeData
): Promise<ServiceType> => {
  const serviceType = await ServiceType.findByPk(id);

  if (!serviceType) {
    throw new AppError("ERR_SERVICE_TYPE_NOT_FOUND", 404);
  }

  const schema = Yup.object().shape({
    name: Yup.string().trim().min(2).notRequired()
  });

  try {
    await schema.validate({ name: data.name });
  } catch (error) {
    throw new AppError(error.message);
  }

  const updates: Record<string, unknown> = {};

  if (data.name !== undefined) {
    updates.name = data.name.trim();
  }

  if (data.description !== undefined) {
    updates.description = data.description;
  }

  if (data.color !== undefined) {
    updates.color = data.color;
  }

  if (data.duration !== undefined) {
    const normalized = Math.max(5, Math.floor(data.duration));
    if (!Number.isFinite(normalized) || normalized <= 0) {
      throw new AppError("ERR_SERVICE_TYPE_DURATION");
    }
    updates.duration = normalized;
  }

  await serviceType.update(updates);

  return serviceType;
};

export default UpdateServiceTypeService;
