import { useRouter } from "next/router";
import { UsatazaLayout } from "@/components/layout/UsatazaLayout";
import TeacherFormAdmin, {
  TeacherAdminFormValues,
} from "@/components/usataza/TeacherFormAdmin";
import api from "@/utils/api";

export default function UsatazaNewTeacherPage() {
  const router = useRouter();

  const onSubmit = async (values: TeacherAdminFormValues) => {
    await api.post("/api/teachers", values);
    router.push("/usataza/teachers");
  };

  return (
    <UsatazaLayout title="نیا استاد شامل کریں">
      <TeacherFormAdmin onSubmit={onSubmit} />
    </UsatazaLayout>
  );
}
