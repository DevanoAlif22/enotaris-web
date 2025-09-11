export default function InputField({
  label,
  type,
  placeholder,
  name,
  value,
  onChange,
  required = false,
  disabled = false,
}) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full border dark:placeholder:text-gray-400 border-gray-400 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
          disabled
            ? "bg-gray-100 dark:bg-gray-300 text-gray-500 cursor-not-allowed"
            : ""
        }`}
      />
    </div>
  );
}
