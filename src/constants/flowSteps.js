import {
  CalendarDaysIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

export const STEPS = [
  {
    id: "invite",
    title: "Undang Penghadap",
    icon: UserGroupIcon,
    description: "Kirim undangan kepada para pihak.",
  },
  {
    id: "respond",
    title: "Persetujuan Penghadap",
    icon: CheckCircleSolid,
    description: "Pantau persetujuan undangan.",
  },
  {
    id: "docs",
    title: "Pengisian Data & Dokumen",
    icon: DocumentTextIcon,
    description: "Unggah/isi data & persyaratan.",
  },
  {
    id: "draft",
    title: "Draft Akta",
    icon: DocumentTextIcon,
    description: "Susun/unggah draft akta.",
  },
  {
    id: "schedule",
    title: "Penjadwalan Pembacaan",
    icon: CalendarDaysIcon,
    description: "Atur jadwal pembacaan akta.",
  },
  {
    id: "sign",
    title: "Tanda Tangan",
    icon: CheckCircleSolid,
    description: "Proses tanda tangan.",
  },
  {
    id: "print",
    title: "Cetak Akta",
    icon: DocumentTextIcon,
    description: "Finalisasi & cetak akta.",
  },
];
