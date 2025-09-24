// utils/deedTemplate.js
export function toSnake(s) {
  return String(s || "")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase();
}

const safe = (v, fallback = "-") =>
  v === undefined || v === null || v === "" ? fallback : v;

export function formatDateID(dateLike) {
  if (!dateLike) return "-";
  const d = new Date(dateLike);
  if (isNaN(d)) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function sortParties(activity) {
  const parties = Array.isArray(activity?.clients) ? activity.clients : [];
  const orders = new Map(
    (activity?.client_activities || []).map((ca) => [
      String(ca.user_id),
      ca.order ?? 999,
    ])
  );
  return parties
    .map((u) => ({ ...u, __order: orders.get(String(u.id)) ?? 999 }))
    .sort((a, b) => a.__order - b.__order || a.id - b.id);
}

export function buildPartiesTableHTML(parties) {
  if (!parties.length) return "<p>-</p>";

  const rows = parties
    .map((p, i) => {
      const idn = p.identity || {};
      return `
      <tr>
        <td style="text-align:center">${i + 1}</td>
        <td style="text-align:center">${safe(p.name)}</td>
        <td style="text-align:center">${safe(idn.ktp)}</td>
        <td style="text-align:center">${safe(p.address)}</td>
        <td style="text-align:center">${safe(p.city)}</td>
        <td style="text-align:center">${safe(p.province)}</td>
      </tr>
    `;
    })
    .join("");

  return `
  <table class="parties-table" border="1" cellspacing="0" cellpadding="6"
         style="border-collapse:collapse;font-size:12px;width:100%;margin:0">
    <thead>
      <tr>
        <th style="text-align:center">No</th>
        <th style="text-align:center">Nama</th>
        <th style="text-align:center">NIK</th>
        <th style="text-align:center">Alamat</th>
        <th style="text-align:center">Kota</th>
        <th style="text-align:center">Provinsi</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
`;
}

// Blok tanda tangan (DOMPDF-safe, tanpa grid/flex)
export function buildSignaturesBlockHTML(activity, opts = {}) {
  const {
    partyCols = "auto", // 1..3 kolom untuk penghadap
    boxHeight = 0, // tinggi area ttd
    gap = 12, // jarak antar kolom/baris (px)
    showDatePlace = true,
    headingLeft = "Penghadap",
    headingRight = "Notaris",
  } = opts;

  const parties = sortParties(activity);
  const cols =
    partyCols === "auto"
      ? Math.max(1, Math.min(3, parties.length || 1))
      : Math.max(1, parseInt(partyCols, 10) || 1);

  // tempat & tanggal
  const schedule = Array.isArray(activity?.schedules)
    ? activity.schedules[0]
    : null;
  const place =
    safe(schedule?.place) !== "-"
      ? schedule.place
      : safe(activity?.notaris?.city) !== "-"
      ? activity.notaris.city
      : "";
  const dateStr = schedule?.datetime
    ? formatDateID(schedule.datetime)
    : formatDateID(new Date());

  const notaryName = safe(activity?.notaris?.name);

  // kotak tanda tangan sederhana (tanpa flex/grid)
  const signBox = (label) => `
    <div style="text-align:center; height:${boxHeight}px;">
      <div style="height:${Math.max(boxHeight - 28, 40)}px;"></div>
      <div style="border-bottom:1px solid #000; width:90%; margin:0 auto 6px;"></div>
      <div style="font-size:12px; font-weight:bold;">${safe(label)}</div>
    </div>
  `;

  // helper pecah array jadi baris2 kolom
  const chunk = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  // list nama penghadap
  const partyNames = parties.length
    ? parties.map((p) => p.name || p.email || "-")
    : ["-"];

  // baris-baris penghadap (pakai table)
  const rows = chunk(partyNames, cols)
    .map(
      (row) => `
    <tr>
      ${row
        .map(
          (name) => `
        <td style="vertical-align:top; padding:${Math.floor(
          gap / 2
        )}px;">${signBox(name)}</td>
      `
        )
        .join("")}
      ${
        row.length < cols
          ? `<td colspan="${cols - row.length}" style="padding:${Math.floor(
              gap / 2
            )}px;"></td>`
          : ""
      }
    </tr>
  `
    )
    .join("");

  // dua kolom: kiri penghadap (sub-tabel), kanan notaris
  const tableTwoCols = `
    <table style="width:100%; border-collapse:separate; border-spacing:${gap}px ${gap}px;">
      <tr>
        <td style="vertical-align:top; width:${100 - 35}%; padding:0;">
          <div style="text-align:center; font-weight:600; margin-bottom:8px;">${safe(
            headingLeft
          )}
          </div>
          <table style="width:100%; border-collapse:separate; border-spacing:${gap}px;">
            ${rows}
          </table>
          </td>
        <td style="vertical-align:top; width:35%; padding:0;">
          <div style="text-align:center; font-weight:600; margin-bottom:8px;">${safe(
            headingRight
          )}</div>
          <table style="width:100%; border-collapse:separate; border-spacing:${gap}px; padding-top:30px;">
            ${signBox(notaryName)}
          </table>
        </td>
      </tr>
    </table>
  `;

  const dateLine =
    showDatePlace && (place || dateStr)
      ? `<div style="text-align:right; margin-bottom:10px;">${
          place ? safe(place) + ", " : ""
        }${dateStr}</div>`
      : "";

  return `
    <div style="margin-top:24px;">
      ${dateLine}
      ${tableTwoCols}
    </div>
  `;
}

export function buildTokenMap(activity) {
  const map = {};

  // ===== Global
  map.activity_code = safe(activity?.tracking_code);
  map.activity_name = safe(activity?.name);
  map.deed_name = safe(activity?.deed?.name);
  map.reference_number = safe(activity?.draft?.reference_number);
  map.today = formatDateID(new Date());

  const sched = (activity?.schedules || [])[0];
  map.schedule_datetime = sched?.datetime ? formatDateID(sched.datetime) : "-";
  map.schedule_place = safe(sched?.place);
  map.schedule_note = safe(sched?.note);

  // ===== Notaris (profil + identity)
  const nt = activity?.notaris || {};
  const ntId = nt?.identity || {};

  map.notaris_name = safe(nt.name);
  map.notaris_email = safe(nt.email);
  map.notaris_telepon = safe(nt.telepon);
  map.notaris_gender = safe(nt.gender);
  map.notaris_address = safe(nt.address);
  map.notaris_city = safe(nt.city);
  map.notaris_province = safe(nt.province);
  map.notaris_postal_code = safe(nt.postal_code);

  map.notaris_nik = safe(ntId.ktp);
  map.notaris_npwp = safe(ntId.npwp);
  map.notaris_ktp_notaris = safe(ntId.ktp_notaris);

  map.notaris_file_ktp = safe(ntId.file_ktp);
  map.notaris_file_kk = safe(ntId.file_kk);
  map.notaris_file_npwp = safe(ntId.file_npwp);
  map.notaris_file_ktp_notaris = safe(ntId.file_ktp_notaris);
  map.notaris_file_sign = safe(ntId.file_sign);
  map.notaris_file_photo = safe(ntId.file_photo);
  map.notaris_file_avatar = safe(nt.file_avatar);

  // ===== Parties (urut by client_activities.order)
  const parties = sortParties(activity);
  parties.forEach((p, idx) => {
    const n = idx + 1;
    const idn = p.identity || {};
    map[`penghadap${n}_name`] = safe(p.name);
    map[`penghadap${n}_email`] = safe(p.email);
    map[`penghadap${n}_telepon`] = safe(p.telepon);
    map[`penghadap${n}_address`] = safe(p.address);
    map[`penghadap${n}_city`] = safe(p.city);
    map[`penghadap${n}_province`] = safe(p.province);
    map[`penghadap${n}_postal_code`] = safe(p.postal_code);
    map[`penghadap${n}_gender`] = safe(p.gender);

    map[`penghadap${n}_nik`] = safe(idn.ktp);
    map[`penghadap${n}_npwp`] = safe(idn.npwp);
    map[`penghadap${n}_ktp_notaris`] = safe(idn.ktp_notaris);
  });

  // ===== Document Requirements (dukung 3 varian key agar tahan banting)
  const reqsRaw =
    activity?.document_requirements ??
    activity?.documentRequirements ??
    activity?.documentrequirements ??
    [];
  const reqs = Array.isArray(reqsRaw) ? reqsRaw : [];

  const partyIndexByUser = new Map(
    sortParties(activity).map((p, i) => [p.id, i + 1])
  );

  for (const r of reqs) {
    const idx = partyIndexByUser.get(r.user_id);
    if (!idx) continue;
    const key = `penghadap${idx}_req_${toSnake(r.requirement_name)}`;
    map[key] = safe(r.file ?? r.value);
  }

  // ===== Table siap pakai
  map.parties_table = buildPartiesTableHTML(parties);

  map.signatures_block = buildSignaturesBlockHTML(activity, {
    partyCols: 2, // ubah sesuai selera
    witnessCount: 2,
    boxHeight: 80,
    showDatePlace: true,
  });

  return map;
}

// utils/deedTemplate.js

export function replaceTokens(template, tokenMap, opts = {}) {
  if (!template) return "";
  const { allowSingle = true } = opts; // biar kompatibel template lama

  const replacer = (_m, key) =>
    Object.prototype.hasOwnProperty.call(tokenMap, key)
      ? tokenMap[key] ?? "-"
      : _m; // biarkan apa adanya kalau gak dikenal

  // 1) utamakan {{token}}
  let out = template.replace(/\{\{\s*([\w]+)\s*\}\}/g, replacer);

  // 2) (opsional) kompatibel {token} lama
  if (allowSingle) {
    out = out.replace(/\{([\w]+)\}/g, replacer);
  }

  return out;
}
