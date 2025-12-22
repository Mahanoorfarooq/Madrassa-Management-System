import { Schema, Document, model, models } from "mongoose";

export interface ISystemSetting extends Document {
  _id: string; // fixed id 'system'
  notifications?: { sms?: any; whatsapp?: any; email?: any };
  payments?: any;
  templates?: { idCard?: any; feeReceipt?: any; certificate?: any };
  backup?: { info?: string };
}

const SystemSettingSchema = new Schema<ISystemSetting>(
  {
    _id: { type: String, default: "system" },
    notifications: { type: Schema.Types.Mixed },
    payments: { type: Schema.Types.Mixed },
    templates: { type: Schema.Types.Mixed },
    backup: { type: Schema.Types.Mixed },
  },
  { timestamps: true, _id: false }
);

export const SystemSetting =
  models.SystemSetting ||
  model<ISystemSetting>("SystemSetting", SystemSettingSchema);
