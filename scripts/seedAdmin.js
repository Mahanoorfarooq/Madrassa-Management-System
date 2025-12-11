// Seed script to create an initial admin user for the Madrassa Management system.
// Run with: node scripts/seedAdmin.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/madrassa_management";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "teacher", "staff", "student"],
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function main() {
  try {
    console.log("Connecting to MongoDB at", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);

    const usersToSeed = [
      {
        username: "admin",
        plainPassword: "123",
        fullName: "ایڈمن صارف",
        role: "admin",
      },
    ];

    for (const cfg of usersToSeed) {
      let user = await User.findOne({ username: cfg.username });
      if (user) {
        console.log(`User already exists: ${cfg.username}`);
        console.log(
          "  Password:",
          cfg.plainPassword,
          "(unchanged, check DB if different)"
        );
      } else {
        const passwordHash = bcrypt.hashSync(cfg.plainPassword, 10);
        user = await User.create({
          fullName: cfg.fullName,
          username: cfg.username,
          passwordHash,
          role: cfg.role,
        });
        console.log("User created successfully:");
        console.log("  Username:", cfg.username);
        console.log("  Password:", cfg.plainPassword);
      }
    }
  } catch (err) {
    console.error("Error seeding admin user:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
