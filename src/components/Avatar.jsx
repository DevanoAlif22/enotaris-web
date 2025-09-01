function Avatar({ name, src }) {
  const initials = (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const validSrc = typeof src === "string" && src.trim() !== "" ? src : null;

  if (validSrc) {
    return (
      <img
        src={validSrc}
        alt={name}
        className="w-10 h-10 rounded-full object-cover bg-gray-200"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-xl bg-gray-200 text-gray-700 flex items-center justify-center font-semibold">
      {initials || "?"}
    </div>
  );
}

export default Avatar;
