import { License } from "@/schemas/License";
import { connectDB } from "./db";

export async function checkLicenseStatus() {
    await connectDB();

    // For now, we look for any active license. 
    // In a multi-tenant setup, this would be per-jamia.
    // But the request implies a "hardware/installation" lock.
    const license = await License.findOne({ status: "active" });

    if (!license) {
        return { valid: false, reason: "NOT_FOUND" };
    }

    const now = new Date();
    if (license.expiresAt < now) {
        license.status = "expired";
        await license.save();
        return { valid: false, reason: "EXPIRED" };
    }

    return { valid: true, license };
}
