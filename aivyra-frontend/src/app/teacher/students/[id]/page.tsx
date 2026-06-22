import TeacherStudentDetail from "./StudentDetailClient";

export async function generateStaticParams() {
  return [{ id: "1" }];
}

export default function Page() {
  return <TeacherStudentDetail />;
}
