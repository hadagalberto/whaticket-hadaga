import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  HasMany,
  Default
} from "sequelize-typescript";

import Ticket from "./Ticket";

@Table
class KanbanColumn extends Model<KanbanColumn> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  color: string;

  @Default(0)
  @Column
  position: number;

  @Default(0)
  @Column
  ticketLimit: number;

  @Default(true)
  @Column
  isActive: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => require("./KanbanBoard").default)
  @Column
  kanbanBoardId: number;

  @BelongsTo(() => require("./KanbanBoard").default)
  kanbanBoard: any;

  @HasMany(() => Ticket)
  tickets: Ticket[];
}

export default KanbanColumn;
