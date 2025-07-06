
"use client";

import React from 'react';
import type { Control, FormState, UseFormSetValue, UseFormTrigger, UseFormWatch, FieldErrors, FieldError, FieldPath } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { AlertCircle } from 'lucide-react';

import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { RegistrationFormData } from '@/lib/schemas';
import { pendidikanOptionsList, pekerjaanOptionsList, penghasilanOptionsList } from '@/lib/schemas';

interface Step3IbuProps {
    control: Control<RegistrationFormData>;
    watch: UseFormWatch<RegistrationFormData>;
    formState: FormState<RegistrationFormData>;
    getFieldError: (path: string, errors: FieldErrors<RegistrationFormData>) => FieldError | undefined;
    nikIsFocused: boolean;
    setNikIsFocused: (focused: boolean) => void;
    nikValue: string;
}

export const Step3Ibu: React.FC<Step3IbuProps> = ({
    control,
    watch,
    formState,
    getFieldError,
    nikIsFocused,
    setNikIsFocused,
    nikValue,
}) => {
    const isDeceased = watch('ibu.isDeceased');
    const pekerjaanOptions = isDeceased ? [...pekerjaanOptionsList, "Meninggal Dunia"] : pekerjaanOptionsList;
    const penghasilanOptions = isDeceased ? [...penghasilanOptionsList, "Meninggal Dunia"] : penghasilanOptionsList;

    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-xl text-center">Data Ibu Kandung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={control}
                    name="ibu.isDeceased"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                            <FormControl>
                                <Checkbox
                                    id="ibu-is-deceased"
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                    name={field.name}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel htmlFor="ibu-is-deceased" className="font-normal">
                                    Ibu Kandung sudah meninggal dunia
                                </FormLabel>
                            </div>
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="ibu.nama"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Ibu Kandung *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Masukkan nama ibu kandung"
                                    {...field}
                                    value={typeof field.value === "string" ? field.value : ""}
                                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="ibu.nik"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>NIK Ibu Kandung {isDeceased ? '(Opsional)' : '*'}</FormLabel>
                            <FormControl>
                                <IMaskInput
                                    mask="0000000000000000"
                                    lazy={!nikIsFocused && !nikValue}
                                    inputMode="numeric"
                                    placeholder="16 digit NIK"
                                    className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", getFieldError('ibu.nik', formState.errors) && "border-destructive")}
                                    value={typeof field.value === "string" ? field.value : ""}
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
                                    disabled={isDeceased}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="ibu.tahunLahir"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tahun Lahir {isDeceased ? '(Opsional)' : '*'}</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Contoh: 1980" {...field} value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} disabled={isDeceased} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="ibu.pendidikan"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pendidikan Terakhir {isDeceased ? '(Opsional)' : '*'}</FormLabel>
                            <Select {...field} value={typeof field.value === "string" ? field.value : ""} onValueChange={field.onChange} disabled={isDeceased}>
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
                {watch('ibu.pendidikan') === 'Lainnya' && (
                    <FormField
                        control={control}
                        name="ibu.pendidikanLainnya"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Detail Pendidikan Lainnya *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Sebutkan pendidikan lainnya" {...field} value={typeof field.value === "string" ? field.value : ""} disabled={isDeceased} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <FormField
                    control={control}
                    name="ibu.pekerjaan"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pekerjaan Utama {isDeceased ? '(Opsional)' : '*'}</FormLabel>
                            <Select {...field} value={typeof field.value === "string" ? field.value : ""} onValueChange={field.onChange} disabled={isDeceased}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Pilih pekerjaan" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {pekerjaanOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {watch('ibu.pekerjaan') === 'Lainnya' && (
                    <FormField
                        control={control}
                        name="ibu.pekerjaanLainnya"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Detail Pekerjaan Lainnya *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Sebutkan pekerjaan lainnya" {...field} value={typeof field.value === "string" ? field.value : ""} disabled={isDeceased} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <FormField
                    control={control}
                    name="ibu.penghasilan"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Penghasilan Bulanan {isDeceased ? '(Opsional)' : '*'}</FormLabel>
                            <Select {...field} value={typeof field.value === "string" ? field.value : ""} onValueChange={field.onChange} disabled={isDeceased}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Pilih penghasilan" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {penghasilanOptions.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="ibu.nomorTelepon"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nomor HP (Whatsapp Aktif) (Opsional)</FormLabel>
                            <div className="flex items-center">
                                <span className="inline-flex h-10 items-center rounded-l-md border border-r-0 border-input bg-input px-3 text-sm text-muted-foreground">
                                    +62
                                </span>
                                <FormControl>
                                    <Input
                                        type="tel"
                                        inputMode="numeric"
                                        placeholder="81234567890"
                                        className="rounded-l-none"
                                        {...field}
                                        value={typeof field.value === "string" ? field.value : ""}
                                        disabled={isDeceased}
                                    />
                                </FormControl>
                            </div>
                            <FormDescription>
                                {isDeceased
                                    ? "Nomor HP tidak dapat diisi karena yang bersangkutan telah meninggal."
                                    : "Ketik nomor tanpa 0 di depan. Minimal salah satu nomor (Ayah/Ibu/Wali) wajib diisi."
                                }
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}
