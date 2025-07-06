
import { z } from 'zod';
import { format, isValid, parse } from 'date-fns';

// Unified pendidikan options, including "Lainnya"
export const pendidikanOptionsList = ["Tidak sekolah", "Putus SD", "SD Sederajat", "SMP Sederajat", "SMA Sederajat", "D1", "D2", "D3", "D4/S1", "S2", "S3", "Lainnya"] as const;
export const pekerjaanOptionsList = ["Tidak bekerja", "Nelayan", "Petani", "Peternak", "PNS/TNI/POLRI", "Karyawan Swasta", "Pedagang Kecil", "Pedagang Besar", "Wiraswasta", "Wirausaha", "Buruh", "Pensiunan", "Lainnya"] as const;
export const penghasilanOptionsList = ["Kurang dari 500.000", "500.000 - 999.999", "1.000.000 - 1.999.999", "2.000.000 - 4.999.999", "5.000.000 - 20.000.000", "Lebih dari 20.000.000", "Tidak Berpenghasilan"] as const;
export const hubunganWaliOptionsList = ["Ayah Kandung", "Ibu Kandung", "Ayah Tiri", "Ibu Tiri", "Kakek", "Nenek", "Paman", "Bibi", "Orang Tua Asuh", "Kerabat Lainnya", "Lainnya (tuliskan)"] as const;


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

// Base fields for any parent figure, all optional.
const parentBaseFields = {
  nik: z.string().optional(),
  tahunLahir: z.preprocess(
    numberPreprocess,
    z.number({ invalid_type_error: "Tahun lahir harus angka" }).int().min(1900, "Minimal tahun 1900").max(new Date().getFullYear(), `Maksimal tahun ${new Date().getFullYear()}`).optional()
  ),
  pendidikan: z.enum(pendidikanOptionsList).optional().nullable(),
  pendidikanLainnya: z.string().optional(),
  pekerjaan: z.union([z.enum([...pekerjaanOptionsList, "Meninggal Dunia"] as const), z.literal('')]).optional().nullable(),
  pekerjaanLainnya: z.string().optional(),
  penghasilan: z.union([z.enum([...penghasilanOptionsList, "Meninggal Dunia"] as const), z.literal('')]).optional().nullable(),
  nomorTelepon: z.string().optional().refine(val => {
    if (!val) return true; // Optional fields are valid if empty
    return /^[1-9]\d{8,11}$/.test(val);
  }, {
      message: "Format nomor salah. Awali dengan 8 (bukan 0) dan berisi 9-12 digit.",
  }),
};

// Schema for Ayah and Ibu with conditional validation
export const parentSchema = z.object({
  isDeceased: z.boolean().default(false),
  nama: z.string().min(1, "Nama wajib diisi"),
  ...parentBaseFields
}).superRefine((data, ctx) => {
  const checkLainnya = (field: 'pendidikan' | 'pekerjaan', lainnyaField: 'pendidikanLainnya' | 'pekerjaanLainnya', message: string) => {
    if (data[field] === "Lainnya" && !(data[lainnyaField] as string)?.trim()) {
      ctx.addIssue({ code: 'custom', message, path: [lainnyaField] });
    }
  };

  if (data.isDeceased) {
    if(data.pekerjaan === "Meninggal Dunia" || data.penghasilan === "Meninggal Dunia") {
      // These are valid states, just check for 'Lainnya' if needed
       checkLainnya('pendidikan', 'pendidikanLainnya', "Detail pendidikan lainnya wajib diisi");
       checkLainnya('pekerjaan', 'pekerjaanLainnya', "Detail pekerjaan lainnya wajib diisi");
    }
  } else {
    // If NOT deceased, all fields below are required.
    if (!data.nik || data.nik.trim().length === 0) {
      ctx.addIssue({ code: 'custom', message: "NIK wajib diisi", path: ['nik'] });
    } else if (!/^\d{16}$/.test(data.nik)) {
      ctx.addIssue({ code: 'custom', message: "NIK harus 16 digit angka", path: ['nik'] });
    }

    if (data.tahunLahir === undefined) ctx.addIssue({ code: 'custom', message: "Tahun lahir wajib diisi", path: ['tahunLahir'] });
    if (!data.pendidikan) ctx.addIssue({ code: 'custom', message: "Pendidikan terakhir wajib diisi", path: ['pendidikan'] });
    if (!data.pekerjaan) ctx.addIssue({ code: 'custom', message: "Pekerjaan utama wajib diisi", path: ['pekerjaan'] });
    if (!data.penghasilan) ctx.addIssue({ code: 'custom', message: "Penghasilan bulanan wajib diisi", path: ['penghasilan'] });

    checkLainnya('pendidikan', 'pendidikanLainnya', "Detail pendidikan lainnya wajib diisi");
    checkLainnya('pekerjaan', 'pekerjaanLainnya', "Detail pekerjaan lainnya wajib diisi");
  }
});

// Schema for Wali, fields are mostly optional unless both parents are deceased.
export const waliSchema = z.object({
  nama: z.string().optional(),
  hubungan: z.enum(hubunganWaliOptionsList).optional().nullable(),
  hubunganLainnya: z.string().optional(),
  ...parentBaseFields,
}).superRefine((data, ctx) => {
  // This refinement is for when the user fills wali data optionally
  if (data.nama) { // Only validate if a name is entered
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
       if (data.hubungan === "Lainnya (tuliskan)" && (!data.hubunganLainnya || data.hubunganLainnya.trim() === "")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Detail hubungan lainnya wajib diisi",
          path: ["hubunganLainnya"],
        });
      }
  }
});

const siswaSchema = z.object({
  namaLengkap: z.string().min(1, "Nama lengkap wajib diisi"),
  namaPanggilan: z.string().min(1, "Nama panggilan wajib diisi"),
  jenisKelamin: z.enum(["Laki-laki", "Perempuan"], { required_error: "Jenis kelamin wajib dipilih" }),
  nisn: z.string().min(1, "NISN wajib diisi").length(10, { message: "NISN harus 10 digit angka" }).regex(/^\d+$/, { message: "NISN harus berupa angka" }),
  nikSiswa: z.string().min(1, "NIK wajib diisi").length(16, { message: "NIK harus 16 digit angka" }).regex(/^\d+$/, { message: "NIK harus berupa angka" }),
  tempatLahir: z.string().min(1, "Tempat lahir wajib diisi"),
  tanggalLahir: z.string({ required_error: "Tanggal lahir wajib diisi" })
    .min(1, { message: "Tanggal lahir wajib diisi" })
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
  rtRw: z.string({ required_error: "RT/RW wajib diisi" }).superRefine((val, ctx) => {
    // Check if the input is effectively empty (null, undefined, empty string, or just mask characters)
    if (!val || val.replace(/\D/g, '').length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "RT/RW wajib diisi",
      });
      return;
    }
    // If not empty, then check the format
    if (!/^\d{1,3}\/\d{1,3}$/.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Format RT/RW salah (contoh: 001/002)",
      });
    }
  }),
  alamatJalan: z.string().optional(),
  kodePos: z.string().min(1, "Kode pos wajib diisi").length(5, "Kode pos harus 5 digit").regex(/^\d{5}$/, "Kode Pos harus 5 digit angka"),
  
  modaTransportasi: z.array(z.string()).min(1, "Pilih minimal satu moda transportasi"),
  modaTransportasiLainnya: z.string().optional(),
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
});


export const registrationSchema = z.object({
  siswa: siswaSchema,
  ayah: parentSchema,
  ibu: parentSchema,
  wali: waliSchema,
}).superRefine((data, ctx) => {
  // Conditional validation for Wali data
  if (data.ayah.isDeceased && data.ibu.isDeceased) {
    if (!data.wali.nama?.trim()) ctx.addIssue({ path: ["wali", "nama"], message: "Nama Wali wajib diisi", code: 'custom' });
    if (!data.wali.hubungan) ctx.addIssue({ path: ["wali", "hubungan"], message: "Hubungan dengan siswa wajib diisi", code: 'custom' });
    if (data.wali.hubungan === "Lainnya (tuliskan)" && !data.wali.hubunganLainnya?.trim()) ctx.addIssue({ path: ["wali", "hubunganLainnya"], message: "Detail hubungan lainnya wajib diisi", code: 'custom' });
    if (!data.wali.nik || !/^\d{16}$/.test(data.wali.nik)) ctx.addIssue({ path: ["wali", "nik"], message: "NIK Wali wajib diisi dan harus 16 digit", code: 'custom' });
    if (!data.wali.tahunLahir) ctx.addIssue({ path: ["wali", "tahunLahir"], message: "Tahun lahir Wali wajib diisi", code: 'custom' });
    if (!data.wali.pendidikan) ctx.addIssue({ path: ["wali", "pendidikan"], message: "Pendidikan Wali wajib diisi", code: 'custom' });
    if (data.wali.pendidikan === "Lainnya" && !data.wali.pendidikanLainnya?.trim()) ctx.addIssue({ path: ["wali", "pendidikanLainnya"], message: "Detail pendidikan lainnya wajib diisi", code: 'custom' });
    if (!data.wali.pekerjaan) ctx.addIssue({ path: ["wali", "pekerjaan"], message: "Pekerjaan Wali wajib diisi", code: 'custom' });
    if (data.wali.pekerjaan === "Lainnya" && !data.wali.pekerjaanLainnya?.trim()) ctx.addIssue({ path: ["wali", "pekerjaanLainnya"], message: "Detail pekerjaan lainnya wajib diisi", code: 'custom' });
    if (!data.wali.penghasilan) ctx.addIssue({ path: ["wali", "penghasilan"], message: "Penghasilan Wali wajib diisi", code: 'custom' });
  }

}).superRefine((data, ctx) => {
    // Phone number validation: at least one phone number must be provided
    if (!data.ayah.nomorTelepon && !data.ibu.nomorTelepon && !data.wali.nomorTelepon) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Minimal satu nomor telepon (Ayah, Ibu, atau Wali) wajib diisi.",
            path: ["root"], // Use a non-specific path
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
export type ModaTransportasiType = typeof modaTransportasiOptions[number]["id"];




    
