import studentAuthRoutes from "./domains/student-auth/student-auth.routes.js";
import doctorAuthRoutes from "./domains/doctor-auth/doctor-auth.routes.js";
import forumRoutes from "./domains/forum/forum.routes.js";
import appointmentRoutes from "./domains/appointment/appointment.routes.js";

// tambahkan route domain lain jika ada
const routes = [
  { path: "/student-auth", route: studentAuthRoutes },
  { path: "/doctor-auth", route: doctorAuthRoutes },
  { path: "/forum", route: forumRoutes },
  { path: "/appointments", route: appointmentRoutes }
];

export default routes;
