// Bentuk state form standar
export const createInitialForm = () => ({
  title: "",
  description: "",
  imageFile: null, // File
  imageUrl: "", // preview/remote url
  clearImage: false, // checkbox hapus
  categoryIds: [], // [number]
});

// Prefill dari data server ketika edit
export const fillFormFromServer = (server) => ({
  title: server?.title || "",
  description: String(server?.description || ""),
  imageFile: null,
  imageUrl: server?.image || "",
  clearImage: false,
  categoryIds: Array.isArray(server?.categories)
    ? server.categories.map((c) => c.id)
    : [],
});

// Ubah state form -> payload API
export const toPayload = (form) => ({
  title: form.title,
  description: form.description,
  imageFile: form.imageFile || null,
  clear_image: !!form.clearImage && !form.imageFile,
  category_blog_ids: form.categoryIds,
});
