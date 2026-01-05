import Joi from "joi";

const artikelSchema = Joi.object({
  judul: Joi.string().min(3).max(200).required().messages({
    'string.min': 'Judul minimal 3 karakter',
    'string.max': 'Judul maksimal 200 karakter',
    'any.required': 'Judul artikel wajib diisi'
  }),
  konten: Joi.string().min(10).required().messages({
    'string.min': 'Konten artikel minimal 10 karakter',
    'any.required': 'Konten artikel wajib diisi'
  }),
  gambar_url: Joi.string().uri().allow('', null).optional(),
  kategori: Joi.string().valid(
    'umum', 
    'penyakit', 
    'gaya-hidup', 
    'makanan-sehat', 
    'olahraga',
    'mental-health'
  ).required(),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional().default([]),
  is_published: Joi.boolean().default(true),
  penulis: Joi.string().max(100).optional(), 
  penulis_role: Joi.string().valid('doctor', 'admin').optional() 
});

const artikelUpdateSchema = Joi.object({
  judul: Joi.string().min(3).max(200).optional(),
  konten: Joi.string().min(10).optional(),
  gambar_url: Joi.string().uri().allow('', null).optional(),
  kategori: Joi.string().valid(
    'umum', 
    'penyakit', 
    'gaya-hidup', 
    'makanan-sehat', 
    'olahraga',
    'mental-health'
  ).optional(),
  tags: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string()
  ).optional(),
  is_published: Joi.boolean().optional(),
  penulis: Joi.string().max(100).optional(),
  penulis_role: Joi.string().valid('doctor', 'admin').optional()
}).min(1);

const artikelFilterSchema = Joi.object({
  kategori: Joi.string().optional(),
  penulis: Joi.string().optional(),
  search: Joi.string().optional(),
  tags: Joi.string().optional(), 
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  sort_by: Joi.string().valid('created_at', 'judul', 'kategori').default('created_at'),
  sort_order: Joi.string().valid('asc', 'desc').default('desc'),
  include_unpublished: Joi.boolean().default(false) 
});

export { artikelSchema, artikelUpdateSchema, artikelFilterSchema };