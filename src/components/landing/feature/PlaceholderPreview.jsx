export default function PlaceholderPreview({ title = "Fitur" }) {
  return (
    <div className="border border-dashed border-[#d9e6ff] rounded-xl p-6 text-center">
      <div className="mx-auto w-full h-40 rounded-lg bg-gradient-to-r from-[#f5f9ff] to-[#eef4ff] flex items-center justify-center">
        <span className="text-[#5172a3] text-sm">
          Preview <b>{title}</b> — Demo coming soon
        </span>
      </div>

      <div className="mt-4 text-left">
        <ul className="list-disc list-inside text-[#5b6b86] text-sm space-y-1">
          <li>Component real akan dirender di panel ini.</li>
          <li>Dapat berupa form, tabel, viewer dokumen, chart, dsb.</li>
          <li>
            Mudah diganti: cukup set <code>component</code> di data langkah.
          </li>
        </ul>
      </div>
    </div>
  );
}
