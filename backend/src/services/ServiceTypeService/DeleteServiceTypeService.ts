import AppError from "../../errors/AppError";
import ServiceType from "../../models/ServiceType";

const DeleteServiceTypeService = async (id: string): Promise<void> => {
  const serviceType = await ServiceType.findByPk(id);

  if (!serviceType) {
    throw new AppError("ERR_SERVICE_TYPE_NOT_FOUND", 404);
  }

  try {
    await serviceType.destroy();
  } catch (error) {
    throw new AppError("ERR_SERVICE_TYPE_IN_USE", 409);
  }
};

export default DeleteServiceTypeService;
