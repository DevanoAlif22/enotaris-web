// components/deed/DeedTemplateEditor.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { jsPDF } from "jspdf";
import { buildTokenMap, replaceTokens } from "../../utils/project/deedTemplate";
import PagedPreview from "./PagedPreview";
/**
 * Props:
 * - activity: object
 * - initialHtml?: string (template dari BE; default = DEFAULT_TEMPLATE)
 * - onSave?: (html) => void|Promise<void>
 * - onExportPdf?: (html) => void|Promise<void>  // server-side render & upload
 * - saving?: boolean
 * - exporting?: boolean
 */
export default function DeedTemplateEditor({
  activity,
  initialHtml,
  onSave,
  onExportPdf,
  saving = false,
  exporting = false,
}) {
  // DeedTemplateEditor.jsx (di atas komponen)
  const MM_TO_PX = 96 / 25.4; // ≈3.78 px per mm (96dpi)
  const A4PX = { w: Math.round(210 * MM_TO_PX), h: Math.round(297 * MM_TO_PX) };

  // atur margin asimetris: top/right/bottom/left (dalam mm)
  const MARGIN_MM = { t: 20, r: 20, b: 20, l: 20 };
  const MARGIN_PX = {
    t: Math.round(MARGIN_MM.t * MM_TO_PX),
    r: Math.round(MARGIN_MM.r * MM_TO_PX),
    b: Math.round(MARGIN_MM.b * MM_TO_PX),
    l: Math.round(MARGIN_MM.l * MM_TO_PX),
  };

  const [template, setTemplate] = useState(() =>
    typeof initialHtml === "string" && initialHtml.trim()
      ? initialHtml
      : DEFAULT_TEMPLATE
  );

  // ⬇️ fallback kalau prop initialHtml berubah
  useEffect(() => {
    if (typeof initialHtml === "string") {
      setTemplate(initialHtml.trim() ? initialHtml : DEFAULT_TEMPLATE);
    } else if (initialHtml == null) {
      setTemplate(DEFAULT_TEMPLATE);
    }
  }, [initialHtml]);

  const tokenMap = useMemo(() => buildTokenMap(activity), [activity]);
  const html = useMemo(
    () => replaceTokens(template, tokenMap),
    [template, tokenMap]
  );
  // const previewRef = useRef(null);
  const quillRef = useRef(null);

  const handleExportPDFClient = async () => {
    // Ambil elemen pratinjau utama yang berisi seluruh konten
    // Asumsi: elemen ini adalah div dengan class "preview-content" atau semacamnya
    const el = document.querySelector(".preview-content");
    if (!el) return;

    // Atur orientasi dan format halaman
    const pdf = new jsPDF({
      unit: "mm", // Gunakan milimeter untuk presisi A4
      format: "a4",
      compress: true,
    });

    // Gunakan metode .html() untuk merender seluruh konten HTML
    // Biarkan jsPDF yang menangani pemecahan halaman secara otomatis
    await pdf.html(el, {
      // Sesuaikan posisi dan margin
      x: 0,
      y: 0,
      html2canvas: { scale: 1, useCORS: true, backgroundColor: "#ffffff" },
      // Opsi autoPaging: 'text' akan memecah halaman jika konten melebihi batas
      autoPaging: "text",
    });

    // Simpan file PDF
    pdf.save("akta.pdf");
  };

  const insertToken = (token) => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    const pos = range ? range.index : quill.getLength();
    const txt = `{${token}}`;
    quill.insertText(pos, txt, "user");
    quill.setSelection(pos + txt.length);
    quill.focus();
  };

  const resetTemplate = () => {
    setTemplate(DEFAULT_TEMPLATE);
  };

  // Quill toolbar
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ align: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ color: [] }, { background: [] }],
      ["clean"],
      ["link", "image"],
    ],
    clipboard: { matchVisual: false },
  };
  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "align",
    "color",
    "background",
  ];

  return (
    <div className="space-y-6">
      {/* Editor + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor */}
        {/* Editor */}
        <div className="lg:col-span-2">
          <div className="text-sm font-medium mb-2">Template Akta</div>
          {/* HAPUS overflow-hidden; beri class pembeda */}
          <div className="border rounded quill-wrap">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={template}
              onChange={setTemplate}
              modules={modules}
              formats={formats}
              className="deed-quill"
              // <-- JANGAN set style height di sini
              placeholder="Tulis template akta di sini..."
            />
          </div>
          {/* Actions */}
          <div className="mt-16 flex flex-wrap gap-8 items-center">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={resetTemplate}
                className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Reset Template
              </button>
              <button
                type="button"
                onClick={() => onSave?.(template)}
                disabled={saving}
                className="px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-60"
              >
                {saving ? "Menyimpan…" : "Simpan Draft"}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportPDFClient}
                className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Export PDF (Client)
              </button>
              <button
                type="button"
                onClick={() => onExportPdf?.(template)}
                disabled={exporting}
                className="px-3 py-2 rounded bg-[#0256c4] hover:bg-blue-700 text-white transition-colors disabled:opacity-60"
              >
                {exporting ? "Mengekspor…" : "Generate & Upload (Server)"}
              </button>
            </div>
          </div>
        </div>

        {/* Token List */}
        <div>
          <div className="text-sm font-medium mb-2">Token Tersedia</div>
          <div className="border rounded p-3 bg-gray-50 max-h-[500px] overflow-auto">
            <div className="text-xs text-gray-600 mb-2">
              Klik token untuk menyisipkan ke editor
            </div>
            <TokenList tokenMap={tokenMap} onInsertToken={insertToken} />
          </div>
        </div>
      </div>

      {/* Preview */}
      {/* Preview */}
      <div>
        <div className="text-sm font-medium mb-2">Preview</div>
        <PagedPreview html={html} />
      </div>
    </div>
  );
}

function TokenList({ tokenMap, onInsertToken }) {
  const keys = Object.keys(tokenMap);
  if (!keys.length) return <div className="text-sm text-gray-500">-</div>;
  return (
    <div className="space-y-1">
      {keys.map((k) => (
        <div key={k} className="group">
          <button
            type="button"
            onClick={() => onInsertToken(k)}
            className="w-full text-left p-2 rounded hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
          >
            <div className="flex justify-between items-start gap-2">
              <code className="text-xs font-mono text-blue-600 bg-blue-50 px-1 rounded">
                {`{${k}}`}
              </code>
              <span className="text-xs text-gray-500 truncate flex-1 text-right">
                {String(tokenMap[k]).substring(0, 20)}
                {String(tokenMap[k]).length > 20 && "..."}
              </span>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
}

// const DEFAULT_TEMPLATE = `
// <div style="text-align:center;margin-bottom:12px">
//   <h2 style="margin:0">AKTA OTENTIK</h2>
//   <div style="font-size:12px">Nomor: {activity_code}</div>
// </div>

// <p>Pada hari ini, tanggal {today}, bertempat di {schedule_place}, saya {notaris_name}, Notaris, telah membacakan akta dengan judul <b>{deed_name}</b> terkait aktivitas <b>{activity_name}</b>.</p>

// <h3>Para Penghadap</h3>
// {parties_table}

// <h3>Keterangan Penghadap</h3>
// <p>Nama Penghadap Pertama: <b>{penghadap1_name}</b><br/>
// NIK: {penghadap1_nik} — Alamat: {penghadap1_address}, {penghadap1_city}, {penghadap1_province}</p>

// <h3>Kelengkapan Dokumen</h3>
// <ul>
//   <li>NIK (P1): {penghadap1_req_nik}</li>
//   <li>Surat Kuasa (P1): {penghadap1_req_surat_kuasa}</li>
// </ul>

// <p>Jadwal pembacaan: {schedule_datetime} — Catatan: {schedule_note}</p>

// <p style="margin-top:36px">Demikian akta ini dibuat, dibacakan dan ditandatangani sebagaimana mestinya.</p>
// `;
const DEFAULT_TEMPLATE = `
<div style="text-align:center;margin-bottom:8px">
  <h2 style="margin:0">PERJANJIAN SEWA MENYEWA</h2>
  <div style="font-size:12px">Nomor : {activity_code}</div>
</div>

<p>&ndash; Pada hari ini, {today}</p>
<p>&ndash; tanggal .............................................................</p>
<p>&ndash; Pukul .................................................................</p>

<p>&ndash; Berhadapan dengan saya, {notaris_name}, Notaris di {schedule_place}, 
dengan dihadiri oleh para saksi yang saya, Notaris, kenal dan akan disebutkan nama-namanya pada bahagian akhir akta ini:</p>

<p><b>I. Tuan {penghadap1_name}</b><br/>
..............................................................<br/>
..............................................................<br/>
..............................................................</p>

<p><b>II. Tuan {penghadap2_name}</b><br/>
..............................................................<br/>
..............................................................<br/>
..............................................................</p>

<p>&ndash; menurut keterangannya dalam hal ini bertindak dalam jabatannya selaku Presiden Direktur dari Perseroan Terbatas PT. .........., berkedudukan di Jakarta yang anggaran dasarnya beserta perubahannya telah mendapat persetujuan dari Menteri Kehakiman dan Hak Asasi Manusia berturut-turut:</p>

<p>
..............................................................<br/>
..............................................................<br/>
..............................................................<br/>
..............................................................
</p>

<p>selanjutnya disebut: <b>Pihak Kedua</b> atau <b>Penyewa</b>.</p>

<p>&ndash; Para penghadap telah saya, Notaris, kenal.</p>

<p>&ndash; Para penghadap menerangkan terlebih dahulu:</p>

<p>&ndash; bahwa Pihak Pertama adalah pemilik dari bangunan Rumah Toko (Ruko) yang hendak disewakan kepada Pihak Kedua yang akan disebutkan di bawah ini dan Pihak Kedua menerangkan menyewa dari Pihak Pertama berupa:</p>

<p>&ndash; 1 (satu) unit bangunan Rumah Toko (Ruko) berlantai 3 (tiga) berikut turutannya, lantai keramik, dinding tembok, atap dak, aliran listrik sebesar 2.200 Watt, dilengkapi air dari jet pump, berdiri di atas sebidang tanah Sertifikat HGB Nomor: ............ seluas ...... m² (....................................), penerbitan sertifikat tanggal ..........................., tercantum atas nama .................. yang telah diuraikan dalam Gambar Situasi tanggal ............ nomor ............; Sertifikat tanah diterbitkan oleh Kantor Pertanahan Kabupaten Bekasi, terletak di Provinsi Jawa Barat, Kabupaten Bekasi, Kecamatan Cibitung, Desa Ganda Mekar, setempat dikenal sebagai Mega Mall MM.2100 Blok B Nomor 8.</p>

<p>&ndash; Berdasarkan keterangan-keterangan tersebut di atas, kedua belah pihak sepakat membuat perjanjian sewa-menyewa dengan syarat-syarat dan ketentuan-ketentuan sebagai berikut:</p>

<p><b>----------------------- Pasal 1.</b></p>
<p>Perjanjian sewa-menyewa ini berlangsung untuk jangka waktu 2 (dua) tahun terhitung sejak tanggal ............ sampai dengan tanggal ............</p>
<p>&ndash; Penyerahan Ruko akan dilakukan dalam keadaan kosong/tidak dihuni pada tanggal .................. dengan penyerahan semua kunci-kuncinya.</p>

<p><b>----------------------- Pasal 2.</b></p>
<p>&ndash; Uang kontrak sewa disepakati sebesar Rp. ............ (....................................) untuk 2 (dua) tahun masa sewa.</p>
<p>&ndash; Jumlah uang sewa sebesar Rp. ............ (....................................) tersebut dibayar oleh Pihak Kedua kepada Pihak Pertama pada saat penandatanganan akta ini atau pada tanggal .................. dengan kwitansi tersendiri, dan akta ini berlaku sebagai tanda penerimaan yang sah.</p>

<p><b>----------------------- Pasal 3.</b></p>
<p>&ndash; Pihak Kedua hanya akan menggunakan yang disewakan dalam akta ini sebagai tempat kegiatan perkantoran/usaha.</p>
<p>&ndash; Jika diperlukan, Pihak Pertama memberikan surat rekomendasi/keterangan yang diperlukan Pihak Kedua sepanjang tidak melanggar hukum.</p>
<p>&ndash; Pihak Kedua wajib mentaati peraturan-peraturan pihak yang berwajib dan menjamin Pihak Pertama tidak mendapat teguran/tuntutan apapun karenanya.</p>

<p><b>----------------------- Pasal 4.</b></p>
<p>&ndash; Hanya dengan persetujuan tertulis Pihak Pertama, Pihak Kedua boleh mengadakan perubahan/penambahan pada bangunan; seluruh biaya dan tanggung jawab pada Pihak Kedua, dan pada akhir masa kontrak menjadi hak Pihak Pertama.</p>
<p>&ndash; Penyerahan nyata dari yang disewakan oleh Pihak Pertama kepada Pihak Kedua dilakukan pada tanggal .................. dengan penyerahan semua kunci-kunci.</p>

<p><b>----------------------- Pasal 5.</b></p>
<p>Pihak Pertama memberi izin kepada Pihak Kedua untuk pemasangan/penambahan antara lain:</p>
<ul style="margin-left:18px">
  <li>Sekat-sekat pada ruangan;</li>
  <li>Antena radio/CD;</li>
  <li>Line telepon;</li>
  <li>Air Conditioner (AC);</li>
  <li>Penambahan daya listrik;</li>
  <li>Saluran fax;</li>
  <li>Internet;</li>
  <li>TV Kabel;</li>
  <li>Shower;</li>
  <li>Penggantian W/C;</li>
  <li>Katrol pengangkut barang lantai 1–3;</li>
  <li>Peralatan keamanan;</li>
  <li>Peralatan pendukung usaha (rak/mesin) tanpa merusak struktur bangunan.</li>
</ul>
<p>&ndash; Setelah masa kontrak berakhir, Pihak Kedua mengembalikan seperti keadaan semula dengan biaya Pihak Kedua.</p>
<p>&ndash; Pihak Kedua boleh mengganti kunci ruangan di dalam bangunan (kecuali pintu utama); pada akhir masa kontrak, kunci-kunci diserahkan ke Pihak Pertama.</p>
<p>&ndash; Pihak Pertama menjamin yang disewakan adalah miliknya dan bebas dari tuntutan pihak lain.</p>
<p>&ndash; Selama masa sewa, Pihak Pertama boleh memeriksa bangunan sewaktu-waktu.</p>

<p><b>----------------------- Pasal 6.</b></p>
<p>&ndash; Selama masa kontrak, pembayaran langganan listrik/air/telepon dan kewajiban lain terkait pemakaian dibayar Pihak Kedua hingga bulan terakhir dengan bukti pembayaran setiap bulan.</p>
<p>&ndash; Pihak Pertama membayar Pajak Bumi dan Bangunan (PBB) untuk objek sewa.</p>

<p><b>----------------------- Pasal 7.</b></p>
<p>&ndash; Pihak Kedua wajib memelihara yang disewa dengan baik; kerusakan karena kelalaian diperbaiki atas biaya Pihak Kedua.</p>
<p>&ndash; Apabila terjadi force majeure (kebakaran—kecuali kelalaian Pihak Kedua—sabotase, badai, banjir, gempa) sehingga objek musnah, para pihak dibebaskan dari tuntutan.</p>

<p><b>----------------------- Pasal 8.</b></p>
<p>&ndash; Pihak Pertama menjamin tidak ada tuntutan atau gangguan dari pihak lain atas yang disewa selama kontrak.</p>

<p><b>----------------------- Pasal 9.</b></p>
<p>Pihak Kedua, dengan persetujuan tertulis Pihak Pertama, boleh mengalihkan/memindahkan hak kontrak pada pihak lain, sebagian maupun seluruhnya, selama masa kontrak berlaku.</p>

<p><b>----------------------- Pasal 10.</b></p>
<p>Pihak Kedua wajib memberi pemberitahuan mengenai berakhir/akan diperpanjangnya kontrak kepada Pihak Pertama selambat-lambatnya 2 (dua) bulan sebelum berakhir.</p>

<p><b>----------------------- Pasal 11.</b></p>
<p>Pada saat berakhirnya kontrak dan tidak ada perpanjangan, Pihak Kedua menyerahkan kembali objek sewa dalam keadaan kosong, terpelihara baik, dengan semua kunci pada tanggal ..................</p>
<p>Apabila terlambat, Pihak Kedua dikenakan denda sebesar Rp. 27.500,- per hari selama 7 (tujuh) hari pertama; jika masih tidak diserahkan, Pihak Kedua memberi kuasa kepada Pihak Pertama (dengan hak substitusi) untuk melakukan pengosongan dengan bantuan pihak berwajib, atas biaya dan risiko Pihak Kedua.</p>

<p><b>----------------------- Pasal 12.</b></p>
<p>Selama masa kontrak belum berakhir, perjanjian ini tidak berakhir karena:</p>
<ul style="margin-left:18px">
  <li>Meninggalnya salah satu pihak;</li>
  <li>Pihak Pertama mengalihkan hak milik atas objek sewa kepada pihak lain;</li>
  <li>Dalam hal salah satu pihak meninggal dunia, ahli waris/penggantinya wajib melanjutkan perjanjian sampai berakhir; pemilik baru tunduk pada seluruh ketentuan akta ini.</li>
</ul>

<p><b>----------------------- Pasal 13.</b></p>
<p>Untuk menjamin pembayaran listrik, air, telepon, keamanan, dan kewajiban lain bulan terakhir, Pihak Kedua menyerahkan uang jaminan sebesar Rp. 2.000.000,- (dua juta rupiah) pada saat penyerahan kunci, dengan kwitansi tersendiri. Kelebihan dikembalikan Pihak Pertama; kekurangan ditambah oleh Pihak Kedua.</p>

<p><b>----------------------- Pasal 14.</b></p>
<p>Hal-hal yang belum cukup diatur akan dibicarakan kemudian secara musyawarah untuk mufakat.</p>

<p><b>----------------------- Pasal 15.</b></p>
<p>Pajak-pajak yang mungkin ada terkait akta ini dibayar oleh Pihak Kedua untuk dan atas nama Pihak Pertama.</p>

<p><b>----------------------- Pasal 16.</b></p>
<p>Biaya-biaya yang berkaitan dengan akta ini dibayar dan menjadi tanggungan Pihak Pertama.</p>

<p><b>----------------------- Pasal 17.</b></p>
<p>Kedua belah pihak memilih domisili hukum yang sah di Kepaniteraan Pengadilan Negeri Bekasi.</p>

<p><b>DEMIKIAN AKTA INI</b></p>
<p>&ndash; Dibuat dan diresmikan di Bekasi pada hari dan tanggal sebagaimana awal akta ini, dengan dihadiri oleh:</p>
<ol style="margin-left:18px">
  <li>Nyonya ........................................</li>
  <li>Nyonya ........................................</li>
</ol>
<p>Keduanya Karyawan Kantor Notaris, sebagai saksi-saksi.</p>
<p>&ndash; Setelah akta ini dibacakan oleh saya, Notaris, kepada para penghadap dan para saksi, maka segera ditandatangani oleh para penghadap, para saksi, dan saya, Notaris.</p>
<hr style="margin:24px 0;border:0;border-top:1px solid #000" />
`;
