
"use client";

import React from 'react';
import { format, parse, isValid as isDateValid } from 'date-fns';
import { id as localeID } from 'date-fns/locale/id';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileCheck2 } from 'lucide-react';
import type { RegistrationFormData, ModaTransportasiType } from '@/lib/schemas';
import { modaTransportasiOptions } from '@/lib/schemas';
import type { WilayahOption } from '../registration-form';
import { Badge } from '@/components/ui/badge';


interface Step5ReviewProps {
    formData: RegistrationFormData;
    provinces: WilayahOption[];
    regencies: WilayahOption[];
    districts: WilayahOption[];
    villages: WilayahOption[];
}

export const Step5Review: React.FC<Step5ReviewProps> = ({
    formData,
    provinces,
    regencies,
    districts,
    villages
}) => {

    const renderValue = (value: any): string => {
        if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
        if (Array.isArray(value)) {
            const transportationMap = new Map(modaTransportasiOptions.map(opt => [opt.id, opt.label]));
            const labels = value.map((id: string) => {
                if (id === 'lainnya') {
                    return formData.siswa.modaTransportasiLainnya ? `Lainnya: ${formData.siswa.modaTransportasiLainnya}` : 'Lainnya';
                }
                return transportationMap.get(id as ModaTransportasiType) || id;
            });
            return labels.join(', ');
        }
        if (value === '' || value === null || value === undefined) return '-';
        return String(value);
    };

    const displayLabels: Record<string, string> = {
        'namaLengkap': 'Nama Lengkap',
        'namaPanggilan': 'Nama Panggilan',
        'jenisKelamin': 'Jenis Kelamin',
        'nisn': 'NISN',
        'nikSiswa': 'NIK Siswa',
        'tempatLahir': 'Tempat Lahir',
        'tanggalLahir': 'Tanggal Lahir',
        'agama': 'Agama',
        'anakKe': 'Anak Ke-',
        'jumlahSaudaraKandung': 'Jumlah Saudara Kandung',
        'tempatTinggal': 'Tempat Tinggal Saat Ini',
        'provinsi': 'Provinsi',
        'kabupaten': 'Kabupaten/Kota',
        'kecamatan': 'Kecamatan',
        'desaKelurahan': 'Desa/Kelurahan',
        'dusun': 'Dusun',
        'rtRw': 'RT/RW',
        'alamatJalan': 'Alamat Jalan',
        'kodePos': 'Kode Pos',
        'modaTransportasi': 'Moda Transportasi',
        'isDeceased': 'Status Meninggal',
        'nama': 'Nama',
        'nik': 'NIK',
        'tahunLahir': 'Tahun Lahir',
        'pendidikan': 'Pendidikan',
        'pekerjaan': 'Pekerjaan',
        'penghasilan': 'Penghasilan',
        'nomorTelepon': 'Nomor HP',
        'hubungan': 'Hubungan dengan Siswa',
    };

    const renderSectionData = (data: Record<string, any>, sectionName: 'siswa' | 'ayah' | 'ibu' | 'wali') => {
        // Exclude internal fields from display
        const { isDeceased, agamaLainnya, tempatTinggalLainnya, modaTransportasiLainnya, pendidikanLainnya, pekerjaanLainnya, hubunganLainnya, ...displayData } = data;

        return (
            <dl className="space-y-2">
                {sectionName !== 'siswa' && (
                     <div key={`${sectionName}-isDeceased`} className="flex justify-between items-start py-2 border-b border-dashed">
                        <dt className="text-sm text-muted-foreground pr-2">{displayLabels['isDeceased']}</dt>
                        <dd className="text-sm font-medium text-right break-words">{renderValue(isDeceased)}</dd>
                    </div>
                )}
                {Object.entries(displayData).map(([key, value]) => {
                    let displayValue = value;
                    if (key === 'tanggalLahir' && typeof value === 'string') {
                        const dateObj = parse(value, 'dd/MM/yyyy', new Date());
                        if (isDateValid(dateObj)) {
                            displayValue = format(dateObj, 'dd MMMM yyyy', { locale: localeID });
                        }
                    }
                    if (key === 'agama' && value === 'Lainnya') displayValue = `Lainnya: ${formData.siswa.agamaLainnya || ''}`;
                    if (key === 'tempatTinggal' && value === 'Lainnya') displayValue = `Lainnya: ${formData.siswa.tempatTinggalLainnya || ''}`;
                    
                    if (key === 'pendidikan' && value === 'Lainnya') {
                         displayValue = `Lainnya: ${data.pendidikanLainnya || ''}`;
                    }
                    if (key === 'pekerjaan' && value === 'Lainnya') {
                        displayValue = `Lainnya: ${data.pekerjaanLainnya || ''}`;
                    }
                     if (key === 'hubungan' && value === 'Lainnya (tuliskan)') {
                        displayValue = `Lainnya: ${data.hubunganLainnya || ''}`;
                    }

                    if (key === 'provinsi') displayValue = provinces.find(p => p.value === value)?.label || value;
                    if (key === 'kabupaten') displayValue = regencies.find(r => r.value === value)?.label || value;
                    if (key === 'kecamatan') displayValue = districts.find(d => d.value === value)?.label || value;
                    if (key === 'desaKelurahan') displayValue = villages.find(v => v.value === value)?.label || value;

                    return (
                        <div key={`${sectionName}-${key}`} className="flex justify-between items-start py-2 border-b border-dashed">
                            <dt className="text-sm text-muted-foreground pr-2">{displayLabels[key] || key}</dt>
                            <dd className="text-sm font-medium text-right break-words flex items-center gap-2 justify-end">
                                {isDeceased && key === 'nama' && (
                                     <Badge variant="secondary" className="font-normal">{sectionName === 'ayah' ? '(Alm.)' : '(Almh.)'}</Badge>
                                )}
                               <span>{renderValue(displayValue)}</span>
                            </dd>
                        </div>
                    );
                })}
            </dl>
        );
    };

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="items-center bg-muted/50">
                <FileCheck2 className="w-8 h-8 mb-2 text-primary" />
                <CardTitle className="font-headline text-xl text-center">Review Data Pendaftaran</CardTitle>
                <CardDescription className="text-center pt-1">
                    Pastikan semua data yang Anda masukkan sudah benar sebelum mengirim.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <Accordion type="multiple" defaultValue={['siswa', 'ayah', 'ibu', 'wali']} className="w-full">
                    <AccordionItem value="siswa">
                        <AccordionTrigger className="font-semibold">Data Identitas Siswa</AccordionTrigger>
                        <AccordionContent>{renderSectionData(formData.siswa, 'siswa')}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="ayah">
                        <AccordionTrigger className="font-semibold">Data Ayah</AccordionTrigger>
                        <AccordionContent>{renderSectionData(formData.ayah, 'ayah')}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="ibu">
                        <AccordionTrigger className="font-semibold">Data Ibu</AccordionTrigger>
                        <AccordionContent>{renderSectionData(formData.ibu, 'ibu')}</AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="wali">
                        <AccordionTrigger className="font-semibold">Data Wali</AccordionTrigger>
                        <AccordionContent>
                            {Object.values(formData.wali).every(v => v === '' || v === undefined || v === null)
                                ? <p className="text-sm text-muted-foreground italic">Data wali tidak diisi.</p>
                                : renderSectionData(formData.wali, 'wali')
                            }
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                <div className="mt-8 flex justify-center">
                    <Button type="button">
                        🖨️ Lihat Pratinjau Cetak
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
};

    