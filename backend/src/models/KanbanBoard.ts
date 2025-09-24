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

import User from "./User";
import KanbanColumn from "./KanbanColumn";

@Table
class KanbanBoard extends Model<KanbanBoard> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  description: string;

  @Default(true)
  @Column
  isActive: boolean;

  @Default(0)
  @Column
  position: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @HasMany(() => KanbanColumn)
  columns: KanbanColumn[];
}

export default KanbanBoard;
