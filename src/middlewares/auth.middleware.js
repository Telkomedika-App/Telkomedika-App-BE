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
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        logger.warn("Token not found in request headers");
        return next(BaseError.unauthorized("Token not found"));
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        logger.warn("No token provided after Bearer");
        return next(BaseError.unauthorized("User has not logged in"));
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        logger.error("JWT verification failed:", err.message);
        if (err.message === "invalid signature") return next(BaseError.forbidden("Invalid Signature"));
        if (err.message === "jwt expired") return next(BaseError.forbidden("Token Expired"));
        return next(BaseError.forbidden("Token is invalid"));
      }

      console.log("Decoded token:", decoded);

      if (!decoded || !decoded.id || !decoded.role) {
        logger.warn("Decoded token missing required fields");
        return next(BaseError.forbidden("Token is missing required fields"));
      }

      // NORMALISASI ROLE KE LOWERCASE
      const normalizedRole = decoded.role.toLowerCase();
      
      let user = null;

      if (normalizedRole === this.roles.STUDENT.toLowerCase()) {
        user = await this.prisma.student.findUnique({ where: { id: decoded.id } });
        if (!user) {
          logger.warn(`Student with ID ${decoded.id} not found`);
          return next(BaseError.notFound("Student not found"));
        }
      } else if (normalizedRole === this.roles.DOCTOR.toLowerCase()) {
        user = await this.prisma.doctor.findUnique({ where: { id: decoded.id } });
        if (!user) {
          logger.warn(`Doctor with ID ${decoded.id} not found`);
          return next(BaseError.notFound("Doctor not found"));
        }
      } else if (normalizedRole === this.roles.ADMIN.toLowerCase()) {
        user = await this.prisma.admin.findUnique({ where: { id: decoded.id } });
        if (!user) {
          logger.warn(`Admin with ID ${decoded.id} not found`);
          return next(BaseError.notFound("Admin not found"));
        }
      } else {
        logger.warn(`Role ${decoded.role} is invalid`);
        return next(BaseError.forbidden("Token role is invalid"));
      }

      req.user = { 
        ...user, 
        role: normalizedRole,
        originalRole: decoded.role 
      };
      
      console.log("User attached to request:", req.user);

      next();
    } catch (err) {
      logger.error("Unexpected error in authenticate middleware:", err);
      return next(BaseError.forbidden("Authentication failed"));
    }
  };

  role = (allowedRoles) => {
    return (req, res, next) => {
      if (!req.user || !req.user.role) {
        logger.warn("No user attached to request or missing role");
        return next(BaseError.forbidden("Access Denied"));
      }

      const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
      
      if (!normalizedAllowedRoles.includes(req.user.role)) {
        logger.warn(`User role ${req.user.role} does not have access. Allowed: ${allowedRoles.join(', ')}`);
        return next(BaseError.forbidden("Access Denied"));
      }

      next();
    };
  };
}

export default new AuthMiddleware();