import AttendAssessment from "./QuizClient";

export async function generateStaticParams() {
  return [{ id: "1" }];
}

export default function Page() {
  return <AttendAssessment />;
}
