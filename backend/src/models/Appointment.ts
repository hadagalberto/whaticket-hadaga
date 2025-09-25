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
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import ServiceType from "./ServiceType";
import User from "./User";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "canceled";

@Table
class Appointment extends Model<Appointment> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  customerName: string;

  @Column(DataType.STRING)
  customerContact: string | null;

  @Column(DataType.STRING)
  location: string | null;

  @Column(DataType.TEXT)
  notes: string | null;

  @ForeignKey(() => ServiceType)
  @AllowNull(false)
  @Column
  serviceTypeId: number;

  @BelongsTo(() => ServiceType)
  serviceType: ServiceType;

  @ForeignKey(() => User)
  @Column
  assignedUserId: number | null;

  @BelongsTo(() => User)
  assignedUser: User;

  @AllowNull(false)
  @Column(DataType.DATE)
  scheduledAt: Date;

  @AllowNull(false)
  @Column(DataType.DATE)
  endAt: Date;

  @AllowNull(false)
  @Default(30)
  @Column(DataType.INTEGER)
  duration: number;

  @AllowNull(false)
  @Default("scheduled")
  @Column
  status: AppointmentStatus;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default Appointment;
