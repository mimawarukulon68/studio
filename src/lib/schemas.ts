
import { z } from 'zod';

export const pendidikanOptionsParentList = ["Tidak sekolah", "Putus SD", "SD Sederajat", "SMP Sederajat", "SMA Sederajat", "D1", "D2", "D3", "D4/S1", "S2", "S3"] as const;
export const pekerjaanOptionsList = ["Tidak bekerja", "Nelayan", "Petani", "Peternak", "PNS/TNI/POLRI", "Karyawan Swasta", "Pedagang Kecil", "Pedagang Besar", "Wiraswasta", "Buruh", "Pensiunan", "Lainnya"] as const;
export const penghasilanOptionsList = ["Kurang dari 500.000", "500.000 - 999.999", "1.000.000 - 1.999.999", "2.000.000 - 4.999.999", "5.000.000 - 20.000.000", "Lebih dari 20.000.000", "Tidak Berpenghasilan"] as const;

const numberPreprocess = (val: unknown) => {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === "") return undefined;
    const num = Number(trimmed);
    return isNaN(num) ? val : num; // Keep original string if not a number, Zod will catch type error
  }
  if (typeof val === 'number') return val;
  return undefined;
};

const parentSharedFields = {
  nik: z.string().optional().refine(val => !val || val.length === 16, { message: "NIK harus 16 digit angka" }).refine(val => !val || /^\d+$/.test(val), { message: "NIK harus berupa angka" }),
  tahunLahir: z.preprocess(
    numberPreprocess,
    z.number({ invalid_type_error: "Tahun lahir harus angka" }).int().min(1900, "Minimal tahun 1900").max(new Date().getFullYear(), `Maksimal tahun ${new Date().getFullYear()}`).optional()
  ),
  pendidikan: z.enum(pendidikanOptionsParentList).optional().nullable(),
  // pendidikanLainnya is removed as per prompt for parents
  pekerjaan: z.enum(pekerjaanOptionsList).optional().nullable(),
  pekerjaanLainnya: z.string().optional(),
  penghasilan: z.enum(penghasilanOptionsList).optional().nullable(),
};

type ParentSharedRefinementData = {
  pekerjaan?: (typeof pekerjaanOptionsList)[number] | null;
  pekerjaanLainnya?: string;
};

const parentSharedRefinement = (data: ParentSharedRefinementData, ctx: z.RefinementCtx) => {
  if (data.pekerjaan === "Lainnya" && (!data.pekerjaanLainnya || data.pekerjaanLainnya.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Detail pekerjaan lainnya wajib diisi jika memilih 'Lainnya'",
      path: ["pekerjaanLainnya"],
    });
  }
};

const requiredParentSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  ...parentSharedFields
}).superRefine(parentSharedRefinement);

const optionalParentSchema = z.object({
  nama: z.string().optional(),
  ...parentSharedFields
}).superRefine(parentSharedRefinement)
 .refine(data => { // Wali data is optional, but if NIK is present, nama must be too.
    if (data.nik && (!data.nama || data.nama.trim() === "")) {
        return false;
    }
    return true;
 }, {
    message: "Nama Wali wajib diisi jika NIK Wali diisi.",
    path: ["nama"],
 });


export const registrationSchema = z.object({
  // Langkah 1: Identitas Peserta Didik
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  namaPanggilan: z.string().min(1, "Nama panggilan wajib diisi"),
  jenisKelamin: z.enum(["Laki-laki", "Perempuan"], { required_error: "Jenis kelamin wajib dipilih" }),
  nisn: z.string().optional().refine(val => !val || val.length === 10, { message: "NISN harus 10 digit angka" }).refine(val => !val || /^\d+$/.test(val), { message: "NISN harus berupa angka" }),
  nikSiswa: z.string().optional().refine(val => !val || val.length === 16, { message: "NIK harus 16 digit angka" }).refine(val => !val || /^\d+$/.test(val), { message: "NIK harus berupa angka" }),
  tempatLahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggalLahir: z.date({ required_error: "Tanggal lahir wajib diisi", invalid_type_error: "Format tanggal lahir tidak valid" }),
  agama: z.enum(["Islam", "Kristen/Protestan", "Katolik", "Hindu", "Budha", "Khonghucu", "Lainnya"], { required_error: "Agama wajib dipilih" }),
  agamaLainnya: z.string().optional(),
  anakKe: z.preprocess(numberPreprocess, z.number({ required_error: "Anak keberapa wajib diisi", invalid_type_error: "Anak keberapa harus angka" }).int().min(1, "Anak keberapa minimal 1")),
  jumlahSaudaraKandung: z.preprocess(numberPreprocess, z.number({ required_error: "Jumlah saudara wajib diisi", invalid_type_error: "Jumlah saudara harus angka" }).int().min(0, "Jumlah saudara minimal 0")),
  alamatJalan: z.string().min(1, "Alamat jalan wajib diisi"),
  rtRw: z.string().min(1, "RT/RW wajib diisi").regex(/^\d{1,3}\/\d{1,3}$/, "Format RT/RW salah (contoh: 001/002)"),
  dusun: z.string().min(1, "Dusun wajib diisi"),
  desaKelurahan: z.string().min(1, "Desa/Kelurahan wajib diisi"),
  kecamatan: z.string().min(1, "Kecamatan wajib diisi"),
  kodePos: z.string().min(1, "Kode pos wajib diisi").length(5, "Kode pos harus 5 digit").regex(/^\d{5}$/, "Kode Pos harus 5 digit angka"),
  tempatTinggal: z.enum(["Bersama orang tua", "Wali", "Kos", "Asrama", "Panti Asuhan", "Lainnya"], { required_error: "Tempat tinggal wajib dipilih" }),
  tempatTinggalLainnya: z.string().optional(),
  modaTransportasi: z.array(z.string()).min(1, "Pilih minimal satu moda transportasi"),
  modaTransportasiLainnya: z.string().optional(),

  // Langkah 2: Data Ayah Kandung
  ayah: requiredParentSchema,

  // Langkah 3: Data Ibu Kandung
  ibu: requiredParentSchema,

  // Langkah 4: Data Wali
  wali: optionalParentSchema.optional(),

  // Langkah 5: Kontak yang Bisa Dihubungi
  nomorTeleponAyah: z.string().optional()
    .refine(val => !val || (val.startsWith("+62") && val.length >= 11 && val.length <= 15 && /^\+62\d+$/.test(val)), { message: "Format nomor Ayah salah (contoh: +6281234567890)" }),
  nomorTeleponIbu: z.string().optional()
    .refine(val => !val || (val.startsWith("+62") && val.length >= 11 && val.length <= 15 && /^\+62\d+$/.test(val)), { message: "Format nomor Ibu salah (contoh: +6281234567890)" }),
  nomorTeleponWali: z.string().optional()
    .refine(val => !val || (val.startsWith("+62") && val.length >= 11 && val.length <= 15 && /^\+62\d+$/.test(val)), { message: "Format nomor Wali salah (contoh: +6281234567890)" }),

}).superRefine((data, ctx) => {
  if (data.agama === "Lainnya" && (!data.agamaLainnya || data.agamaLainnya.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Detail agama lainnya wajib diisi jika memilih 'Lainnya'",
      path: ["agamaLainnya"],
    });
  }
  if (data.tempatTinggal === "Lainnya" && (!data.tempatTinggalLainnya || data.tempatTinggalLainnya.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Detail tempat tinggal lainnya wajib diisi jika memilih 'Lainnya'",
      path: ["tempatTinggalLainnya"],
    });
  }
  if (data.modaTransportasi.includes("lainnya") && (!data.modaTransportasiLainnya || data.modaTransportasiLainnya.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Detail moda transportasi lainnya wajib diisi jika memilih 'Lainnya'",
      path: ["modaTransportasiLainnya"],
    });
  }
  if (!data.nomorTeleponAyah && !data.nomorTeleponIbu && !data.nomorTeleponWali) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Minimal satu nomor telepon (Ayah, Ibu, atau Wali) wajib diisi.",
      path: ["nomorTeleponAyah"], // Anchor error to one field for now
    });
  }
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// Options for selects/checkboxes
export const jenisKelaminOptions = ["Laki-laki", "Perempuan"] as const;
export const agamaOptionsList = ["Islam", "Kristen/Protestan", "Katolik", "Hindu", "Budha", "Khonghucu", "Lainnya"] as const;
export const tempatTinggalOptionsList = ["Bersama orang tua", "Wali", "Kos", "Asrama", "Panti Asuhan", "Lainnya"] as const;
export const modaTransportasiOptions = [
  { id: "jalan_kaki", label: "Jalan kaki" },
  { id: "kendaraan_pribadi", label: "Kendaraan pribadi" },
  { id: "kendaraan_umum_angkot", label: "Kendaraan umum/angkot" },
  { id: "jemputan_sekolah", label: "Jemputan sekolah" },
  { id: "lainnya", label: "Lainnya" },
] as const;
