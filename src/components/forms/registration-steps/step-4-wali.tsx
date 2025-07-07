
"use client";

import React from 'react';
import type { Control, FormState, UseFormWatch, FieldErrors, FieldError } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { AlertCircle } from 'lucide-react';

import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { RegistrationFormData } from '@/lib/schemas';
import { pendidikanOptionsList, pekerjaanOptionsList, penghasilanOptionsList, hubunganWaliOptionsList } from '@/lib/schemas';

interface Step4WaliProps {
    control: Control<RegistrationFormData>;
    watch: UseFormWatch<RegistrationFormData>;
    formState: FormState<RegistrationFormData>;
    getFieldError: (path: string, errors: FieldErrors<RegistrationFormData>) => FieldError | undefined;
    isWaliRequired: boolean;
    nikIsFocused: boolean;
    setNikIsFocused: (focused: boolean) => void;
    nikValue: string;
}

export const Step4Wali: React.FC<Step4WaliProps> = ({
    control,
    watch,
    formState,
    getFieldError,
    isWaliRequired,
    nikIsFocused,
    setNikIsFocused,
    nikValue,
}) => {
    const description = "Wali adalah pihak yang turut bertanggung jawab atas siswa, seperti Ayah/Ibu kandung, kakek, nenek, paman, bibi, orang tua tiri, atau pihak lain yang dianggap sebagai wali. Jika kedua orang tua telah tiada, data wali wajib diisi. Jika salah satu orang tua masih hidup dan menjadi pendamping utama, bagian ini boleh dilewati. Namun, Anda juga tetap boleh mengisi data wali meskipun orang tua masih ada, jika ada pihak lain yang turut mendampingi siswa.";

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="items-center bg-muted/50">
                <CardTitle className="font-headline text-xl text-center">Data Wali</CardTitle>
                <CardDescription className="text-center pt-1">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {isWaliRequired && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Perhatian</AlertTitle>
                        <AlertDescription>
                            Karena kedua orang tua telah meninggal, maka data wali wajib diisi sebagai pihak yang saat ini mendampingi siswa.
                        </AlertDescription>
                    </Alert>
                )}
                <FormField
                    control={control}
                    name="wali.hubungan"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Hubungan dengan Siswa {isWaliRequired ? '*' : '(Opsional)'}</FormLabel>
                            <Select {...field} value={field.value ?? ""} onValueChange={field.onChange}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Pilih hubungan" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {hubunganWaliOptionsList.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {watch('wali.hubungan') === 'Lainnya (tuliskan)' && (
                    <FormField
                        control={control}
                        name="wali.hubunganLainnya"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Detail Hubungan Lainnya *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Sebutkan hubungan lainnya" {...field} value={field.value ?? ''} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                <FormField
                    control={control}
                    name="wali.nama"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nama Wali {isWaliRequired ? '*' : '(Opsional)'}</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Masukkan nama wali"
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
                    name="wali.nik"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>NIK Wali {isWaliRequired ? '*' : '(Opsional)'}</FormLabel>
                            <FormControl>
                                <IMaskInput
                                    mask="0000000000000000"
                                    lazy={!nikIsFocused && !nikValue}
                                    inputMode="numeric"
                                    placeholder="16 digit NIK"
                                    className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", getFieldError('wali.nik', formState.errors) && "border-destructive")}
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
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="wali.tahunLahir"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tahun Lahir {isWaliRequired ? '*' : '(Opsional)'}</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Contoh: 1980" {...field} value={typeof field.value === "number" || typeof field.value === "string" ? field.value : ""} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="wali.pendidikan"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pendidikan Terakhir {isWaliRequired ? '*' : '(Opsional)'}</FormLabel>
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
                {watch('wali.pendidikan') === 'Lainnya' && (
                    <FormField
                        control={control}
                        name="wali.pendidikanLainnya"
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
                    name="wali.pekerjaan"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Pekerjaan Utama {isWaliRequired ? '*' : '(Opsional)'}</FormLabel>
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
                {watch('wali.pekerjaan') === 'Lainnya' && (
                    <FormField
                        control={control}
                        name="wali.pekerjaanLainnya"
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
                    name="wali.penghasilan"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Penghasilan Bulanan {isWaliRequired ? '*' : '(Opsional)'}</FormLabel>
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
                    name="wali.nomorTelepon"
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
                                    />
                                </FormControl>
                            </div>
                            <FormDescription>
                                Ketik nomor tanpa 0 di depan. Minimal salah satu nomor (Ayah/Ibu/Wali) wajib diisi.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}
