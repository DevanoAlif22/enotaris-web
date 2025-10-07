export const defaultPdfOptions = {
  page_size: "A4",
  orientation: "portrait",
  margins_mm: { top: 20, right: 20, bottom: 20, left: 20 },
  font_family: "times",
  font_size_pt: 12,
  show_page_numbers: false,
  page_number_h_align: "right",
  page_number_v_align: "bottom",
};

export const labelPdfSummary = (opt) =>
  `${opt.page_size} • ${opt.orientation} • ${opt.font_family} • ${opt.font_size_pt}pt`;
