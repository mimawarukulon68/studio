
"use client";

import { useEffect, useState } from "react";
import type { RegistrationFormData } from "@/lib/schemas";
import { format, parse, isValid as isDateValid } from 'date-fns';
import { id as localeID } from 'date-fns/locale/id';
import { modaTransportasiOptions } from "@/lib/schemas";
import type { ModaTransportasiType } from "@/lib/schemas";


function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="mb-4">
            <h3 className="font-bold mb-1 border-b border-black">{title}</h3>
            <table className="w-full text-sm">
                <tbody>{children}</tbody>
            </table>
        </section>
    );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <tr>
            <td className="align-top w-[35%] py-0.5">{label}</td>
            <td className="align-top w-2 py-0.5">:</td>
            <td className="align-top py-0.5 border-b border-dotted border-black">{value || "-"}</td>
        </tr>
    );
}

function ParentSection({ parent, type }: { parent: RegistrationFormData['ayah'] | RegistrationFormData['ibu'], type: 'Ayah' | 'Ibu' }) {
    const parentTitle = `${type} Kandung`;
    const isDeceased = parent.isDeceased;

    return (
        <Section title={`B. IDENTITAS ${type.toUpperCase()}`}>
            <Row label="Nama" value={`${parent.nama || ''}${isDeceased ? ' (Alm.)' : ''}`} />
            {isDeceased ? (
                <>
                    <Row label="NIK" value="-" />
                    <Row label="Tahun Lahir" value="-" />
                    <Row label="Pendidikan" value="-" />
                    <Row label="Pekerjaan" value="Meninggal Dunia" />
                    <Row label="Penghasilan" value="Meninggal Dunia" />
                    <Row label="Nomor HP" value="-" />
                </>
            ) : (
                <>
                    <Row label="NIK" value={parent.nik} />
                    <Row label="Tahun Lahir" value={parent.tahunLahir} />
                    <Row label="Pendidikan" value={parent.pendidikan === 'Lainnya' ? parent.pendidikanLainnya : parent.pendidikan} />
                    <Row label="Pekerjaan" value={parent.pekerjaan === 'Lainnya' ? parent.pekerjaanLainnya : parent.pekerjaan} />
                    <Row label="Penghasilan" value={parent.penghasilan} />
                    <Row label="Nomor HP" value={parent.nomorTelepon ? `+62${parent.nomorTelepon}` : '-'} />
                </>
            )}
        </Section>
    );
}


export default function PrintPage() {
    const [data, setData] = useState<RegistrationFormData | null>(null);

    useEffect(() => {
        const storedData = localStorage.getItem("formData");
        if (storedData) {
            setData(JSON.parse(storedData));
        }

        // Optional: Trigger print dialog automatically
        // const handlePrint = () => window.print();
        // setTimeout(handlePrint, 500); // Delay to allow rendering
    }, []);

    if (!data) {
        return <p className="p-4 text-center">Memuat data formulir...</p>;
    }

    const { siswa, ayah, ibu, wali } = data;

    const formattedDate = (dateStr: string | undefined) => {
        if (!dateStr) return '-';
        const dateObj = parse(dateStr, 'dd/MM/yyyy', new Date());
        return isDateValid(dateObj) ? format(dateObj, 'dd MMMM yyyy', { locale: localeID }) : dateStr;
    };

    const transportationMap = new Map(modaTransportasiOptions.map(opt => [opt.id, opt.label]));
    const transportationLabels = siswa.modaTransportasi.map((id: string) => {
        if (id === 'lainnya') {
            return siswa.modaTransportasiLainnya ? `Lainnya: ${siswa.modaTransportasiLainnya}` : 'Lainnya';
        }
        return transportationMap.get(id as ModaTransportasiType) || id;
    }).join(', ');

    return (
        <div className="print-page bg-white w-[210mm] min-h-[330mm] p-[1cm] mx-auto font-serif text-[11pt] text-black leading-relaxed">
            <header className="text-center mb-6">
                <h1 className="text-lg font-bold uppercase">FORMULIR PENDAFTARAN PESERTA DIDIK BARU</h1>
                <h2 className="text-md font-bold uppercase">MI ROUDLOTUT THOLIBIN WARUKULON</h2>
                <h3 className="text-md font-bold uppercase">TAHUN PELAJARAN 2024/2025</h3>
                <div className="border-t-2 border-b border-black mt-2 mb-1"></div>
            </header>

            <main className="mt-4 flex flex-col space-y-4">
                <div className="grid grid-cols-2 gap-x-6">
                    {/* -- KOLOM KIRI -- */}
                    <div className="space-y-4">
                        <Section title="A. IDENTITAS PESERTA DIDIK">
                            <Row label="Nama Lengkap" value={siswa.namaLengkap} />
                            <Row label="Nama Panggilan" value={siswa.namaPanggilan} />
                            <Row label="Jenis Kelamin" value={siswa.jenisKelamin} />
                            <Row label="NISN" value={siswa.nisn} />
                            <Row label="NIK" value={siswa.nikSiswa} />
                            <Row label="Tempat, Tanggal Lahir" value={`${siswa.tempatLahir}, ${formattedDate(siswa.tanggalLahir)}`} />
                            <Row label="Agama" value={siswa.agama === 'Lainnya' ? siswa.agamaLainnya : siswa.agama} />
                            <Row label="Anak Ke-" value={siswa.anakKe} />
                            <Row label="Jumlah Saudara Kandung" value={siswa.jumlahSaudaraKandung} />
                        </Section>
                        <ParentSection parent={ibu} type="Ibu" />
                    </div>

                    {/* -- KOLOM KANAN -- */}
                    <div className="space-y-4">
                         <Section title="ALAMAT TEMPAT TINGGAL">
                            <Row label="Alamat Jalan" value={siswa.alamatJalan} />
                            <Row label="Dusun" value={siswa.dusun} />
                            <Row label="RT / RW" value={siswa.rtRw} />
                            <Row label="Desa / Kelurahan" value={siswa.desaKelurahan} />
                            <Row label="Kecamatan" value={siswa.kecamatan} />
                            <Row label="Kabupaten / Kota" value={siswa.kabupaten} />
                            <Row label="Provinsi" value={siswa.provinsi} />
                            <Row label="Kode Pos" value={siswa.kodePos} />
                            <Row label="Tinggal Bersama" value={siswa.tempatTinggal === 'Lainnya' ? siswa.tempatTinggalLainnya : siswa.tempatTinggal} />
                            <Row label="Transportasi" value={transportationLabels} />
                        </Section>
                        <ParentSection parent={ayah} type="Ayah" />
                    </div>
                </div>
                 {/* -- DATA WALI (jika diisi) -- */}
                 <div className="pt-2">
                    <Section title="C. IDENTITAS WALI">
                         <Row label="Nama" value={wali.nama} />
                         <Row label="Hubungan" value={wali.hubungan === 'Lainnya (tuliskan)' ? wali.hubunganLainnya : wali.hubungan} />
                         <Row label="NIK" value={wali.nik} />
                         <Row label="Tahun Lahir" value={wali.tahunLahir} />
                         <Row label="Pendidikan" value={wali.pendidikan === 'Lainnya' ? wali.pendidikanLainnya : wali.pendidikan} />
                         <Row label="Pekerjaan" value={wali.pekerjaan === 'Lainnya' ? wali.pekerjaanLainnya : wali.pekerjaan} />
                         <Row label="Penghasilan" value={wali.penghasilan} />
                         <Row label="Nomor HP" value={wali.nomorTelepon ? `+62${wali.nomorTelepon}` : '-'} />
                    </Section>
                 </div>
            </main>

            <footer className="absolute bottom-[2cm] right-[2cm]">
                <div className="text-center">
                    <p>Lamongan, .........................................</p>
                    <p className="mt-2">Orang Tua/Wali,</p>
                    <div className="mt-20">(..................................................)</div>
                </div>
            </footer>
        </div>
    );
}

