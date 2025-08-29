function Pill({ children }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full border text-sm whitespace-nowrap">
      {children}
    </span>
  );
}

export default Pill;
