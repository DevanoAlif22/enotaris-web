"use client";
import { useState, useEffect } from "react";
import Modal from "../Modal";
import InputField from "../../components/input/InputField";
import CheckCardGroup from "../../components/input/CheckCardGroup";

// import heroicons
import {
  DocumentTextIcon,
  FolderArrowDownIcon,
} from "@heroicons/react/24/outline";

/**
 * Props:
 * - open: bool
 * - onClose: fn()
 * - onSubmit: fn({ deed_id, name, input_type })
 * - deed: { id, name }
 */
export default function DeedExtraFieldsModal({
  open,
  onClose,
  onSubmit,
  deed,
}) {
  const [fieldName, setFieldName] = useState("");
  const [inputType, setInputType] = useState("text"); // 'text' | 'file'

  useEffect(() => {
    if (open) {
      setFieldName("");
      setInputType("text");
    }
  }, [open, deed?.id]);

  const handleSave = () => {
    if (!fieldName.trim()) {
      alert("Nama wajib diisi");
      return;
    }
    onSubmit({
      deed_id: deed?.id,
      name: fieldName.trim(),
      input_type: inputType,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={<span className="dark:text-[#f5fefd]">Tambah Data Tambahan</span>}
      size="md"
      actions={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg dark:text-gray-600 bg-gray-100 dark:bg-[#f5fefd]"
          >
            Tutup
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[#0256c4] text-white font-semibold"
          >
            Simpan
          </button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Akta (read-only) */}
        <div>
          <div className="text-sm text-gray-500 dark:text-[#f5fefd] mb-2">
            Akta
          </div>
          <div className="px-4 py-3 rounded-xl font-semibold bg-[#f5fefd] dark:bg-[#01043c] dark:text-[#f5fefd] text-gray-800">
            {deed?.name || "-"}
          </div>
        </div>

        {/* Nama */}
        <div className="dark:text-[#f5fefd]">
          <InputField
            label={<span className="dark:text-[#f5fefd]">Nama Data</span>}
            type="text"
            name="name"
            placeholder="Contoh: Surat Kuasa Penghadap 1"
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            required
          />
        </div>

        {/* Jenis Input */}
        <CheckCardGroup
          labelTitle={
            <span className="dark:text-[#f5fefd] font-medium ">
              Jenis Input
            </span>
          }
          containerStyle="space-y-2"
          options={[
            {
              value: "text",
              name: "Teks",
              icon: (
                <DocumentTextIcon
                  className={`h-5 w-5 ${
                    inputType === "text" ? "text-blue-600" : "text-gray-400"
                  }`}
                />
              ),
            },
            {
              value: "file",
              name: <span className="dark:text-[#f5fefd]">File</span>,
              icon: (
                <FolderArrowDownIcon
                  className={`h-5 w-5 ${
                    inputType === "file"
                      ? "text-blue-600"
                      : "text-gray-400 dark:text-[#f5fefd]"
                  }`}
                />
              ),
            },
          ]}
          defaultValue={inputType}
          updateType="input_type"
          updateFormValue={(_, v) => setInputType(v)}
        />
      </div>
    </Modal>
  );
}
