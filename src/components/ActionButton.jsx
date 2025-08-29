function ActionButton({ children, variant = "info", ...rest }) {
  const variants = {
    info: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    neutral: "bg-gray-100 text-gray-800",
  };
  return (
    <button
      className={`px-3 py-2 rounded-lg text-sm font-semibold ${variants[variant]}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export default ActionButton;
