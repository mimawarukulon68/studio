
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

// New imports for the test
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import FormulirF4 from '@/components/forms/FormulirF4';


// Mock data for testing
const mockData: RegistrationFormData = {
    siswa: {
      namaLengkap: 'MUHAMMAD ZIDAN AL-FARISI',
      namaPanggilan: 'ZIDAN',
      jenisKelamin: 'Laki-laki',
      nisn: '0123456789',
      nikSiswa: '3524123456789001',
      tempatLahir: 'LAMONGAN',
      tanggalLahir: '15/08/2018',
      agama: 'Islam',
      anakKe: 1,
      jumlahSaudaraKandung: 2,
      tempatTinggal: 'Bersama orang tua',
      provinsi: 'JAWA TIMUR',
      kabupaten: 'KAB. LAMONGAN',
      kecamatan: 'KEC. PUCUK', // In a real scenario this might be a code
      desaKelurahan: 'WARUKULON', // In a real scenario this might be a code
      dusun: 'KAUMAN',
      rtRw: '001/002',
      alamatJalan: 'Jl. Pendidikan No. 59',
      kodePos: '62257',
      modaTransportasi: ['Jalan Kaki', 'Kendaraan Bermotor'], // using labels directly for the mock
      agamaLainnya: '',
      tempatTinggalLainnya: '',
      modaTransportasiLainnya: ''
    },
    ayah: {
      isDeceased: false,
      nama: 'AHMAD SUBAGIYO',
      nik: '3524123456780002',
      tahunLahir: 1985,
      pendidikan: 'SMA Sederajat',
      pekerjaan: 'Wiraswasta',
      penghasilan: '2.000.000 - 4.999.999',
      nomorTelepon: '081234567890',
      pendidikanLainnya: '',
      pekerjaanLainnya: ''
    },
    ibu: {
      isDeceased: false,
      nama: 'SITI AMINAH',
      nik: '3524123456780003',
      tahunLahir: 1988,
      pendidikan: 'SMA Sederajat',
      pekerjaan: 'Ibu Rumah Tangga',
      penghasilan: 'Tidak Berpenghasilan',
      nomorTelepon: '085678901234',
      pendidikanLainnya: '',
      pekerjaanLainnya: ''
    },
    wali: {
      nama: '',
      hubungan: undefined,
      hubunganLainnya: '',
      nik: '',
      tahunLahir: undefined,
      pendidikan: undefined,
      pendidikanLainnya: '',
      pekerjaan: undefined,
      pekerjaanLainnya: '',
      penghasilan: undefined,
      nomorTelepon: ''
    },
  };


interface Step5ReviewProps {
    formData: RegistrationFormData;
    districts: WilayahOption[];
    villages: WilayahOption[];
}

export const Step5Review: React.FC<Step5ReviewProps> = ({
    formData,
    districts,
    villages
}) => {

    const renderValue = (value: any): string => {
        if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
        if (Array.isArray(value)) {
            const transportationMap = new Map(modaTransportasiOptions.map(opt => [opt.id, opt.label]));
            const labels = value.map((id: string) => {
                if (id === 'lainnya') {
                    const lainnyaText = formData.siswa.modaTransportasiLainnya || '-';
                    return `Lainnya: ${lainnyaText}`;
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

                    if (key === 'kecamatan') displayValue = districts.find(d => d.value === value)?.label || value;
                    if (key === 'desaKelurahan') displayValue = villages.find(v => v.value === value)?.label || value;
                    
                    if (key === 'nama' && (sectionName === 'ayah' || sectionName === 'ibu')) {
                        return (
                             <div key={`${sectionName}-${key}`} className="flex justify-between items-start py-2 border-b border-dashed">
                                <dt className="flex items-center gap-2 text-sm text-muted-foreground pr-2">
                                    {displayLabels[key] || key}
                                    {data.isDeceased && <Badge variant="secondary">{sectionName === 'ayah' ? '(Alm.)' : '(Almh.)'}</Badge>}
                                </dt>
                                <dd className="text-sm font-medium text-right break-words">
                                   <span>{renderValue(displayValue)}</span>
                                </dd>
                            </div>
                        )
                    }

                    return (
                        <div key={`${sectionName}-${key}`} className="flex justify-between items-start py-2 border-b border-dashed">
                            <dt className="text-sm text-muted-foreground pr-2">{displayLabels[key] || key}</dt>
                            <dd className="text-sm font-medium text-right break-words">
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
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button type="button">
                                🖨️ Lihat Pratinjau Cetak
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 flex flex-col">
                            <DialogHeader className="p-4 border-b bg-muted/50 flex-row flex justify-between items-center">
                                <DialogTitle>Pratinjau Formulir F4</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="flex-1 bg-gray-200">
                                <div 
                                    className="mx-auto my-8 shadow-lg bg-white"
                                    style={{ 
                                        width: '210mm',
                                        minHeight: '330mm',
                                    }}
                                >
                                    <FormulirF4 data={mockData} />
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
                </div>

            </CardContent>
        </Card>
    );
};
