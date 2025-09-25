import { Request, Response } from "express";
import CreateServiceTypeService from "../services/ServiceTypeService/CreateServiceTypeService";
import ListServiceTypesService from "../services/ServiceTypeService/ListServiceTypesService";
import UpdateServiceTypeService from "../services/ServiceTypeService/UpdateServiceTypeService";
import DeleteServiceTypeService from "../services/ServiceTypeService/DeleteServiceTypeService";

export const index = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const serviceTypes = await ListServiceTypesService();
  return res.status(200).json(serviceTypes);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const serviceType = await CreateServiceTypeService(req.body);
  return res.status(201).json(serviceType);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { serviceTypeId } = req.params;
  const serviceType = await UpdateServiceTypeService(serviceTypeId, req.body);
  return res.status(200).json(serviceType);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { serviceTypeId } = req.params;
  await DeleteServiceTypeService(serviceTypeId);
  return res.status(204).send();
};
