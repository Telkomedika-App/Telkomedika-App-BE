// artikel.routes.js
import ArtikelController from "./artikel.controller.js";
import BaseRoutes from "../../common/base_classes/base-routes.js";
import { artikelSchema, artikelUpdateSchema, artikelFilterSchema } from './artikel.schema.js';

class ArtikelRoutes extends BaseRoutes {
  constructor() {
    super(ArtikelController);
  }

  routes() {
    this.router.get("/", [
      this.validate(artikelFilterSchema),
      this.errCatch(this.controller.getAllArtikel.bind(this.controller))
    ]);
    
    this.router.get("/:id", [
      this.errCatch(this.controller.getArtikelById.bind(this.controller))
    ]);

    this.router.get("/student/articles", [
      this.auth.authenticate,
      this.auth.role([this.roles.STUDENT]),
      this.validate(artikelFilterSchema),
      this.errCatch(this.controller.getAllArtikel.bind(this.controller))
    ]);

    this.router.get("/doctor/my-articles", [
      this.auth.authenticate,
      this.auth.role([this.roles.DOCTOR]),
      this.errCatch(this.controller.getMyArtikel.bind(this.controller))
    ]);

    this.router.post("/doctor/articles", [
      this.auth.authenticate,
      this.auth.role([this.roles.DOCTOR]),
      this.validate(artikelSchema),
      this.errCatch(this.controller.createArtikel.bind(this.controller))
    ]);

    this.router.put("/doctor/articles/:id", [
      this.auth.authenticate,
      this.auth.role([this.roles.DOCTOR]),
      this.validate(artikelUpdateSchema),
      this.errCatch(this.controller.updateArtikel.bind(this.controller))
    ]);

    this.router.delete("/doctor/articles/:id", [
      this.auth.authenticate,
      this.auth.role([this.roles.DOCTOR]),
      this.errCatch(this.controller.deleteArtikel.bind(this.controller))
    ]);
  }
}

export default new ArtikelRoutes().router;