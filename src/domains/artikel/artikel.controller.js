import ArtikelService from "./artikel.service.js";

class ArtikelController {
  async getAllArtikel(req, res) {
    try {
      const filters = req.query;
      const user = req.user;

      if (user && (user.role === "doctor" || user.role === "admin")) {
        filters.include_unpublished = true;
      }

      const result = await ArtikelService.getAllArtikel(filters);

      return res.status(200).json({
        success: true,
        message: "Articles retrieved successfully",
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("ERROR in getAllArtikel:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to load articles",
      });
    }
  }

  async getArtikelById(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      const result = await ArtikelService.getArtikelById(id);
      const artikel = result.data;

      if (!artikel.is_published) {
        if (
          !user ||
          (user.role !== "doctor" && user.role !== "admin") ||
          (user.role === "doctor" && artikel.created_by !== user.id)
        ) {
          return res.status(404).json({
            success: false,
            message: "Artikel tidak tersedia",
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: "Article retrieved successfully",
        data: result.data,
      });
    } catch (error) {
      console.error("ERROR in getArtikelById:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve article",
      });
    }
  }

  async createArtikel(req, res) {
    try {
      const data = req.body;
      const user = req.user;

      data.penulis = user.name || user.email;
      data.penulis_role = "doctor";

      const result = await ArtikelService.createArtikel(data, user);

      return res.status(201).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("ERROR in createArtikel:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create article",
      });
    }
  }

  async updateArtikel(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = req.user;

      const result = await ArtikelService.updateArtikel(id, data, user);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      console.error("ERROR in updateArtikel:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update article",
      });
    }
  }

  async deleteArtikel(req, res) {
    try {
      const { id } = req.params;
      const result = await ArtikelService.deleteArtikel(id);

      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("ERROR in deleteArtikel:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to delete article",
      });
    }
  }

  async getMyArtikel(req, res) {
    try {
      const user = req.user;
      const result = await ArtikelService.getArtikelByDoctor(user.id);

      return res.status(200).json({
        success: true,
        message: "Doctor articles retrieved successfully",
        data: result.data,
      });
    } catch (error) {
      console.error("ERROR in getMyArtikel:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to load doctor's articles",
      });
    }
  }
}

export default new ArtikelController();
