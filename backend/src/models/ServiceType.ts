import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  DataType,
  Default,
  HasMany
} from "sequelize-typescript";
import Appointment from "./Appointment";

@Table
class ServiceType extends Model<ServiceType> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @Column(DataType.TEXT)
  description: string | null;

  @Default(30)
  @Column(DataType.INTEGER)
  duration: number;

  @Column(DataType.STRING)
  color: string | null;

  @HasMany(() => Appointment)
  appointments: Appointment[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default ServiceType;
