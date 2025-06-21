
import { z } from 'zod';
import { format, isValid, parse } from 'date-fns';

// Unified pendidikan options, including "Lainnya"
export const pendidikanOptionsList = ["Tidak sekolah", "Putus SD", "SD Sederajat", "SMP Sederajat", "SMA Sederajat", "D1", "D2", "D3", "D4/S1", "S2", "S3", "Lainnya"] as const;

export const pekerjaanOptionsList = ["Tidak bekerja", "Nelayan", "Petani", "Peternak", "PNS/TNI/POLRI", "Karyawan Swasta", "Pedagang Kecil", "Pedagang Besar", "Wiraswasta", "Wirausaha", "Buruh", "Pensiunan", "Meninggal Dunia", "Lainnya"] as const;
export const penghasilanOptionsList = ["Kurang dari 500.000", "500.000 - 999.999", "1.000.000 - 1.999.999", "2.000.000 - 4.999.999", "5.000.000 - 20.000.000", "Lebih dari 20.000.000", "Tidak Berpenghasilan"] as const;

const numberPreprocess = (val: unknown) => {
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed === "") return undefined;
    const num = Number(trimmed);
    return isNaN(num) ? val : num;
  }
  if (typeof val === 'number') return val;
  return undefined;
};

type ParentRefinementData = {
  pendidikan?: (typeof pendidikanOptionsList)[number] | null;
  pendidikanLainnya?: string;
  pekerjaan?: (typeof pekerjaanOptionsList)[number] | null;
  pekerjaanLainnya?: string;
};

const parentSharedRefinement = (data: ParentRefinementData, ctx: z.RefinementCtx) => {
  if (data.pendidikan === "Lainnya" && (!data.pendidikanLainnya || data.pendidikanLainnya.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Detail pendidikan lainnya wajib diisi jika memilih 'Lainnya'",
      path: ["pendidikanLainnya"],
    });
  }
  if (data.pekerjaan === "Lainnya" && (!data.pekerjaanLainnya || data.pekerjaanLainnya.trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Detail pekerjaan lainnya wajib diisi jika memilih 'Lainnya'",
      path: ["pekerjaanLainnya"],
    });
  }
};

const parentSharedFields = {
  nik: z.string().optional().refine(val => !val || val.length === 16, { message: "NIK harus 16 digit angka" }).refine(val => !val || /^\d+$/.test(val), { message: "NIK harus berupa angka" }),
  tahunLahir: z.preprocess(
    numberPreprocess,
    z.number({ invalid_type_error: "Tahun lahir harus angka" }).int().min(1900, "Minimal tahun 1900").max(new Date().getFullYear(), `Maksimal tahun ${new Date().getFullYear()}`).optional()
  ),
  pendidikan: z.enum(pendidikanOptionsList).optional().nullable(),
  pendidikanLainnya: z.string().optional(),
  pekerjaan: z.enum(pekerjaanOptionsList).optional().nullable(),
  pekerjaanLainnya: z.string().optional(),
  penghasilan: z.enum(penghasilanOptionsList).optional().nullable(),
};

export const requiredParentSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  ...parentSharedFields
}).superRefine(parentSharedRefinement);


export const registrationSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  namaPanggilan: z.string().min(1, "Nama panggilan wajib diisi"),
  jenisKelamin: z.enum(["Laki-laki", "Perempuan"], { required_error: "Jenis kelamin wajib dipilih" }),
  nisn: z.string().min(1, "NISN wajib diisi").length(10, { message: "NISN harus 10 digit angka" }).regex(/^\d+$/, { message: "NISN harus berupa angka" }),
  nikSiswa: z.string().min(1, "NIK wajib diisi").length(16, { message: "NIK harus 16 digit angka" }).regex(/^\d+$/, { message: "NIK harus berupa angka" }),
  tempatLahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggalLahir: z.string().min(1, "Tanggal lahir wajib diisi")
    .refine((val) => {
      const parsed = parse(val, 'dd/MM/yyyy', new Date());
      return isValid(parsed) && format(parsed, 'dd/MM/yyyy') === val;
    }, {
      message: "Format tanggal lahir tidak valid (DD/MM/YYYY)",
    }),
  agama: z.enum(["Islam", "Kristen/Protestan", "Katolik", "Hindu", "Budha", "Khonghucu", "Lainnya"], { required_error: "Agama wajib dipilih" }),
  agamaLainnya: z.string().optional(),
  anakKe: z.preprocess(numberPreprocess, z.number({ required_error: "Anak keberapa wajib diisi", invalid_type_error: "Anak keberapa harus angka" }).int().min(1, "Anak keberapa minimal 1")),
  jumlahSaudaraKandung: z.preprocess(numberPreprocess, z.number({ required_error: "Jumlah saudara wajib diisi", invalid_type_error: "Jumlah saudara harus angka" }).int().min(0, "Jumlah saudara minimal 0")),
  
  tempatTinggal: z.enum(["Bersama orang tua", "Wali", "Kos", "Asrama", "Panti Asuhan", "Lainnya"], { required_error: "Tempat tinggal wajib dipilih" }),
  tempatTinggalLainnya: z.string().optional(),
  provinsi: z.string().min(1, "Provinsi wajib diisi"),
  kabupaten: z.string().min(1, "Kabupaten/Kota wajib diisi"),
  kecamatan: z.string().min(1, "Kecamatan wajib diisi"),
  desaKelurahan: z.string().min(1, "Desa/Kelurahan wajib diisi"),
  dusun: z.string().optional(),
  rtRw: z.string().min(1, "RT/RW wajib diisi").regex(/^\d{1,3}\/\d{1,3}$/, "Format RT/RW salah (contoh: 001/002)"),
  alamatJalan: z.string().optional(),
  kodePos: z.string().min(1, "Kode pos wajib diisi").length(5, "Kode pos harus 5 digit").regex(/^\d{5}$/, "Kode Pos harus 5 digit angka"),
  
  modaTransportasi: z.array(z.string()).min(1, "Pilih minimal satu moda transportasi"),
  modaTransportasiLainnya: z.string().optional(),

  ayah: requiredParentSchema,
  ibu: requiredParentSchema,
  wali: requiredParentSchema,

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
      path: ["nomorTeleponAyah"], 
    });
  }
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export const jenisKelaminOptions = ["Laki-laki", "Perempuan"] as const;
export const agamaOptionsList = ["Islam", "Kristen/Protestan", "Katolik", "Hindu", "Budha", "Khonghucu", "Lainnya"] as const;
export const tempatTinggalOptionsList = ["Bersama orang tua", "Wali", "Kos", "Asrama", "Panti Asuhan", "Lainnya"] as const;
export const modaTransportasiOptions = [
  { id: "jalan_kaki", label: "Jalan Kaki" },
  { id: "bersepeda", label: "Bersepeda" },
  { id: "kendaraan_bermotor", label: "Kendaraan Bermotor" },
  { id: "kendaraan_umum_angkot", label: "Kendaraan Umum/Angkot" },
  { id: "jemputan_sekolah", label: "Jemputan Sekolah" },
  { id: "lainnya", label: "Lainnya" },
] as const;
