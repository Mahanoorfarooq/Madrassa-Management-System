const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/madrassa_management";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "teacher", "staff", "student", "super_admin"],
      required: true,
    },
    status: { type: String, default: "active" },
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function main() {
  try {
    console.log("Connecting to MongoDB at", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const username = process.env.SUPER_ADMIN_USERNAME || "superadmin";
    const explicitPassword = process.env.SUPER_ADMIN_PASSWORD;
    const generatedPassword = crypto.randomBytes(9).toString("base64url");

    const superAdmin = {
      username,
      fullName: "سپر ایڈمن (Itqanify)",
      role: "super_admin",
      status: "active",
    };

    let user = await User.findOne({ username: superAdmin.username });

    if (user) {
      user.status = superAdmin.status;

      // Do NOT change password unless explicitly requested.
      if (explicitPassword && explicitPassword.trim()) {
        user.passwordHash = bcrypt.hashSync(explicitPassword.trim(), 10);
        console.log(`Super Admin password updated for: ${superAdmin.username}`);
        console.log("  Username:", superAdmin.username);
        console.log("  Password:", explicitPassword.trim());
      } else {
        console.log(`Super Admin already exists: ${superAdmin.username}`);
        console.log(
          "  Password: (unchanged). To reset, set SUPER_ADMIN_PASSWORD env var and run again.",
        );
      }

      await user.save();
    } else {
      const passwordToUse =
        explicitPassword && explicitPassword.trim()
          ? explicitPassword.trim()
          : generatedPassword;

      const passwordHash = bcrypt.hashSync(passwordToUse, 10);
      user = await User.create({
        fullName: superAdmin.fullName,
        username: superAdmin.username,
        passwordHash,
        role: superAdmin.role,
        status: superAdmin.status,
      });
      console.log("Super Admin created successfully:");
      console.log("  Username:", superAdmin.username);
      console.log("  Password:", passwordToUse);
    }
  } catch (err) {
    console.error("Error seeding super admin:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
