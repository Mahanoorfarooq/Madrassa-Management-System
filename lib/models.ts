// Central model registry: importing this file registers all Mongoose schemas once per process
// Export models to be used across APIs to avoid MissingSchemaError during populate

export { User } from "@/schemas/User";
export { Student } from "@/schemas/Student";
export { Teacher } from "@/schemas/Teacher";
export { Department } from "@/schemas/Department";
export { ClassModel } from "@/schemas/Class";
export { SectionModel } from "@/schemas/Section";
export { TeachingAssignment } from "@/schemas/TeachingAssignment";
export { Attendance } from "@/schemas/Attendance";
export { TeacherAttendance } from "@/schemas/TeacherAttendance";
export { StaffAttendance } from "@/schemas/StaffAttendance";
export { Admission } from "@/schemas/Admission";
export { Fee } from "@/schemas/Fee";
export { FeeStructure } from "@/schemas/FeeStructure";
export { FinanceTransaction } from "@/schemas/FinanceTransaction";
export { Invoice } from "@/schemas/Invoice";
export { Receipt } from "@/schemas/Receipt";
export { Document as DocumentModel } from "@/schemas/Document";
export { Syllabus } from "@/schemas/Syllabus";
export { Exam } from "@/schemas/Exam";
export { Result } from "@/schemas/Result";
export { Hostel } from "@/schemas/Hostel";
export { HostelRoom } from "@/schemas/HostelRoom";
export { BedAllocation } from "@/schemas/BedAllocation";
export { HostelFee } from "@/schemas/HostelFee";
export { HostelExpense } from "@/schemas/HostelExpense";
export { MessKitchen } from "@/schemas/MessKitchen";
export { MessRegistration } from "@/schemas/MessRegistration";
export { FoodSchedule } from "@/schemas/FoodSchedule";
export { MessRecord } from "@/schemas/MessRecord";
export { LibraryBook } from "@/schemas/LibraryBook";
export { LibraryLoan } from "@/schemas/LibraryLoan";
export { SupportStaff } from "@/schemas/SupportStaff";
export { Notification } from "@/schemas/Notification";
