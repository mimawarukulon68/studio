
"use client";

import React from "react";
import type { RegistrationFormData } from "@/lib/schemas";
import { format, parse, isValid as isDateValid } from 'date-fns';
import { id as localeID } from 'date-fns/locale/id';

interface FormulirF4Props {
  data: RegistrationFormData | null;
}

// Helper function to safely access nested data
const get = (obj: any, path: string, defaultValue: any = '') => {
  const keys = path.split('.');
  let result = obj;
  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }
  return result === undefined || result === null || result === '' ? defaultValue : result;
};


// Komponen Row (Baris Tabel)
function Row({ label, value, fullWidth = false }: { label: string; value: React.ReactNode; fullWidth?: boolean }) {
  const val = value || "....................................................";
  return (
    <tr>
      <td className="align-top w-[35%] py-0.5">{label}</td>
      <td className="align-top w-2 py-0.5">:</td>
      <td className={`align-top py-0.5 border-b border-dotted border-black ${fullWidth ? 'w-full' : ''}`}>
        {val}
      </td>
    </tr>
  );
}

// Komponen Section
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-bold text-sm uppercase">{title}</h3>
      <div className="border-t border-black mb-1"></div>
      {children}
    </section>
  );
}

export default function FormulirF4({ data }: FormulirF4Props) {
  const d = data || {} as RegistrationFormData; // Use empty object as fallback

  // --- Start of Formatter Logic (will be moved to formatters.ts later) ---
  const formatTtl = () => {
    const tempat = get(d, 'siswa.tempatLahir');
    const tanggalValue = get(d, 'siswa.tanggalLahir');
    if (!tempat && !tanggalValue) return '';

    let tanggalFormatted = '';
    if (tanggalValue) {
      const dateObj = parse(tanggalValue, 'dd/MM/yyyy', new Date());
      if (isDateValid(dateObj)) {
        tanggalFormatted = format(dateObj, 'dd MMMM yyyy', { locale: localeID });
      } else {
        tanggalFormatted = tanggalValue; // fallback to raw value
      }
    }
    return `${tempat || '...................'}, ${tanggalFormatted || '...................'}`;
  };

  const formatAlamat = () => {
    const alamatJalan = get(d, 'siswa.alamatJalan');
    const dusun = get(d, 'siswa.dusun');
    const rtRw = get(d, 'siswa.rtRw');
    const desaKelurahan = get(d, 'siswa.desaKelurahan'); // Assuming this is pre-converted to label
    const kecamatan = get(d, 'siswa.kecamatan'); // Assuming this is pre-converted to label
    const kabupaten = get(d, 'siswa.kabupaten');
    const provinsi = get(d, 'siswa.provinsi');
    const kodePos = get(d, 'siswa.kodePos');

    const parts = [
      alamatJalan,
      dusun ? `Dsn. ${dusun}` : '',
      rtRw ? `RT/RW ${rtRw}` : '',
      desaKelurahan,
      kecamatan,
      kabupaten,
      provinsi,
      kodePos,
    ].filter(Boolean).join(', ');
    return parts || '';
  };
  
  const formatNama = (person: 'ayah' | 'ibu') => {
    const nama = get(d, `${person}.nama`);
    const isDeceased = get(d, `${person}.isDeceased`);
    if (!nama) return '';
    if (isDeceased) {
        return `${person === 'ayah' ? '(Alm.)' : '(Almh.)'} ${nama}`;
    }
    return nama;
  }
  // --- End of Formatter Logic ---

  return (
    <div className="f4-page font-serif text-[11pt] text-black leading-tight bg-white">
      {/* Kop dan Judul Formulir */}
      <div className="pt-[1.5cm] px-[1.5cm]">
        <header className="flex justify-between items-start w-full">
          <img
            src="https://ik.imagekit.io/mimawaru/logo-nu-hitam.png"
            alt="Logo NU"
            className="w-20 h-20 object-contain"
          />
          <div className="text-center w-full -ml-20">
            <h1 className="text-sm font-bold uppercase">Lembaga Pendidikan Ma’arif NU</h1>
            <h2 className="text-sm font-bold uppercase">Madrasah Ibtidaiyah “Roudlotut Tholibin”</h2>
            <p className="text-sm font-bold uppercase">Status: Terakreditasi A (Unggul) - NSM: 111235240439</p>
            <p className="text-sm uppercase">Warukulon – Pucuk – Lamongan</p>
            <p className="text-xs font-medium mt-0.5">AKTE NOTARIS: Kemenkumham RI, Nomor AHU-119.AH.01.08.Tahun 2013</p>
            <p className="text-xs">Alamat: Jl. Pendidikan 59 Warukulon Pucuk Lamongan 62257</p>
            <div className="border-t-4 border-black mt-1 w-full"></div>
          </div>
        </header>
        <div className="text-center mt-2 mb-2">
          <h2 className="text-sm font-bold uppercase underline">Formulir Pendaftaran</h2>
          <p className="text-sm uppercase">Tahun Pelajaran 2025/2026</p>
        </div>
      </div>

      {/* Data Formulir */}
      <main className="px-[1.5cm] pb-[1.5cm] space-y-2">
        <Section title="A. Identitas Calon Siswa">
          <table className="w-full">
            <tbody>
              <Row label="Nama Lengkap" value={get(d, 'siswa.namaLengkap')} />
              <Row label="Nama Panggilan" value={get(d, 'siswa.namaPanggilan')} />
              <Row label="Jenis Kelamin" value={get(d, 'siswa.jenisKelamin')} />
              <Row label="NISN" value={get(d, 'siswa.nisn')} />
              <Row label="NIK Siswa" value={get(d, 'siswa.nikSiswa')} />
              <Row label="Tempat, Tanggal Lahir" value={formatTtl()} />
              <Row label="Agama" value={get(d, 'siswa.agama')} />
              <Row label="Anak Ke-" value={get(d, 'siswa.anakKe')} />
              <Row label="Jumlah Saudara" value={get(d, 'siswa.jumlahSaudaraKandung')} />
              <Row label="Tinggal Dengan" value={get(d, 'siswa.tempatTinggal')} />
              <Row label="Moda Transportasi" value={get(d, 'siswa.modaTransportasi', []).join(', ')} />
              <Row label="Alamat Lengkap" value={formatAlamat()} fullWidth={true} />
            </tbody>
          </table>
        </Section>

        <div className="grid grid-cols-2 gap-x-8">
          <Section title="B. Identitas Ayah">
            <table className="w-full">
              <tbody>
                <Row label="Nama" value={formatNama('ayah')} />
                <Row label="NIK" value={get(d, 'ayah.nik')} />
                <Row label="Tahun Lahir" value={get(d, 'ayah.tahunLahir')} />
                <Row label="Pendidikan" value={get(d, 'ayah.pendidikan')} />
                <Row label="Pekerjaan" value={get(d, 'ayah.pekerjaan')} />
                <Row label="Penghasilan" value={get(d, 'ayah.penghasilan')} />
                <Row label="Nomor HP" value={get(d, 'ayah.nomorTelepon')} />
              </tbody>
            </table>
          </Section>

          <Section title="C. Identitas Ibu">
            <table className="w-full">
              <tbody>
                <Row label="Nama" value={formatNama('ibu')} />
                <Row label="NIK" value={get(d, 'ibu.nik')} />
                <Row label="Tahun Lahir" value={get(d, 'ibu.tahunLahir')} />
                <Row label="Pendidikan" value={get(d, 'ibu.pendidikan')} />
                <Row label="Pekerjaan" value={get(d, 'ibu.pekerjaan')} />
                <Row label="Penghasilan" value={get(d, 'ibu.penghasilan')} />
                <Row label="Nomor HP" value={get(d, 'ibu.nomorTelepon')} />
              </tbody>
            </table>
          </Section>
        </div>

        <Section title="D. Identitas Wali">
           <table className="w-full">
            <tbody>
              <tr>
                <td className="w-1/2 pr-4 align-top">
                  <table className="w-full">
                    <tbody>
                      <Row label="Nama" value={get(d, 'wali.nama')} />
                      <Row label="NIK" value={get(d, 'wali.nik')} />
                      <Row label="Tahun Lahir" value={get(d, 'wali.tahunLahir')} />
                      <Row label="Nomor HP" value={get(d, 'wali.nomorTelepon')} />
                    </tbody>
                  </table>
                </td>
                <td className="w-1/2 pl-4 align-top">
                  <table className="w-full">
                    <tbody>
                      <Row label="Hubungan" value={get(d, 'wali.hubungan')} />
                      <Row label="Pendidikan" value={get(d, 'wali.pendidikan')} />
                      <Row label="Pekerjaan" value={get(d, 'wali.pekerjaan')} />
                      <Row label="Penghasilan" value={get(d, 'wali.penghasilan')} />
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </Section>

        {/* Tanda Tangan */}
        <div className="flex justify-between items-end pt-8 text-sm">
          <div className="text-center">
            <p>Panitia SPMB</p>
            <div style={{ height: "2cm" }}></div>
            <div>( .......................................... )</div>
          </div>
          <div className="text-center">
            <p>Lamongan, ..........................................</p>
            <p>Orang Tua / Wali Murid,</p>
            <div style={{ height: "2cm" }}></div>
            <div>( .......................................... )</div>
          </div>
        </div>
      </main>
    </div>
  );
}
