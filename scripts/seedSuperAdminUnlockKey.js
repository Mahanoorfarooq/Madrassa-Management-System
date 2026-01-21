const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/madrassa_management";

const { Schema } = mongoose;

const superAdminLicenseSchema = new Schema(
  {
    licenseKey: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: ["SUPER_ADMIN"], default: "SUPER_ADMIN" },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

const SuperAdminLicense =
  mongoose.models.SuperAdminLicense ||
  mongoose.model("SuperAdminLicense", superAdminLicenseSchema);

async function main() {
  const key = (process.env.SUPER_ADMIN_UNLOCK_KEY || "SA-2026-MASTER-SECURE")
    .trim()
    .toUpperCase();

  try {
    console.log("Connecting to MongoDB at", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    // Deactivate any other SUPER_ADMIN licenses
    await SuperAdminLicense.updateMany(
      {
        type: "SUPER_ADMIN",
        licenseKey: { $ne: key },
      },
      { $set: { isActive: false } },
    );

    // Upsert the desired key as active
    await SuperAdminLicense.findOneAndUpdate(
      { licenseKey: key, type: "SUPER_ADMIN" },
      { $set: { isActive: true, type: "SUPER_ADMIN", licenseKey: key } },
      { upsert: true, new: true },
    );

    console.log("Seeded Super Admin unlock key:");
    console.log("  Key:", key);
  } catch (err) {
    console.error("Error seeding super admin unlock key:", err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
