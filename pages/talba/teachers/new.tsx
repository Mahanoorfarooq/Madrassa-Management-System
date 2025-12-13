import { useRouter } from "next/router";
import { TalbaLayout } from "@/components/layout/TalbaLayout";
import TeacherForm, { TeacherFormValues } from "@/components/talba/TeacherForm";
import api from "@/utils/api";

export default function NewTeacherPage() {
  const router = useRouter();
  const dept =
    (router.query.dept as "HIFZ" | "NIZAMI" | "TAJWEED" | "WAFAQ") || "HIFZ";

  const onSubmit = async (values: TeacherFormValues) => {
    await api.post("/api/teachers", values);
    router.push({ pathname: "/talba/teachers", query: { dept } });
  };

  return (
    <TalbaLayout>
      <TeacherForm
        deptCode={dept}
        onSubmit={onSubmit}
        submitLabel="محفوظ کریں"
      />
    </TalbaLayout>
  );
}
