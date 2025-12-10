import BaseService from "../../common/base_classes/base-service.js";

class ArtikelService extends BaseService {
  constructor() {
    super();
  }
  

async getAllArtikel(filters = {}) {
  try {
    const {
      kategori,
      penulis,
      search,
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = filters;

    // Build where clause
    let where = { is_published: true };
    
    if (kategori) {
      where.kategori = kategori;
    }
    
    if (penulis) {
      where.penulis = { contains: penulis, mode: 'insensitive' };
    }
    
    if (search) {
      // Untuk search di dalam array JSON tags, kita perlu query khusus
      where.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { konten: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
      
      // Jika search adalah single tag, kita bisa filter dengan cara ini
      // Catatan: Prisma tidak mendukung contains langsung untuk Json
      // Alternatif: filter di memory atau gunakan database raw query
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await this.db.artikel.count({ where });

    // Get articles
    const articles = await this.db.artikel.findMany({
      where,
      select: {
        id: true,
        judul: true,
        gambar_url: true,
        kategori: true,
        tags: true,  // JSON field
        penulis: true,
        penulis_role: true,
        excerpt: true,
        created_at: true,
        updated_at: true,
        is_published: true
      },
      orderBy: { [sort_by]: sort_order },
      skip,
      take: parseInt(limit)
    });

    // Jika ada search dan ingin filter berdasarkan tags
    if (search) {
      const filteredArticles = articles.filter(article => {
        try {
          // Parse tags JSON (berisi array string)
          const tags = article.tags;
          if (Array.isArray(tags)) {
            return tags.some(tag => 
              tag.toLowerCase().includes(search.toLowerCase())
            );
          }
          return false;
        } catch {
          return false;
        }
      });

      return {
        success: true,
        data: filteredArticles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredArticles.length,
          totalPages: Math.ceil(filteredArticles.length / limit)
        }
      };
    }

    return {
      success: true,
      data: articles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

  } catch (error) {
    throw this.error.handleError(error, 'Failed to get articles');
  }
}

async createArtikel(data, user) {
  try {
    // Validasi dan parse tags
    let tagsArray = [];
    if (data.tags) {
      if (Array.isArray(data.tags)) {
        tagsArray = data.tags;
      } else if (typeof data.tags === 'string') {
        // Jika tags dikirim sebagai string comma-separated
        tagsArray = data.tags.split(',').map(tag => tag.trim());
      }
    }

    // Auto-generate excerpt dari konten
    const excerpt = data.konten.length > 150 
      ? data.konten.substring(0, 150) + '...'
      : data.konten;

    const artikel = await this.db.artikel.create({
      data: {
        judul: data.judul,
        konten: data.konten,
        excerpt: excerpt,
        gambar_url: data.gambar_url || null,
        kategori: data.kategori,
        tags: tagsArray,  // JSON array
        penulis: user.name || user.email,
        penulis_role: 'doctor',
        is_published: data.is_published !== undefined ? data.is_published : true,
        created_by: user.id,
        updated_by: user.id
      }
    });

    return {
      success: true,
      message: 'Artikel berhasil dibuat',
      data: artikel
    };
  } catch (error) {
    throw this.error.handleError(error, 'Failed to create article');
  }
}

async updateArtikel(id, data, user) {
  try {
    // Check if article exists
    const existingArtikel = await this.db.artikel.findUnique({
      where: { id }
    });

    if (!existingArtikel) {
      throw this.error.createError('Artikel tidak ditemukan', 404);
    }

    // Update excerpt jika konten berubah
    const updateData = { 
      updated_by: user.id,
      updated_at: new Date()
    };
    
    if (data.judul !== undefined) updateData.judul = data.judul;
    if (data.konten !== undefined) {
      updateData.konten = data.konten;
      updateData.excerpt = data.konten.length > 150 
        ? data.konten.substring(0, 150) + '...'
        : data.konten;
    }
    if (data.gambar_url !== undefined) updateData.gambar_url = data.gambar_url;
    if (data.kategori !== undefined) updateData.kategori = data.kategori;
    if (data.tags !== undefined) {
      // Parse tags
      let tagsArray = [];
      if (Array.isArray(data.tags)) {
        tagsArray = data.tags;
      } else if (typeof data.tags === 'string') {
        tagsArray = data.tags.split(',').map(tag => tag.trim());
      }
      updateData.tags = tagsArray;
    }
    if (data.is_published !== undefined) updateData.is_published = data.is_published;
    if (data.penulis !== undefined) updateData.penulis = data.penulis;
    if (data.penulis_role !== undefined) updateData.penulis_role = data.penulis_role;

    const artikel = await this.db.artikel.update({
      where: { id },
      data: updateData
    });

    return {
      success: true,
      message: 'Artikel berhasil diperbarui',
      data: artikel
    };
  } catch (error) {
    throw this.error.handleError(error, 'Failed to update article');
  }
}
// Tambahkan method baru untuk handle tags filter
async getAllArtikel(filters = {}) {
  try {
    const {
      kategori,
      penulis,
      search,
      tags, // Filter by specific tag
      include_unpublished = false,
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = filters;

    // Build where clause
    let where = {};
    
    if (!include_unpublished) {
      where.is_published = true;
    }
    
    if (kategori) {
      where.kategori = kategori;
    }
    
    if (penulis) {
      where.penulis = { contains: penulis, mode: 'insensitive' };
    }
    
    if (search) {
      where.OR = [
        { judul: { contains: search, mode: 'insensitive' } },
        { konten: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Note: Filter by tags akan dilakukan di memory karena Prisma tidak mendukung contains untuk Json
    // Untuk production, pertimbangkan menggunakan raw query atau mengubah schema

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count untuk semua data (sebelum filter tags)
    const totalQuery = await this.db.artikel.count({ where });
    
    // Get all matching articles
    let articles = await this.db.artikel.findMany({
      where,
      select: {
        id: true,
        judul: true,
        gambar_url: true,
        kategori: true,
        tags: true,
        penulis: true,
        penulis_role: true,
        excerpt: true,
        created_at: true,
        updated_at: true,
        is_published: true
      },
      orderBy: { [sort_by]: sort_order }
      // Tidak menggunakan skip/take di sini karena perlu filter tags di memory
    });

    // Filter by tags jika ada
    if (tags) {
      articles = articles.filter(article => {
        try {
          if (!article.tags) return false;
          const articleTags = article.tags;
          if (Array.isArray(articleTags)) {
            return articleTags.some(tag => 
              tag.toLowerCase().includes(tags.toLowerCase())
            );
          }
          return false;
        } catch {
          return false;
        }
      });
    }

    // Apply pagination setelah filter
    const total = articles.length;
    const paginatedArticles = articles.slice(skip, skip + parseInt(limit));

    return {
      success: true,
      data: paginatedArticles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

  } catch (error) {
    throw this.error.handleError(error, 'Failed to get articles');
  }
}

// Helper method untuk get article by ID dengan JSON tags
async getArtikelById(id) {
  try {
    const artikel = await this.db.artikel.findUnique({
      where: { id }
    });

    if (!artikel) {
      throw this.error.createError('Artikel not found', 404);
    }

    // Jika artikel tidak published, hanya doctor/admin yang bisa melihat
    if (!artikel.is_published) {
      throw this.error.createError('Artikel tidak tersedia', 404);
    }

    return {
      success: true,
      data: artikel
    };
  } catch (error) {
    throw this.error.handleError(error, 'Failed to get article');
  }
}
async deleteArtikel(id) {
  try {
    // Cek apakah artikel ada
    const artikel = await this.db.artikel.findUnique({
      where: { id }
    });

    if (!artikel) {
      throw this.error.createError('Artikel tidak ditemukan', 404);
    }

    // Hapus artikel
    await this.db.artikel.delete({
      where: { id }
    });

    return {
      success: true,
      message: 'Artikel berhasil dihapus',
      data: null
    };

  } catch (error) {
    throw this.error.handleError(error, 'Failed to delete article');
  }
}

}

export default new ArtikelService();