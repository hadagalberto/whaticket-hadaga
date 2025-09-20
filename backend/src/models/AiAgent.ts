import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo,
  DataType,
  Default
} from "sequelize-typescript";
import Queue from "./Queue";

@Table
class AiAgent extends Model<AiAgent> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @AllowNull(false)
  @Column
  name: string;

  @AllowNull(false)
  @Column(DataType.ENUM("openai", "gemini"))
  provider: "openai" | "gemini";

  @AllowNull(false)
  @Column(DataType.TEXT)
  apiKey: string;

  @AllowNull(false)
  @Column
  model: string;

  @Column(DataType.TEXT)
  systemPrompt: string;

  @Default(1.0)
  @Column(DataType.FLOAT)
  temperature: number;

  @Default(1000)
  @Column
  maxTokens: number;

  @Default(5)
  @Column
  maxMessages: number;

  @Default(true)
  @Column
  isActive: boolean;

  @ForeignKey(() => Queue)
  @AllowNull(false)
  @Column
  queueId: number;

  @ForeignKey(() => Queue)
  @AllowNull(false)
  @Column
  transferQueueId: number;

  @BelongsTo(() => Queue)
  queue: Queue;

  @BelongsTo(() => Queue, "transferQueueId")
  transferQueue: Queue;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default AiAgent;
