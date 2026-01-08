const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const LicenseSchema = new mongoose.Schema(
    {
        licenseKey: { type: String, required: true, unique: true },
        activatedAt: { type: Date, default: Date.now },
        expiresAt: { type: Date, required: true },
        status: {
            type: String,
            enum: ["active", "expired", "suspended"],
            default: "active",
        },
        jamiaName: { type: String, required: false },
        allowedModules: { type: [String], default: ["all"] },
        maxStudents: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const License = mongoose.models.License || mongoose.model("License", LicenseSchema);

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const licenses = [
            {
                licenseKey: "JAMIA-2026-BASE-0001",
                expiresAt: new Date("2027-12-31"),
                allowedModules: ["طلباء", "اساتذہ"],
                status: "active"
            },
            {
                licenseKey: "JAMIA-2026-PRO-0002",
                expiresAt: new Date("2028-12-31"),
                allowedModules: ["all"],
                status: "active"
            },
            {
                licenseKey: "JAMIA-2026-FEE-0003",
                expiresAt: new Date("2026-06-30"),
                allowedModules: ["طلباء", "فنانس"],
                status: "active"
            },
            {
                licenseKey: "JAMIA-2026-FULL-0004",
                expiresAt: new Date("2030-01-01"),
                allowedModules: ["all"],
                status: "active"
            }
        ];

        for (const l of licenses) {
            await License.findOneAndUpdate(
                { licenseKey: l.licenseKey },
                l,
                { upsert: true, new: true }
            );
            console.log(`Seeded/Updated: ${l.licenseKey}`);
        }

        console.log("Seeding completed successfully");
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
}

seed();
