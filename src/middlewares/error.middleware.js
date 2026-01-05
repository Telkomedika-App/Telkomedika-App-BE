import StatusCode from "../common/enums/status-codes.enum.js";
import BaseError from "../common/base_classes/base-error.js";
import logger from "../utils/logger.util.js";

class ErrorMiddleware {
  errorHandler = (err, req, res, next) => {
    if (err instanceof BaseError) {
      logger.error(err.message);
      return res.status(err.errorCode).json({
        success: false,
        status: err.errorName,
        message: err.message,
      });
    } else {
      const code = err?.code;
      if (code === "P2002") {
        logger.error("Prisma unique constraint error:", err?.meta || err);
        return res.status(422).json({ success: false, status: "UNPROCESSABLE_ENTITY", message: "Data sudah digunakan" });
      }
      if (code === "P2003") {
        logger.error("Prisma foreign key constraint error:", err?.meta || err);
        return res.status(422).json({ success: false, status: "UNPROCESSABLE_ENTITY", message: "Relasi tidak valid (student/doctor tidak ditemukan)" });
      }
      if (code === "P2000" || code === "P2001") {
        logger.error("Prisma general error:", err?.meta || err);
        return res.status(422).json({ success: false, status: "UNPROCESSABLE_ENTITY", message: err?.message || "Permintaan tidak dapat diproses" });
      }

      logger.error("Unhandled error:", err);
      return res.status(StatusCode.INTERNAL_SERVER_ERROR.code).json({
        success: false,
        status: "Internal Server Error",
        message: err.message || StatusCode.INTERNAL_SERVER_ERROR.message,
      });
    }
  };

  errorCatcher = (controller) => async (req, res, next) => {
    try {
      console.log("[errorCatcher] req.user:", req.user);
      await controller(req, res, next);
    } catch (err) {
      const name = controller.name?.replace(/^bound\s*/, ""); 
      logger.error(`in [${name}]:`, err);
      next(err);
    }
  };
}

export default new ErrorMiddleware();
