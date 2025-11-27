import jwt from "jsonwebtoken";
import BaseError from "../common/base_classes/base-error.js";
import Prisma from "../common/services/prisma.service.js";
import logger from "../utils/logger.util.js";
import Roles from "../common/enums/user-roles.enum.js";

class AuthMiddleware {
  constructor() {
    this.roles = Roles;
    this.prisma = Prisma;
  }

  authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Token not found in request headers");
      return next(BaseError.unauthorized("Token not found"));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      logger.warn("No token provided");
      return next(BaseError.unauthorized("User Have Not Login"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (
        !decoded ||
        !decoded.id ||
        !decoded.role ||
        !(
          decoded.role === this.roles.STUDENT ||
          decoded.role === this.roles.DOCTOR
        )
      ) {
        logger.warn("Decoded token is invalid or missing required fields");
        return next(BaseError.forbidden("Token Is Invalid Or No Longer Valid"));
      }

      if (decoded.role === this.roles.STUDENT) {
        const student = await this.prisma.student.findUnique({
          where: { id: decoded.id },
        });

        if (!student) {
          logger.warn(`Student with ID ${decoded.id} not found in database`);
          return next(BaseError.notFound("Student Not Found"));
        }

        req.user = student;
        req.user.role = this.roles.STUDENT;
      } else if (decoded.role === this.roles.DOCTOR) {
        const doctor = await this.prisma.doctor.findUnique({
          where: { id: decoded.id },
        });

        if (!doctor) {
          logger.warn(`Doctor with ID ${decoded.id} not found in database`);
          return next(BaseError.notFound("Doctor Not Found"));
        }

        req.user = doctor;
        req.user.role = this.roles.DOCTOR;
      } else {
        logger.warn("Token type is invalid");
        return next(BaseError.forbidden("Token Is Invalid Or No Longer Valid"));
      }

      next();
    } catch (err) {
      if (err.message === "invalid signature") {
        return next(BaseError.forbidden("Invalid Signature"));
      } else if (err.message === "invalid token") {
        return next(BaseError.forbidden("Invalid Token"));
      } else if (err.message === "jwt expired") {
        return next(BaseError.forbidden("Token Expired"));
      } else {
        return next(BaseError.forbidden("Token Is Invalid Or No Longer Valid"));
      }
    }
  };

  role = (roles) => {
    return (req, res, next) => {
      if (req.user.role === this.roles.ADMIN) {
        logger.info(`Welcome Admin`);
        return next();
      }

      if (!roles.includes(req.user.role)) {
        logger.warn(`User role ${req.user.role} does not have access`);
        return next(BaseError.forbidden("Access Denied"));
      }
      next();
    };
  };
}

export default new AuthMiddleware();