import { useState } from "react";

export default function CheckCardGroup({
  labelTitle,
  labelDescription,
  containerStyle = "",
  options = [],
  defaultValue = "",
  updateType,
  updateFormValue,
}) {
  const [selected, setSelected] = useState(defaultValue);

  const handleSelect = (value) => {
    setSelected(value);
    updateFormValue(updateType, value);
  };

  return (
    <div className={containerStyle}>
      {labelTitle && (
        <h3 className="text-lg font-semibold text-gray-700">{labelTitle}</h3>
      )}
      {labelDescription && (
        <p className="text-sm text-gray-500 mb-3">{labelDescription}</p>
      )}
      <div className="flex gap-3">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleSelect(opt.value)}
            className={`flex-1 flex items-center justify-center gap-2 border rounded-lg px-4 py-3 text-sm font-medium transition ${
              selected === opt.value
                ? "border-blue-600 bg-blue-50 text-blue-600"
                : "border-gray-300 hover:border-blue-400 text-gray-600"
            }`}
          >
            {opt.icon}
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  );
}
