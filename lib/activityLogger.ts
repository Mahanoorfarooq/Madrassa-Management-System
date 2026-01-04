import { connectDB } from "@/lib/db";
import { ActivityLog } from "@/schemas/ActivityLog";

export type ActivityPayload = {
  actorUserId: string;
  action: string;
  entityType: string;
  entityId?: any;
  before?: any;
  after?: any;
  meta?: any;
};

export async function logActivity(payload: ActivityPayload) {
  try {
    await connectDB();
    await ActivityLog.create({
      actorUserId: payload.actorUserId,
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId,
      before: payload.before,
      after: payload.after,
      meta: payload.meta,
    });
  } catch (e) {}
}
