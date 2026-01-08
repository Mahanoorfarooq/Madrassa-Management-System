const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

async function main() {
    try {
        console.log("Connecting to MongoDB at", MONGODB_URI);
        await mongoose.connect(MONGODB_URI);

        const superAdmin = {
            username: "superadmin",
            plainPassword: "123",
            fullName: "سپر ایڈمن (Itqanify)",
            role: "super_admin",
        };

        let user = await User.findOne({ username: superAdmin.username });
        const passwordHash = bcrypt.hashSync(superAdmin.plainPassword, 10);

        if (user) {
            user.passwordHash = passwordHash;
            await user.save();
            console.log(`Super Admin password updated for: ${superAdmin.username}`);
        } else {
            user = await User.create({
                fullName: superAdmin.fullName,
                username: superAdmin.username,
                passwordHash,
                role: superAdmin.role,
            });
            console.log("Super Admin created successfully:");
        }
        console.log("  Username:", superAdmin.username);
        console.log("  Password:", superAdmin.plainPassword);
    } catch (err) {
        console.error("Error seeding super admin:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

main();
