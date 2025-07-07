
"use client";

import React from 'react';
import type { Control, FormState, UseFormWatch, FieldErrors, FieldError } from 'react-hook-form';

import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RegistrationFormData } from '@/lib/schemas';
import { pendidikanOptionsList, pekerjaanOptionsList, penghasilanOptionsList } from '@/lib/schemas';

interface Step2AyahProps {
    control: Control<RegistrationFormData>;
    watch: UseFormWatch<RegistrationFormData>;
    formState: FormState<RegistrationFormData>;
    getFieldError: (path: string, errors: FieldErrors<RegistrationFormData>) => FieldError | undefined;
    nikIsFocused: boolean;
    setNikIsFocused: (focused: boolean) => void;
    nikValue: string;
}

export const Step2Ayah: React.FC<Step2AyahProps> = ({
    control,
    watch,
    formState,
    getFieldError,
    nikIsFocused,
    setNikIsFocused,
    nikValue,
}) => {
    const isDeceased = watch('ayah.isDeceased');

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="items-center bg-muted/50">
                <CardTitle className="font-headline text-xl text-center">Data Ayah Kandung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <FormField
                    control={control}
                    name="ayah.isDeceased"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                            <FormControl>
                                <Checkbox
                                    id="ayah-is-deceased"
                                    checked={!!field.value}
                                    onCheckedChange={field.onChange}
                                    name={field.name}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel htmlFor="ayah-is-deceased" className="font-normal">
                                    Ayah Kandung sudah meninggal dunia
                                </FormLabel>
                            </div>
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="ayah.nama"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <FormLabel>Nama Ayah Kandung *</FormLabel>
                                {isDeceased && <Badge variant="secondary">(Alm.)</Badge>}
                            </div>
                            <FormControl>
                                 <Input
                                    placeholder="Masukkan nama ayah kandung"
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
                    name="ayah.nik"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>NIK Ayah Kandung {isDeceased ? '(Opsional)' : '*'}</FormLabel>
                            <FormControl>
                                <Input type="text" inputMode="numeric" maxLength={16} placeholder="16 digit NIK" {...field} value={typeof field.value === "string" ? field.value : ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="ayah.tahunLahir"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tahun Lahir {isDeceased ? '(Opsional)' : '*'}</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Contoh: 1980" {...field} value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="ayah.pendidikan"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pendidikan Terakhir {isDeceased ? '(Opsional)' : '*'}</FormLabel>
                            <Select {...field} value={typeof field.value === "string" ? field.value : ""} onValueChange={field.onChange}>
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
                {watch('ayah.pendidikan') === 'Lainnya' && (
                    <FormField
                        control={control}
                        name="ayah.pendidikanLainnya"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Detail Pendidikan Lainnya *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Sebutkan pendidikan lainnya" {...field} value={typeof field.value === "string" ? field.value : ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <FormField
                    control={control}
                    name="ayah.pekerjaan"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pekerjaan Utama {isDeceased ? '(Opsional)' : '*'}</FormLabel>
                            <Select {...field} value={typeof field.value === "string" ? field.value : ""} onValueChange={field.onChange}>
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
                {watch('ayah.pekerjaan') === 'Lainnya' && (
                    <FormField
                        control={control}
                        name="ayah.pekerjaanLainnya"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Detail Pekerjaan Lainnya *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Sebutkan pekerjaan lainnya" {...field} value={typeof field.value === "string" ? field.value : ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <FormField
                    control={control}
                    name="ayah.penghasilan"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Penghasilan Bulanan {isDeceased ? '(Opsional)' : '*'}</FormLabel>
                            <Select {...field} value={typeof field.value === "string" ? field.value : ""} onValueChange={field.onChange}>
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
                <FormField
                    control={control}
                    name="ayah.nomorTelepon"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nomor HP (Whatsapp Aktif) (Opsional)</FormLabel>
                            <FormControl>
                                <Input
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="081234567890"
                                    {...field}
                                    value={typeof field.value === "string" ? field.value : ""}
                                    disabled={isDeceased}
                                />
                            </FormControl>
                            <FormDescription>
                                {isDeceased
                                    ? "Nomor HP tidak dapat diisi karena yang bersangkutan telah meninggal."
                                    : "Minimal salah satu nomor (Ayah/Ibu/Wali) wajib diisi."
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
