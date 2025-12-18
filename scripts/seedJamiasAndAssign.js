// Migration script: seed Jamias and attach jamiaId to existing users/students/teachers.
// Run with: node scripts/seedJamiasAndAssign.js
// NOTE: By default DRY_RUN = true so it will only log planned changes.
//       Set DRY_RUN = false once you have reviewed the output.

const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/madrassa_management";

const DRY_RUN = false;

const { Schema } = mongoose;

const jamiaSchema = new Schema(
  {
    name: { type: String, required: true },
    logo: { type: String },
    address: { type: String },
    modules: {
      admissions: { type: Boolean, default: true },
      attendance: { type: Boolean, default: true },
      exams: { type: Boolean, default: true },
      fees: { type: Boolean, default: true },
      hostel: { type: Boolean, default: false },
      library: { type: Boolean, default: false },
      donations: { type: Boolean, default: false },
    },
    settings: {
      feeCurrency: { type: String },
      academicYear: { type: String },
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Minimal User schema including jamiaId
const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "teacher", "staff", "student", "super_admin"],
      required: true,
    },
    jamiaId: {
      type: Schema.Types.ObjectId,
      ref: "Jamia",
      index: true,
      default: null,
    },
  },
  { timestamps: true }
);

// Minimal Student schema including jamiaId
const studentSchema = new Schema(
  {
    fullName: { type: String, required: true },
    rollNumber: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    jamiaId: {
      type: Schema.Types.ObjectId,
      ref: "Jamia",
      index: true,
      default: null,
    },
  },
  { timestamps: true }
);

// Minimal Teacher schema including jamiaId
const teacherSchema = new Schema(
  {
    fullName: { type: String, required: true },
    jamiaId: {
      type: Schema.Types.ObjectId,
      ref: "Jamia",
      index: true,
      default: null,
    },
  },
  { timestamps: true }
);

const Jamia = mongoose.models.Jamia || mongoose.model("Jamia", jamiaSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);
const Teacher =
  mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);

// Configure Jamias to seed. You can edit this list before running.
const JAMIAS_TO_CREATE = [
  {
    name: "Central Jamia",
    address: "Head Office",
    modules: {
      admissions: true,
      attendance: true,
      exams: true,
      fees: true,
      hostel: false,
      library: false,
      donations: false,
    },
    settings: {
      feeCurrency: "PKR",
      academicYear: "2024-25",
    },
    makeDefaultForAllExisting: true,
  },
];

async function main() {
  try {
    console.log("Connecting to MongoDB at", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const jamiaByName = {};

    // 1) Seed Jamias
    for (const cfg of JAMIAS_TO_CREATE) {
      let jamia = await Jamia.findOne({ name: cfg.name });
      if (jamia) {
        console.log(`Jamia already exists: ${cfg.name} (id=${jamia._id})`);
      } else {
        console.log(`Jamia not found, will create: ${cfg.name}`);
        if (!DRY_RUN) {
          jamia = await Jamia.create({
            name: cfg.name,
            address: cfg.address,
            modules: cfg.modules,
            settings: cfg.settings,
            isActive: true,
            isDeleted: false,
          });
          console.log("  Created Jamia with id=", jamia._id);
        } else {
          console.log("  [DRY_RUN] Skipping actual create");
          // Fake _id for logging only
          jamia = { _id: "(pending)" };
        }
      }
      jamiaByName[cfg.name] = jamia;
    }

    const defaultCfg = JAMIAS_TO_CREATE.find(
      (j) => j.makeDefaultForAllExisting
    );
    const defaultJamia = defaultCfg ? jamiaByName[defaultCfg.name] : null;

    if (!defaultJamia) {
      console.log(
        "No default Jamia configured for attaching existing records."
      );
      return;
    }

    console.log("\nUsing default Jamia for existing records:", defaultCfg.name);

    const userFilter = {
      role: { $ne: "super_admin" },
      $or: [{ jamiaId: { $exists: false } }, { jamiaId: null }],
    };
    const studentFilter = {
      $or: [{ jamiaId: { $exists: false } }, { jamiaId: null }],
    };
    const teacherFilter = {
      $or: [{ jamiaId: { $exists: false } }, { jamiaId: null }],
    };

    const [userCount, studentCount, teacherCount] = await Promise.all([
      User.countDocuments(userFilter),
      Student.countDocuments(studentFilter),
      Teacher.countDocuments(teacherFilter),
    ]);

    console.log("\nPlanned updates:");
    console.log("  Users without jamiaId (excluding super_admin):", userCount);
    console.log("  Students without jamiaId:", studentCount);
    console.log("  Teachers without jamiaId:", teacherCount);

    if (DRY_RUN) {
      console.log(
        "\nDRY_RUN is TRUE - no updates were written. Review the counts above, then set DRY_RUN = false to apply changes."
      );
      return;
    }

    if (userCount > 0) {
      const res = await User.updateMany(userFilter, {
        $set: { jamiaId: defaultJamia._id },
      });
      console.log("Updated users:", res.modifiedCount || res.nModified || 0);
    }

    if (studentCount > 0) {
      const res = await Student.updateMany(studentFilter, {
        $set: { jamiaId: defaultJamia._id },
      });
      console.log("Updated students:", res.modifiedCount || res.nModified || 0);
    }

    if (teacherCount > 0) {
      const res = await Teacher.updateMany(teacherFilter, {
        $set: { jamiaId: defaultJamia._id },
      });
      console.log("Updated teachers:", res.modifiedCount || res.nModified || 0);
    }

    console.log("\nMigration completed.");
  } catch (err) {
    console.error("Error running seedJamiasAndAssign script:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
