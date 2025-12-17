import { Schema, Document, models, model, Types } from "mongoose";

export interface IActivityLog extends Document {
  actorUserId: Types.ObjectId;
  action: string;
  entityType: string;
  entityId?: Types.ObjectId;
  before?: any;
  after?: any;
  meta?: any;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, index: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ActivityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export const ActivityLog =
  models.ActivityLog || model<IActivityLog>("ActivityLog", ActivityLogSchema);
