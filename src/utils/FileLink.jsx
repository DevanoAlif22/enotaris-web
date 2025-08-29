const FileLink = ({ url }) =>
  url ? (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 underline"
    >
      Klik di sini
    </a>
  ) : (
    <span className="text-gray-500">-</span>
  );
export default FileLink;
