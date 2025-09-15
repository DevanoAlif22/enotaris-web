import React from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

function SelectInput({
  labelTitle,
  labelStyle = "",
  containerStyle = "",
  defaultValue = "",
  placeholder = "Pilih opsi...",
  options = [],
  updateFormValue,
  updateType,
  required = false,
  disabled = false,
}) {
  const handleChange = (e) => {
    updateFormValue?.({ updateType, value: e.target.value });
  };

  return (
    <div className={`form-control w-full ${containerStyle}`}>
      <label className="label">
        <span
          className={`label-text text-sm font-medium text-gray-700 ${labelStyle}`}
        >
          {labelTitle}
          {required && <span className="ml-1 text-red-500">*</span>}
        </span>
      </label>

      <div className="relative">
        <select
          className={`
            w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg
            appearance-none cursor-pointer transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            hover:border-gray-400
            ${
              disabled
                ? "bg-gray-100 dark:bg-gray-300 text-gray-500 cursor-not-allowed"
                : "hover:shadow-sm"
            }
            ${
              defaultValue === ""
                ? "text-gray-500"
                : "text-gray-900 dark:text-gray-500"
            }
          `}
          value={defaultValue}
          onChange={handleChange}
          disabled={disabled}
        >
          <option value="" disabled className="text-gray-500">
            {placeholder}
          </option>
          {options.map((option, index) => (
            <option key={index} value={option.value} className="text-gray-900">
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow with animation */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDownIcon
            className={`w-5 h-5 transition-colors duration-200 ${
              disabled ? "text-gray-300" : "text-gray-400"
            }`}
          />
        </div>

        {/* Subtle shadow on focus */}
        <div className="absolute inset-0 rounded-lg pointer-events-none opacity-0 transition-opacity duration-200 bg-gradient-to-r from-blue-50 to-indigo-50 -z-10"></div>
      </div>

      {/* Optional helper text area */}
      {/* You can uncomment this if you want to add helper text support */}
      {/* 
      {helperText && (
        <div className="mt-1">
          <span className="text-xs text-gray-500">{helperText}</span>
        </div>
      )}
      */}
    </div>
  );
}

export default SelectInput;
