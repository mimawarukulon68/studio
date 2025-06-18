
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  registrationSchema,
  type RegistrationFormData,
  jenisKelaminOptions,
  agamaOptionsList,
  tempatTinggalOptionsList,
  modaTransportasiOptions,
  pendidikanOptionsList,
  pekerjaanOptionsList,
  penghasilanOptionsList,
} from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';

export function RegistrationForm() {
  const { toast } = useToast();
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      namaLengkap: '',
      namaPanggilan: '',
      nisn: '',
      nikSiswa: '',
      tempatLahir: '',
      tanggalLahir: undefined,
      agama: undefined,
      agamaLainnya: '',
      anakKe: undefined,
      jumlahSaudaraKandung: undefined,
      alamatJalan: '',
      rtRw: '',
      dusun: '',
      desaKelurahan: '',
      kecamatan: '',
      kodePos: '',
      tempatTinggal: undefined,
      tempatTinggalLainnya: '',
      modaTransportasi: [],
      ayah: {
        nama: '',
        nik: '',
        tahunLahir: undefined,
        pendidikan: undefined,
        pendidikanLainnya: '',
        pekerjaan: undefined,
        pekerjaanLainnya: '',
        penghasilan: undefined,
      },
      ibu: {
        nama: '',
        nik: '',
        tahunLahir: undefined,
        pendidikan: undefined,
        pendidikanLainnya: '',
        pekerjaan: undefined,
        pekerjaanLainnya: '',
        penghasilan: undefined,
      },
      wali: {
        nama: '',
        nik: '',
        tahunLahir: undefined,
        pendidikan: undefined,
        pendidikanLainnya: '',
        pekerjaan: undefined,
        pekerjaanLainnya: '',
        penghasilan: undefined,
      },
    },
  });

  function onSubmit(data: RegistrationFormData) {
    console.log(data);
    // Here you would typically send the data to a server
    // For now, just log it and show a success toast
    toast({
      title: "Pendaftaran Terkirim!",
      description: "Data Anda telah berhasil direkam (cek console).",
    });
    // form.reset(); // Optionally reset form after submission
  }

  const renderParentFields = (parentType: 'ayah' | 'ibu' | 'wali') => {
    const title = parentType === 'ayah' ? 'Ayah Kandung' : parentType === 'ibu' ? 'Ibu Kandung' : 'Wali';
    const namePrefix = parentType;

    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">{`Data ${title}`}</CardTitle>
          {parentType === 'wali' && <CardDescription>Opsional, isi jika ada.</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name={`${namePrefix}.nama` as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{`Nama ${title}`}</FormLabel>
                <FormControl>
                  <Input placeholder={`Masukkan nama ${title.toLowerCase()}`} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${namePrefix}.nik` as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{`NIK ${title}`}</FormLabel>
                <FormControl>
                  <Input type="text" inputMode="numeric" maxLength={16} placeholder={`Masukkan NIK ${title.toLowerCase()}`} {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${namePrefix}.tahunLahir` as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tahun Lahir</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Contoh: 1980" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${namePrefix}.pendidikan` as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pendidikan Terakhir</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Pilih pendidikan" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {pendidikanOptionsList.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch(`${namePrefix}.pendidikan` as any) === 'Lainnya' && (
            <FormField
              control={form.control}
              name={`${namePrefix}.pendidikanLainnya` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detail Pendidikan Lainnya</FormLabel>
                  <FormControl>
                    <Input placeholder="Sebutkan pendidikan lainnya" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name={`${namePrefix}.pekerjaan` as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pekerjaan Utama</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Pilih pekerjaan" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {pekerjaanOptionsList.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {form.watch(`${namePrefix}.pekerjaan` as any) === 'Lainnya' && (
            <FormField
              control={form.control}
              name={`${namePrefix}.pekerjaanLainnya` as any}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detail Pekerjaan Lainnya</FormLabel>
                  <FormControl>
                    <Input placeholder="Sebutkan pekerjaan lainnya" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name={`${namePrefix}.penghasilan` as any}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Penghasilan Bulanan</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Pilih penghasilan" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {penghasilanOptionsList.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    );
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-2xl space-y-12 p-4 md:p-0">
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Identitas Peserta Didik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="namaLengkap" render={({ field }) => (
              <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input placeholder="Sesuai Akta Kelahiran" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="namaPanggilan" render={({ field }) => (
              <FormItem><FormLabel>Nama Panggilan</FormLabel><FormControl><Input placeholder="Nama sehari-hari" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="jenisKelamin" render={({ field }) => (
              <FormItem><FormLabel>Jenis Kelamin</FormLabel><Select onValueChange={field.onChange} value={field.value ?? undefined}><FormControl><SelectTrigger><SelectValue placeholder="Pilih jenis kelamin" /></SelectTrigger></FormControl><SelectContent>{jenisKelaminOptions.map(jk => <SelectItem key={jk} value={jk}>{jk}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="nisn" render={({ field }) => (
              <FormItem><FormLabel>NISN (Nomor Induk Siswa Nasional)</FormLabel><FormControl><Input type="text" inputMode="numeric" maxLength={10} placeholder="Jika ada" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="nikSiswa" render={({ field }) => (
              <FormItem><FormLabel>NIK (Nomor Induk Kependudukan)</FormLabel><FormControl><Input type="text" inputMode="numeric" maxLength={16} placeholder="Sesuai Kartu Keluarga" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="tempatLahir" render={({ field }) => (
              <FormItem><FormLabel>Tempat Lahir</FormLabel><FormControl><Input placeholder="Kota/Kabupaten kelahiran" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="tanggalLahir" render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Tanggal Lahir</FormLabel>
                  <Popover><PopoverTrigger asChild><FormControl>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP") : <span>Pilih tanggal</span>}
                        </Button></FormControl></PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date() || date < new Date("2000-01-01")} initialFocus /></PopoverContent>
                  </Popover><FormMessage />
                </FormItem>
              )} />
            <FormField control={form.control} name="agama" render={({ field }) => (
              <FormItem><FormLabel>Agama</FormLabel><Select onValueChange={field.onChange} value={field.value ?? undefined}><FormControl><SelectTrigger><SelectValue placeholder="Pilih agama" /></SelectTrigger></FormControl><SelectContent>{agamaOptionsList.map(ag => <SelectItem key={ag} value={ag}>{ag}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
            )} />
            {form.watch('agama') === 'Lainnya' && (
              <FormField
                control={form.control}
                name="agamaLainnya"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detail Agama Lainnya</FormLabel>
                    <FormControl>
                      <Input placeholder="Sebutkan agama lainnya" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField control={form.control} name="anakKe" render={({ field }) => (
              <FormItem><FormLabel>Anak Keberapa</FormLabel><FormControl><Input type="number" placeholder="Contoh: 1" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="jumlahSaudaraKandung" render={({ field }) => (
              <FormItem><FormLabel>Jumlah Saudara Kandung</FormLabel><FormControl><Input type="number" placeholder="Contoh: 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="alamatJalan" render={({ field }) => (
              <FormItem><FormLabel>Alamat Jalan</FormLabel><FormControl><Input placeholder="Nama jalan dan nomor rumah" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="rtRw" render={({ field }) => (
              <FormItem><FormLabel>RT/RW</FormLabel><FormControl><Input placeholder="Contoh: 001/002" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="dusun" render={({ field }) => (
              <FormItem><FormLabel>Dusun</FormLabel><FormControl><Input placeholder="Nama dusun/dukuh" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="desaKelurahan" render={({ field }) => (
              <FormItem><FormLabel>Desa/Kelurahan</FormLabel><FormControl><Input placeholder="Nama desa/kelurahan" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="kecamatan" render={({ field }) => (
              <FormItem><FormLabel>Kecamatan</FormLabel><FormControl><Input placeholder="Nama kecamatan" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="kodePos" render={({ field }) => (
              <FormItem><FormLabel>Kode Pos</FormLabel><FormControl><Input type="text" inputMode="numeric" maxLength={5} placeholder="5 digit kode pos" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="tempatTinggal" render={({ field }) => (
              <FormItem><FormLabel>Tempat Tinggal Saat Ini</FormLabel><Select onValueChange={field.onChange} value={field.value ?? undefined}><FormControl><SelectTrigger><SelectValue placeholder="Pilih tempat tinggal" /></SelectTrigger></FormControl><SelectContent>{tempatTinggalOptionsList.map(tt => <SelectItem key={tt} value={tt}>{tt}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
            )} />
            {form.watch('tempatTinggal') === 'Lainnya' && (
              <FormField
                control={form.control}
                name="tempatTinggalLainnya"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detail Tempat Tinggal Lainnya</FormLabel>
                    <FormControl>
                      <Input placeholder="Sebutkan tempat tinggal lainnya" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField control={form.control} name="modaTransportasi" render={() => (
              <FormItem><FormLabel>Moda Transportasi ke Sekolah</FormLabel>
                <div className="space-y-2">
                {modaTransportasiOptions.map((option) => (
                  <FormField key={option.id} control={form.control} name="modaTransportasi"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl><Checkbox checked={field.value?.includes(option.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), option.id])
                                : field.onChange((field.value || []).filter((value: string) => value !== option.id));
                            }} /></FormControl>
                        <FormLabel className="font-normal">{option.label}</FormLabel>
                      </FormItem>
                    )} /> ))}
                </div><FormMessage /></FormItem>
            )} />
          </CardContent>
        </Card>

        {renderParentFields('ayah')}
        {renderParentFields('ibu')}
        {renderParentFields('wali')}
        
        <Button type="submit" className="w-full md:w-auto text-lg py-6" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}
        </Button>
      </form>
    </Form>
  );
}
