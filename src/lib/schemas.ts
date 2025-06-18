import { z } from 'zod';

export const pendidikanOptionsList = ["Tidak sekolah", "Putus SD", "SD Sederajat", "SMP Sederajat", "SMA Sederajat", "D1", "D2", "D3", "D4/S1", "S2", "S3"] as const;
export const pekerjaanOptionsList = ["Tidak bekerja", "Nelayan", "Petani", "Peternak", "PNS/TNI/POLRI", "Karyawan Swasta", "Pedagang Kecil", "Pedagang Besar", "Wiraswasta", "Buruh", "Pensiunan", "Lainnya"] as const; // Added more options
export const penghasilanOptionsList = ["Kurang dari 500.000", "500.000 - 999.999", "1.000.000 - 1.999.999", "2.000.000 - 4.999.999", "5.000.000 - 20.000.000", "Lebih dari 20.000.000", "Tidak Berpenghasilan"] as const; // Adjusted ranges and added option

const numberPreprocess = (val: unknown) => String(val).trim() === "" ? undefined : Number(val);

const parentBaseSchema = z.object({
  nik: z.string().optional().refine(val => !val || val.length === 16, { message: "NIK harus 16 digit angka" }).refine(val => !val || /^\d+$/.test(val), { message: "NIK harus berupa angka" }),
  tahunLahir: z.preprocess(
    numberPreprocess,
    z.number({ invalid_type_error: "Tahun lahir harus angka" }).int().min(1900, "Minimal tahun 1900").max(new Date().getFullYear(), `Maksimal tahun ${new Date().getFullYear()}`).optional()
  ),
  pendidikan: z.enum(pendidikanOptionsList).optional().nullable(),
  pekerjaan: z.enum(pekerjaanOptionsList).optional().nullable(),
  penghasilan: z.enum(penghasilanOptionsList).optional().nullable(),
});

const requiredParentSchema = parentBaseSchema.extend({
  nama: z.string().min(1, "Nama wajib diisi"),
});

const optionalParentSchema = parentBaseSchema.extend({
  nama: z.string().optional(),
});


export const registrationSchema = z.object({
  // Identitas Peserta Didik
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  namaPanggilan: z.string().min(1, "Nama panggilan wajib diisi"),
  jenisKelamin: z.enum(["Laki-laki", "Perempuan"], { required_error: "Jenis kelamin wajib dipilih" }),
  nisn: z.string().optional().refine(val => !val || val.length === 10, { message: "NISN harus 10 digit angka" }).refine(val => !val || /^\d+$/.test(val), { message: "NISN harus berupa angka" }),
  nikSiswa: z.string().optional().refine(val => !val || val.length === 16, { message: "NIK harus 16 digit angka" }).refine(val => !val || /^\d+$/.test(val), { message: "NIK harus berupa angka" }),
  tempatLahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggalLahir: z.date({ required_error: "Tanggal lahir wajib diisi", invalid_type_error: "Format tanggal lahir tidak valid" }),
  agama: z.enum(["Islam", "Kristen/Protestan", "Katolik", "Hindu", "Budha", "Khonghucu", "Lainnya"], { required_error: "Agama wajib dipilih" }), // Added "Lainnya"
  anakKe: z.preprocess(numberPreprocess, z.number({ required_error: "Anak keberapa wajib diisi", invalid_type_error: "Anak keberapa harus angka" }).int().min(1, "Anak keberapa minimal 1")),
  jumlahSaudaraKandung: z.preprocess(numberPreprocess, z.number({ required_error: "Jumlah saudara wajib diisi", invalid_type_error: "Jumlah saudara harus angka" }).int().min(0, "Jumlah saudara minimal 0")),
  alamatJalan: z.string().min(1, "Alamat jalan wajib diisi"),
  rtRw: z.string().min(1, "RT/RW wajib diisi").regex(/^\d{1,3}\/\d{1,3}$/, "Format RT/RW salah (contoh: 001/002)"),
  dusun: z.string().min(1, "Dusun wajib diisi"),
  desaKelurahan: z.string().min(1, "Desa/Kelurahan wajib diisi"),
  kecamatan: z.string().min(1, "Kecamatan wajib diisi"),
  kodePos: z.string().min(1, "Kode pos wajib diisi").length(5, "Kode pos harus 5 digit").regex(/^\d{5}$/, "Kode Pos harus 5 digit angka"),
  tempatTinggal: z.enum(["Bersama orang tua", "Wali", "Kos", "Asrama", "Panti Asuhan", "Lainnya"], { required_error: "Tempat tinggal wajib dipilih" }),
  modaTransportasi: z.array(z.string()).min(1, "Pilih minimal satu moda transportasi"),

  ayah: requiredParentSchema,
  ibu: requiredParentSchema,
  wali: optionalParentSchema.optional(),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// Options for selects/checkboxes for direct use in components
export const jenisKelaminOptions = ["Laki-laki", "Perempuan"] as const;
export const agamaOptionsList = ["Islam", "Kristen/Protestan", "Katolik", "Hindu", "Budha", "Khonghucu", "Lainnya"] as const;
export const tempatTinggalOptionsList = ["Bersama orang tua", "Wali", "Kos", "Asrama", "Panti Asuhan", "Lainnya"] as const;
export const modaTransportasiOptions = [
  { id: "jalan_kaki", label: "Jalan kaki" },
  { id: "kendaraan_pribadi", label: "Kendaraan pribadi" },
  { id: "kendaraan_umum_angkot", label: "Kendaraan umum/angkot" },
  { id: "jemputan_sekolah", label: "Jemputan sekolah" },
] as const;
