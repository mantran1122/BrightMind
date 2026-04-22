import { courses } from "@/lib/courses-data";
import CoursesGridClient from "@/components/courses/CoursesGridClient";
import { ensureMysqlSetup, listCourses } from "@/lib/mysql";

export default async function Section2CourseGrid() {
  let data = courses;

  try {
    await ensureMysqlSetup();
    data = await listCourses();
  } catch {
    data = courses;
  }

  return <CoursesGridClient courses={data} />;
}
