import ServiceType from "../../models/ServiceType";

const ListServiceTypesService = async (): Promise<ServiceType[]> => {
  const serviceTypes = await ServiceType.findAll({
    order: [["name", "ASC"]]
  });

  return serviceTypes;
};

export default ListServiceTypesService;
