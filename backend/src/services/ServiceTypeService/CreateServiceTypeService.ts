import * as Yup from "yup";
import AppError from "../../errors/AppError";
import ServiceType from "../../models/ServiceType";

interface ServiceTypeData {
  name: string;
  description?: string;
  duration?: number;
  color?: string;
}

const CreateServiceTypeService = async (
  data: ServiceTypeData
): Promise<ServiceType> => {
  const schema = Yup.object().shape({
    name: Yup.string().trim().min(2).required("ERR_SERVICE_TYPE_NAME")
  });

  try {
    await schema.validate({ name: data.name });
  } catch (error) {
    throw new AppError(error.message);
  }

  const rawDuration = data.duration ?? 30;
  const duration = Math.max(5, Math.floor(rawDuration));

  if (!Number.isFinite(duration) || duration <= 0) {
    throw new AppError("ERR_SERVICE_TYPE_DURATION");
  }

  const serviceType = await ServiceType.create({
    name: data.name.trim(),
    description: data.description,
    duration,
    color: data.color
  });

  return serviceType;
};

export default CreateServiceTypeService;
