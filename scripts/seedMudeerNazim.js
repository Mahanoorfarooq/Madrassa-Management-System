const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/madrassa_management";

const userSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        username: { type: String, required: true, unique: true, index: true },
        passwordHash: { type: String, required: true },
        role: {
            type: String,
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
                username: "mudeer",
                plainPassword: "123",
                fullName: "محترم مدیر صاحب",
                role: "mudeer",
            },
            {
                username: "nazim",
                plainPassword: "123",
                fullName: "ناظمِ طلبہ",
                role: "nazim",
            },
        ];

        for (const cfg of usersToSeed) {
            let user = await User.findOne({ username: cfg.username });
            if (user) {
                console.log(`User already exists: ${cfg.username}`);
                // Update password anyway to ensure it's '123'
                const passwordHash = bcrypt.hashSync(cfg.plainPassword, 10);
                await User.updateOne({ username: cfg.username }, { passwordHash, role: cfg.role, fullName: cfg.fullName });
                console.log(`User ${cfg.username} updated.`);
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
        console.error("Error seeding users:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

main();
