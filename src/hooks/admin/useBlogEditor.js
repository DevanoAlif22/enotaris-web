import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { blogService } from "../../services/blogService";
import { categoryBlogService } from "../../services/categoryBlogService";
import { showError, showSuccess } from "../../utils/toastConfig";
import {
  createInitialForm,
  fillFormFromServer,
  toPayload,
} from "../../helpers/admin/blogForm";

export default function useBlogEditor(blogId, navigate) {
  const isEdit = useMemo(() => Boolean(blogId), [blogId]);
  const quillRef = useRef(null); // kalau perlu akses editor
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [allCats, setAllCats] = useState([]); // list kategori
  const [form, setForm] = useState(createInitialForm());

  // helpers set field
  const setField = useCallback((key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
  }, []);

  // toggle kategori
  const toggleCategory = useCallback((catId) => {
    setForm((f) => ({
      ...f,
      categoryIds: f.categoryIds.includes(catId)
        ? f.categoryIds.filter((id) => id !== catId)
        : [...f.categoryIds, catId],
    }));
  }, []);

  // file input
  const handleFileChange = useCallback(({ updateType, value }) => {
    if (updateType !== "image") return;
    const { file, previewUrl } = value;
    setForm((f) => ({
      ...f,
      imageFile: file || null,
      imageUrl: previewUrl || "",
      clearImage: file ? false : f.clearImage, // pilih file baru -> abaikan clear
    }));
  }, []);

  // quill onChange
  const handleDescChange = useCallback(
    (val) => {
      setField("description", val);
    },
    [setField]
  );

  // load kategori + (jika edit) data blog
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [catsRes, blogRes] = await Promise.all([
          categoryBlogService.all({ min: true }),
          isEdit
            ? blogService.get(blogId, { withCategories: true })
            : Promise.resolve(null),
        ]);

        if (!mounted) return;

        setAllCats(catsRes?.data || []);
        if (blogRes?.data) setForm(fillFormFromServer(blogRes.data));
      } catch (e) {
        showError(e.message || "Gagal memuat data.");
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [blogId, isEdit]);

  // save
  const handleSave = useCallback(async () => {
    try {
      setSaving(true);
      const payload = toPayload(form);
      if (isEdit) {
        await blogService.update(blogId, payload);
        showSuccess("Blog berhasil diperbarui.");
      } else {
        await blogService.create(payload);
        showSuccess("Blog berhasil dibuat.");
      }
      navigate("/app/blog");
    } catch (e) {
      const firstErr =
        e?.errors && typeof e.errors === "object"
          ? (() => {
              const first = Object.values(e.errors)[0];
              return Array.isArray(first) ? first[0] : String(first);
            })()
          : null;
      showError(firstErr || e.message || "Gagal menyimpan blog.");
    } finally {
      setSaving(false);
    }
  }, [blogId, form, isEdit, navigate]);

  return {
    // states
    isEdit,
    loading,
    saving,
    allCats,
    form,
    quillRef,

    // setters/handlers
    setField,
    toggleCategory,
    handleFileChange,
    handleDescChange,
    handleSave,
  };
}
