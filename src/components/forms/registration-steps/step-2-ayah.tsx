
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
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
    const pekerjaanOptions = isDeceased ? [...pekerjaanOptionsList, "Meninggal Dunia"] : pekerjaanOptionsList;
    const penghasilanOptions = isDeceased ? [...penghasilanOptionsList, "Meninggal Dunia"] : penghasilanOptionsList;

    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-xl text-center">Data Ayah Kandung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                            <FormLabel>Nama Ayah Kandung *</FormLabel>
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
                                <IMaskInput
                                    mask="0000000000000000"
                                    lazy={!nikIsFocused && !nikValue}
                                    inputMode="numeric"
                                    placeholder="16 digit NIK"
                                    className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", getFieldError('ayah.nik', formState.errors) && "border-destructive")}
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
                    name="ayah.tahunLahir"
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
                    name="ayah.pendidikan"
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
                {watch('ayah.pendidikan') === 'Lainnya' && (
                    <FormField
                        control={control}
                        name="ayah.pendidikanLainnya"
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
                    name="ayah.pekerjaan"
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
                {watch('ayah.pekerjaan') === 'Lainnya' && (
                    <FormField
                        control={control}
                        name="ayah.pekerjaanLainnya"
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
                    name="ayah.penghasilan"
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
                    name="ayah.nomorTelepon"
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
