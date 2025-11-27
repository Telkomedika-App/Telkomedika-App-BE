import "dotenv/config";
import morgan from "morgan";
import express from "express";
import cors from "cors";
import errorMiddleware from "./middlewares/error.middleware.js";
import routes from "./routes.js";
import BaseError from "./common/base_classes/base-error.js";
import logger from "./utils/logger.util.js";

class ExpressApplication {
  constructor(port) {
    this.port = port;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes(routes);
    this.setupErrorHandler();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(morgan("tiny"));
  }

  setupRoutes(routes) {
    const router = express.Router();

    routes.forEach((route) => {
      router.use(`/api${route.path}`, route.route);
    });

    this.app.use(router);

    this.app.use("*splat", (req, res, next) => {
      logger.error(`Route not found: ${req.originalUrl}`);
      next(BaseError.notFound("Route not found"));
    });
  }

  // Error handler middleware harus dipasang setelah semua route soalnya ntar broken
  setupErrorHandler() {
    this.app.use(errorMiddleware.errorHandler);
  }

  start() {
    this.app.listen(this.port, () => {
      logger.info(`Server is running on port ${this.port}`);
    });
  }
}

export default ExpressApplication;
