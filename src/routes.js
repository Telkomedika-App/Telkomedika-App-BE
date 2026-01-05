import studentAuthRoutes from "./domains/student-auth/student-auth.routes.js";
import doctorAuthRoutes from "./domains/doctor-auth/doctor-auth.routes.js";
import forumRoutes from "./domains/forum/forum.routes.js";
import appointmentRoutes from "./domains/appointment/appointment.routes.js";
import artikelRoutes from "./domains/artikel/artikel.routes.js";
import studentProfileRoutes from "./domains/student-profile/student-profile.routes.js";
import doctorProfileRoutes from "./domains/doctor-profile/doctor-profile.routes.js";

const routes = [
  { path: "/student-auth", route: studentAuthRoutes },
  { path: "/doctor-auth", route: doctorAuthRoutes },
  { path: "/forum", route: forumRoutes },
  { path: "/appointments", route: appointmentRoutes },
  { path: "/artikel", route: artikelRoutes },
  { path: "/student-profile", route: studentProfileRoutes },
  { path: "/doctor-profile", route: doctorProfileRoutes }
];

export default routes;
