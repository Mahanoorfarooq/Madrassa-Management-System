import { useRouter } from "next/router";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import StudentForm, { StudentFormValues } from "@/components/talba/StudentForm";
import api from "@/utils/api";

export default function NewStudentPage() {
  const router = useRouter();
  const dept =
    (router.query.dept as "HIFZ" | "NIZAMI" | "TAJWEED" | "WAFAQ") || "HIFZ";

  const onSubmit = async (values: StudentFormValues) => {
    await api.post("/api/students", {
      ...values,
      rollNumber: values.admissionNumber || "",
    });
    router.push({ pathname: "/talba/students", query: { dept } });
  };

  return (
    <TalbaLayout>
      <StudentForm
        deptCode={dept}
        onSubmit={onSubmit}
        submitLabel="محفوظ کریں"
        showPortalAccount
      />
    </TalbaLayout>
  );
}
