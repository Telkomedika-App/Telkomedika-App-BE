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

    let where = { is_published: true };
    
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

    const skip = (page - 1) * limit;

    const total = await this.db.artikel.count({ where });

    const articles = await this.db.artikel.findMany({
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
      orderBy: { [sort_by]: sort_order },
      skip,
      take: parseInt(limit)
    });

    if (search) {
      const filteredArticles = articles.filter(article => {
        try {
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
    let tagsArray = [];
    if (data.tags) {
      if (Array.isArray(data.tags)) {
        tagsArray = data.tags;
      } else if (typeof data.tags === 'string') {
        tagsArray = data.tags.split(',').map(tag => tag.trim());
      }
    }

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
        tags: tagsArray,  
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
    const existingArtikel = await this.db.artikel.findUnique({
      where: { id }
    });

    if (!existingArtikel) {
      throw this.error.createError('Artikel tidak ditemukan', 404);
    }

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

async getAllArtikel(filters = {}) {
  try {
    const {
      kategori,
      penulis,
      search,
      tags, 
      include_unpublished = false,
      page = 1,
      limit = 10,
      sort_by = 'created_at',
      sort_order = 'desc'
    } = filters;

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

    const skip = (page - 1) * limit;

    const totalQuery = await this.db.artikel.count({ where });
 
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
    });

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

async getArtikelById(id) {
  try {
    const artikel = await this.db.artikel.findUnique({
      where: { id }
    });

    if (!artikel) {
      throw this.error.createError('Artikel not found', 404);
    }

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
    const artikel = await this.db.artikel.findUnique({
      where: { id }
    });

    if (!artikel) {
      throw this.error.createError('Artikel tidak ditemukan', 404);
    }

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