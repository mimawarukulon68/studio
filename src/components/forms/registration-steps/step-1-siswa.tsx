
"use client";

import React from 'react';
import type { Control, FormState, UseFormSetValue, UseFormTrigger, UseFormWatch, FieldErrors, FieldError } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';

import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';
import type { RegistrationFormData, ModaTransportasiType } from '@/lib/schemas';
import { jenisKelaminOptions, agamaOptionsList, tempatTinggalOptionsList, modaTransportasiOptions } from '@/lib/schemas';
import type { WilayahOption } from '../registration-form';
import { UserRound } from 'lucide-react';

interface Step1SiswaProps {
    control: Control<RegistrationFormData>;
    formState: FormState<RegistrationFormData>;
    setValue: UseFormSetValue<RegistrationFormData>;
    trigger: UseFormTrigger<RegistrationFormData>;
    watch: UseFormWatch<RegistrationFormData>;
    getFieldError: (path: string, errors: FieldErrors<RegistrationFormData>) => FieldError | undefined;
    provinces: WilayahOption[];
    regencies: WilayahOption[];
    districts: WilayahOption[];
    villages: WilayahOption[];
    provincesLoading: boolean;
    regenciesLoading: boolean;
    districtsLoading: boolean;
    villagesLoading: boolean;
    isKodePosReadOnly: boolean;
    setIsKodePosReadOnly: (value: boolean) => void;
    provincePopoverOpen: boolean;
    setProvincePopoverOpen: (open: boolean) => void;
    regencyPopoverOpen: boolean;
    setRegencyPopoverOpen: (open: boolean) => void;
    districtPopoverOpen: boolean;
    setDistrictPopoverOpen: (open: boolean) => void;
    villagePopoverOpen: boolean;
    setVillagePopoverOpen: (open: boolean) => void;
    nisnIsFocused: boolean;
    setNisnIsFocused: (focused: boolean) => void;
    nisnValue: string;
    nikIsFocused: boolean;
    setNikIsFocused: (focused: boolean) => void;
    nikValue: string;
    rtRwIsFocused: boolean;
    setRtRwIsFocused: (focused: boolean) => void;
    rtRwValue: string;
}

export const Step1Siswa: React.FC<Step1SiswaProps> = ({
    control,
    formState,
    setValue,
    trigger,
    watch,
    getFieldError,
    provinces,
    regencies,
    districts,
    villages,
    provincesLoading,
    regenciesLoading,
    districtsLoading,
    villagesLoading,
    isKodePosReadOnly,
    setIsKodePosReadOnly,
    provincePopoverOpen,
    setProvincePopoverOpen,
    regencyPopoverOpen,
    setRegencyPopoverOpen,
    districtPopoverOpen,
    setDistrictPopoverOpen,
    villagePopoverOpen,
    setVillagePopoverOpen,
    nisnIsFocused,
    setNisnIsFocused,
    nisnValue,
    nikIsFocused,
    setNikIsFocused,
    nikValue,
    rtRwIsFocused,
    setRtRwIsFocused,
    rtRwValue,
}) => {
    const alamatJalan = watch('siswa.alamatJalan');
    const dusun = watch('siswa.dusun');
    const rtRw = watch('siswa.rtRw');
    const desaKelurahanCode = watch('siswa.desaKelurahan');
    const kecamatanCode = watch('siswa.kecamatan');
    const kabupatenCode = watch('siswa.kabupaten');
    const provinsiCode = watch('siswa.provinsi');
    const kodePos = watch('siswa.kodePos');

    const fullAddress = React.useMemo(() => {
        const parts: string[] = [];
        if (alamatJalan) parts.push(alamatJalan);
        if (dusun) parts.push(`Dsn. ${dusun}`);
        if (rtRw && rtRw.replace(/\D/g, '').length > 0) parts.push(`RT/RW ${rtRw}`);
        
        const desaLabel = villages.find(v => v.value === desaKelurahanCode)?.label;
        if (desaLabel) parts.push(`Ds/Kel. ${desaLabel}`);

        const kecamatanLabel = districts.find(d => d.value === kecamatanCode)?.label;
        if (kecamatanLabel) parts.push(`Kec. ${kecamatanLabel}`);

        const kabupatenLabel = regencies.find(r => r.value === kabupatenCode)?.label;
        if (kabupatenLabel) parts.push(kabupatenLabel);

        const provinsiLabel = provinces.find(p => p.value === provinsiCode)?.label;
        if (provinsiLabel) parts.push(provinsiLabel);

        if (kodePos) parts.push(kodePos);

        return parts.join(', ');
    }, [alamatJalan, dusun, rtRw, desaKelurahanCode, kecamatanCode, kabupatenCode, provinsiCode, kodePos, villages, districts, regencies, provinces]);


    return (
        <div className="space-y-8">
            <Card key="step-1-personal" className="w-full shadow-lg">
                <CardHeader className="items-center bg-muted/50">
                    <UserRound className="w-8 h-8 mb-2 text-primary" />
                    <CardTitle className="font-headline text-xl text-center">Data Calon Siswa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={control} name="siswa.namaLengkap" render={({ field }) => (
                        <FormItem><FormLabel>Nama Lengkap *</FormLabel><FormControl><Input
                            placeholder="Sesuai Akta Kelahiran"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name="siswa.namaPanggilan" render={({ field }) => (
                        <FormItem><FormLabel>Nama Panggilan *</FormLabel><FormControl><Input
                            placeholder="Nama panggilan anda"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField
                        control={control}
                        name="siswa.jenisKelamin"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <fieldset>
                                    <legend className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-3">Jenis Kelamin *</legend>
                                    <FormControl>
                                        <RadioGroup
                                            {...field}
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                trigger("siswa.jenisKelamin");
                                            }}
                                            className="flex flex-row space-x-4"
                                        >
                                            {jenisKelaminOptions.map((option) => {
                                                const uniqueId = `${field.name}-${option.toLowerCase().replace(/\s/g, '-')}`;
                                                return (
                                                    <div key={option} className="flex items-center space-x-2 space-y-0">
                                                        <RadioGroupItem value={option} id={uniqueId} />
                                                        <FormLabel htmlFor={uniqueId} className="font-normal">
                                                            {option}
                                                        </FormLabel>
                                                    </div>
                                                );
                                            })}
                                        </RadioGroup>
                                    </FormControl>
                                </fieldset>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="siswa.nisn"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>NISN (Nomor Induk Siswa Nasional) *</FormLabel>
                                <FormControl>
                                    <IMaskInput
                                        mask="0000000000"
                                        lazy={!nisnIsFocused && !nisnValue}
                                        inputMode="numeric"
                                        placeholder="10 digit NISN"
                                        className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", getFieldError('siswa.nisn', formState.errors) && "border-destructive")}
                                        value={field.value ?? ''}
                                        unmask={true}
                                        onAccept={(value) => field.onChange(value)}
                                        onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                            setNisnIsFocused(true);
                                            setTimeout(() => {
                                                if (document.activeElement === e.target) {
                                                    e.target.setSelectionRange(0, 0);
                                                }
                                            }, 0);
                                        }}
                                        onBlur={(e) => {
                                            field.onBlur();
                                            setNisnIsFocused(false);
                                        }}
                                        inputRef={field.ref}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name="siswa.nikSiswa"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>NIK (Nomor Induk Kependudukan) *</FormLabel>
                                <FormControl>
                                    <IMaskInput
                                        mask="0000000000000000"
                                        lazy={!nikIsFocused && !nikValue}
                                        inputMode="numeric"
                                        placeholder="16 digit NIK (sesuai Kartu Keluarga)"
                                        className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", getFieldError('siswa.nikSiswa', formState.errors) && "border-destructive")}
                                        value={field.value ?? ''}
                                        unmask={true}
                                        onAccept={(value) => field.onChange(value)}
                                        onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                            setNikIsFocused(true);
                                            setTimeout(() => {
                                                if (document.activeElement === e.target) {
                                                    e.target.setSelectionRange(0, 0);
                                                }
                                            }, 0);
                                        }}
                                        onBlur={(e) => {
                                            field.onBlur();
                                            setNikIsFocused(false);
                                        }}
                                        inputRef={field.ref}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField control={control} name="siswa.tempatLahir" render={({ field }) => (
                        <FormItem><FormLabel>Tempat Lahir *</FormLabel><FormControl><Input
                            placeholder="Kota/Kabupaten kelahiran"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                const capitalized = value.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
                                field.onChange(capitalized);
                            }}
                        /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField
                        control={control}
                        name="siswa.tanggalLahir"
                        render={({ field, fieldState }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Tanggal Lahir *</FormLabel>
                                <FormControl>
                                    <CustomDatePicker
                                        value={field.value}
                                        onDateChange={(dateStr) => {
                                            field.onChange(dateStr)
                                            trigger("siswa.tanggalLahir");
                                        }}
                                        onRHFBlur={field.onBlur}
                                        ariaInvalid={!!fieldState.error}
                                        disabled={field.disabled}
                                        inputMode="numeric"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField control={control} name="siswa.agama" render={({ field }) => (
                        <FormItem><FormLabel>Agama *</FormLabel><Select {...field} onValueChange={(value) => { field.onChange(value); trigger('siswa.agama'); }}><FormControl><SelectTrigger><SelectValue placeholder="Pilih agama" /></SelectTrigger></FormControl><SelectContent>{agamaOptionsList.map(ag => <SelectItem key={ag} value={ag}>{ag}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    {watch('siswa.agama') === 'Lainnya' && (
                        <FormField control={control} name="siswa.agamaLainnya" render={({ field }) => (
                            <FormItem><FormLabel>Detail Agama Lainnya *</FormLabel><FormControl><Input placeholder="Sebutkan agama lainnya" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    )}
                    <FormField control={control} name="siswa.anakKe" render={({ field }) => (
                        <FormItem><FormLabel>Anak Keberapa *</FormLabel><FormControl><Input type="number" min="1" placeholder="Contoh: 1" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name="siswa.jumlahSaudaraKandung" render={({ field }) => (
                        <FormItem><FormLabel>Jumlah Saudara Kandung *</FormLabel><FormControl><Input type="number" min="0" placeholder="Isi 0 jika tidak punya" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>
                    )} />
                </CardContent>
            </Card>

            <Card key="step-1-address" className="w-full shadow-lg">
                <CardHeader className="items-center bg-muted/50">
                    <UserRound className="w-8 h-8 mb-2 text-primary" />
                    <CardTitle className="font-headline text-xl text-center">Alamat Calon Siswa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField control={control} name="siswa.tempatTinggal" render={({ field }) => (
                        <FormItem><FormLabel>Tempat Tinggal Saat Ini *</FormLabel><Select {...field} onValueChange={(value) => { field.onChange(value); trigger('siswa.tempatTinggal'); }}><FormControl><SelectTrigger><SelectValue placeholder="Pilih tempat tinggal" /></SelectTrigger></FormControl><SelectContent>{tempatTinggalOptionsList.map(tt => <SelectItem key={tt} value={tt}>{tt}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    {watch('siswa.tempatTinggal') === 'Lainnya' && (
                        <FormField control={control} name="siswa.tempatTinggalLainnya" render={({ field }) => (
                            <FormItem><FormLabel>Detail Tempat Tinggal Lainnya *</FormLabel><FormControl><Input placeholder="Sebutkan tempat tinggal lainnya" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                        )} />
                    )}

                    <FormField
                        control={control}
                        name="siswa.provinsi"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Provinsi *</FormLabel>
                                <Popover open={provincePopoverOpen} onOpenChange={setProvincePopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn("w-full justify-between px-3", !field.value && "text-muted-foreground")}
                                                disabled={provincesLoading || provinces.length === 0}
                                            >
                                                {field.value ? provinces.find(p => p.value === field.value)?.label : (provincesLoading ? "Memuat..." : "Pilih Provinsi")}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Cari provinsi..." />
                                            <CommandList>
                                                <CommandEmpty>Provinsi tidak ditemukan.</CommandEmpty>
                                                <CommandGroup>
                                                    {provinces.map((province) => (
                                                        <CommandItem
                                                            value={province.label}
                                                            key={province.value}
                                                            onSelect={() => {
                                                                if (province.value !== field.value) {
                                                                    setValue("siswa.provinsi", province.value);
                                                                    setValue("siswa.kabupaten", "");
                                                                    setValue("siswa.kecamatan", "");
                                                                    setValue("siswa.desaKelurahan", "");
                                                                    setValue("siswa.kodePos", "");
                                                                    setIsKodePosReadOnly(false);
                                                                    trigger("siswa.provinsi");
                                                                }
                                                                setProvincePopoverOpen(false);
                                                            }}
                                                        >
                                                            <CheckIcon className={cn("mr-2 h-4 w-4", province.value === field.value ? "opacity-100" : "opacity-0")} />
                                                            {province.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="siswa.kabupaten"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Kabupaten/Kota *</FormLabel>
                                <Popover open={regencyPopoverOpen} onOpenChange={setRegencyPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                disabled={!watch("siswa.provinsi") || regenciesLoading || regencies.length === 0}
                                                className={cn("w-full justify-between px-3", !field.value && "text-muted-foreground")}
                                            >
                                                {field.value ? regencies.find(r => r.value === field.value)?.label : (regenciesLoading ? "Memuat..." : "Pilih Kabupaten/Kota")}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Cari kabupaten/kota..." />
                                            <CommandList>
                                                <CommandEmpty>Kabupaten/Kota tidak ditemukan.</CommandEmpty>
                                                <CommandGroup>
                                                    {regencies.map((regency) => (
                                                        <CommandItem
                                                            value={regency.label}
                                                            key={regency.value}
                                                            onSelect={() => {
                                                                if (regency.value !== field.value) {
                                                                    setValue("siswa.kabupaten", regency.value);
                                                                    setValue("siswa.kecamatan", "");
                                                                    setValue("siswa.desaKelurahan", "");
                                                                    setValue("siswa.kodePos", "");
                                                                    setIsKodePosReadOnly(false);
                                                                    trigger("siswa.kabupaten");
                                                                }
                                                                setRegencyPopoverOpen(false);
                                                            }}
                                                        >
                                                            <CheckIcon className={cn("mr-2 h-4 w-4", regency.value === field.value ? "opacity-100" : "opacity-0")} />
                                                            {regency.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="siswa.kecamatan"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Kecamatan *</FormLabel>
                                <Popover open={districtPopoverOpen} onOpenChange={setDistrictPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                disabled={!watch("siswa.kabupaten") || districtsLoading || districts.length === 0}
                                                className={cn("w-full justify-between px-3", !field.value && "text-muted-foreground")}
                                            >
                                                {field.value ? districts.find(d => d.value === field.value)?.label : (districtsLoading ? "Memuat..." : "Pilih Kecamatan")}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Cari kecamatan..." />
                                            <CommandList>
                                                <CommandEmpty>Kecamatan tidak ditemukan.</CommandEmpty>
                                                <CommandGroup>
                                                    {districts.map((district) => (
                                                        <CommandItem
                                                            value={district.label}
                                                            key={district.value}
                                                            onSelect={() => {
                                                                if (district.value !== field.value) {
                                                                    setValue("siswa.kecamatan", district.value);
                                                                    setValue("siswa.desaKelurahan", "");
                                                                    setValue("siswa.kodePos", "");
                                                                    setIsKodePosReadOnly(false);
                                                                    trigger("siswa.kecamatan");
                                                                }
                                                                setDistrictPopoverOpen(false);
                                                            }}
                                                        >
                                                            <CheckIcon className={cn("mr-2 h-4 w-4", district.value === field.value ? "opacity-100" : "opacity-0")} />
                                                            {district.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="siswa.desaKelurahan"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Desa/Kelurahan *</FormLabel>
                                <Popover open={villagePopoverOpen} onOpenChange={setVillagePopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                disabled={!watch("siswa.kecamatan") || villagesLoading || villages.length === 0}
                                                className={cn("w-full justify-between px-3", !field.value && "text-muted-foreground")}
                                            >
                                                {field.value ? villages.find(v => v.value === field.value)?.label : (villagesLoading ? "Memuat..." : "Pilih Desa/Kelurahan")}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Cari desa/kelurahan..." />
                                            <CommandList>
                                                <CommandEmpty>Desa/Kelurahan tidak ditemukan.</CommandEmpty>
                                                <CommandGroup>
                                                    {villages.map((village) => (
                                                        <CommandItem
                                                            value={village.label}
                                                            key={village.value}
                                                            onSelect={() => {
                                                                if (village.value !== field.value) {
                                                                    setValue("siswa.desaKelurahan", village.value);
                                                                    if (village.postalCode) {
                                                                        setValue("siswa.kodePos", village.postalCode);
                                                                        setIsKodePosReadOnly(true);
                                                                    } else {
                                                                        setValue("siswa.kodePos", "");
                                                                        setIsKodePosReadOnly(false);
                                                                    }
                                                                    trigger("siswa.desaKelurahan");
                                                                    trigger("siswa.kodePos");
                                                                }
                                                                setVillagePopoverOpen(false);
                                                            }}
                                                        >
                                                            <CheckIcon className={cn("mr-2 h-4 w-4", village.value === field.value ? "opacity-100" : "opacity-0")} />
                                                            {village.label}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField control={control} name="siswa.dusun" render={({ field }) => (
                        <FormItem><FormLabel>Dusun (Opsional)</FormLabel><FormControl><Input
                            placeholder="Nama dusun/dukuh"
                            {...field}
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField
                        control={control}
                        name="siswa.rtRw"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>RT/RW *</FormLabel>
                                <FormControl>
                                    <IMaskInput
                                        mask="000/000"
                                        lazy={!rtRwIsFocused && !rtRwValue}
                                        placeholder="Contoh: 001/002"
                                        inputMode="numeric"
                                        className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", getFieldError('siswa.rtRw', formState.errors) && "border-destructive")}
                                        value={field.value ?? ''}
                                        unmask={false}
                                        onAccept={(value) => field.onChange(value)}
                                        onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                                            setRtRwIsFocused(true);
                                            setTimeout(() => {
                                                if (document.activeElement === e.target) {
                                                    e.target.setSelectionRange(0, 0);
                                                }
                                            }, 0);
                                        }}
                                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                            if (e.target.value.replace(/\D/g, '').length === 0) {
                                                setValue('siswa.rtRw', '', { shouldValidate: true });
                                            }
                                            field.onBlur();
                                            setRtRwIsFocused(false);
                                        }}
                                        inputRef={field.ref}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField control={control} name="siswa.alamatJalan" render={({ field }) => (
                        <FormItem><FormLabel>Alamat Jalan (Opsional)</FormLabel><FormControl><Input placeholder="Contoh: Jl. Kenanga No. 27 (Bisa nama jalan saja)" {...field} value={field.value ?? ''} /></FormControl><FormDescription>Kosongkan jika tidak tahu nama jalan.</FormDescription><FormMessage /></FormItem>
                    )} />
                    <FormField control={control} name="siswa.kodePos" render={({ field }) => (
                        <FormItem><FormLabel>Kode Pos *</FormLabel><FormControl><Input type="text" inputMode="numeric" maxLength={5} placeholder="5 digit kode pos" {...field} value={field.value ?? ''} readOnly={isKodePosReadOnly} /></FormControl><FormMessage /></FormItem>
                    )} />

                    <div className="space-y-2 pt-2 text-center bg-muted/50 p-4 rounded-md border">
                        <p className="text-sm font-medium">Alamat Lengkap (Pratinjau)</p>
                        <div
                            className="w-full select-none rounded-md border p-3 text-sm text-muted-foreground min-h-[60px] bg-[hsl(45deg_80%_95%_/_77%)]"
                        >
                            <p>{fullAddress || "Isi kolom alamat di atas untuk melihat pratinjau..."}</p>
                        </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="space-y-6 bg-muted/50 p-4 rounded-md border">
                        <FormField
                            control={control}
                            name="siswa.modaTransportasi"
                            render={({ field }) => (
                                <FormItem>
                                    <fieldset>
                                        <legend className="text-sm font-medium leading-none mb-3">Moda Transportasi ke Sekolah *</legend>
                                        <div className="space-y-2">
                                            {modaTransportasiOptions.map((option) => {
                                                const uniqueId = `${field.name}-${option.id.toLowerCase().replace(/\s/g, '-')}`;
                                                return (
                                                    <FormItem key={option.id} className="flex flex-row items-start space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                id={uniqueId}
                                                                checked={field.value?.includes(option.id)}
                                                                onCheckedChange={(checked) => {
                                                                    return checked
                                                                        ? field.onChange([...(field.value || []), option.id])
                                                                        : field.onChange((field.value || []).filter((value: string) => value !== option.id));
                                                                }}
                                                                name={field.name}
                                                            />
                                                        </FormControl>
                                                        <FormLabel htmlFor={uniqueId} className="font-normal">
                                                            {option.label}
                                                        </FormLabel>
                                                    </FormItem>
                                                );
                                            })}
                                        </div>
                                    </fieldset>
                                    <FormMessage />
                                </FormItem>
                            )} 
                        />
                        {watch('siswa.modaTransportasi', []).includes('lainnya') && (
                            <FormField control={control} name="siswa.modaTransportasiLainnya" render={({ field }) => (
                                <FormItem><FormLabel>Detail Moda Transportasi Lainnya *</FormLabel><FormControl><Input placeholder="Sebutkan moda transportasi lainnya" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                            )} />
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
