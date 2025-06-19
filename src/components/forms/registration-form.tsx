
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, type FieldPath, type FieldErrors, type FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, ArrowLeft, ArrowRight, Check, UserRound, User as UserIcon, ShieldCheck, Phone } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
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
  requiredParentSchema,
} from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';

const TOTAL_STEPS = 5;

const stepsData = [
  { num: 1, title: "Identitas Siswa", Icon: UserRound, fields: [
    "namaLengkap", "namaPanggilan", "jenisKelamin", "nisn", "nikSiswa",
    "tempatLahir", "tanggalLahir", "agama", "anakKe", "jumlahSaudaraKandung",
    "alamatJalan", "rtRw", "dusun", "desaKelurahan", "kecamatan", "kodePos",
    "tempatTinggal", "modaTransportasi"
  ] as FieldPath<RegistrationFormData>[] },
  { num: 2, title: "Data Ayah", Icon: UserIcon, fields: [
    "ayah.nama", "ayah.nik", "ayah.tahunLahir", "ayah.pendidikan", "ayah.pekerjaan", "ayah.penghasilan"
  ] as FieldPath<RegistrationFormData>[] },
  { num: 3, title: "Data Ibu", Icon: UserIcon, fields: [
    "ibu.nama", "ibu.nik", "ibu.tahunLahir", "ibu.pendidikan", "ibu.pekerjaan", "ibu.penghasilan"
  ] as FieldPath<RegistrationFormData>[] },
  { num: 4, title: "Data Wali", Icon: ShieldCheck, fields: [
     "wali.nama", "wali.nik", "wali.tahunLahir", "wali.pendidikan", "wali.pekerjaan", "wali.penghasilan"
  ] as FieldPath<RegistrationFormData>[] },
  { num: 5, title: "Kontak", Icon: Phone, fields: ["nomorTeleponAyah", "nomorTeleponIbu", "nomorTeleponWali"] as FieldPath<RegistrationFormData>[] },
];

function getFieldError(path: string, errors: FieldErrors<RegistrationFormData>): FieldError | undefined {
  const pathArray = path.split('.');
  let current: any = errors;
  for (const part of pathArray) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current as FieldError;
}


export function RegistrationForm() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [stepCompletionStatus, setStepCompletionStatus] = useState<Record<number, boolean | undefined>>({}); // undefined means not yet attempted

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange', 
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
      modaTransportasiLainnya: '',
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
      nomorTeleponAyah: '',
      nomorTeleponIbu: '',
      nomorTeleponWali: '',
    },
  });

  const getFieldsForStep = (step: number): FieldPath<RegistrationFormData>[] => {
    const stepData = stepsData.find(s => s.num === step);
    if (!stepData) return [];
    
    let currentFields: FieldPath<RegistrationFormData>[] = [...stepData.fields];

    if (step === 1) {
        if (form.getValues("agama") === "Lainnya") currentFields.push("agamaLainnya");
        if (form.getValues("tempatTinggal") === "Lainnya") currentFields.push("tempatTinggalLainnya");
        if (form.getValues("modaTransportasi").includes("lainnya")) currentFields.push("modaTransportasiLainnya");
    } else if (step === 2) { 
        if (form.getValues("ayah.pekerjaan") === "Lainnya") currentFields.push("ayah.pekerjaanLainnya");
        if (form.getValues("ayah.pendidikan") === "Lainnya") currentFields.push("ayah.pendidikanLainnya");
    } else if (step === 3) { 
        if (form.getValues("ibu.pekerjaan") === "Lainnya") currentFields.push("ibu.pekerjaanLainnya");
        if (form.getValues("ibu.pendidikan") === "Lainnya") currentFields.push("ibu.pendidikanLainnya");
    } else if (step === 4) { 
        if (form.getValues("wali.pekerjaan") === "Lainnya") currentFields.push("wali.pekerjaanLainnya");
        if (form.getValues("wali.pendidikan") === "Lainnya") currentFields.push("wali.pendidikanLainnya");
    }
    return currentFields;
  };

const processStep = async (action: 'next' | 'prev' | 'jumpTo', targetStep?: number) => {
    const stepBeingLeft = currentStep;
    let isStepBeingLeftValid = true;

    if (action === 'next' || (action === 'jumpTo' && targetStep && targetStep > stepBeingLeft)) {
      const fieldsToValidate = getFieldsForStep(stepBeingLeft);
      await form.trigger(fieldsToValidate);

      if (stepBeingLeft === 1) {
        isStepBeingLeftValid = fieldsToValidate.every(field => !getFieldError(field, form.formState.errors));
        if (form.getValues("agama") === "Lainnya" && !form.getValues("agamaLainnya")) isStepBeingLeftValid = false;
        if (form.getValues("tempatTinggal") === "Lainnya" && !form.getValues("tempatTinggalLainnya")) isStepBeingLeftValid = false;
        if (form.getValues("modaTransportasi").includes("lainnya") && !form.getValues("modaTransportasiLainnya")) isStepBeingLeftValid = false;
      } else if (stepBeingLeft === 2) {
        const parentData = form.getValues().ayah;
        isStepBeingLeftValid = requiredParentSchema.safeParse(parentData).success;
      } else if (stepBeingLeft === 3) {
        const parentData = form.getValues().ibu;
        isStepBeingLeftValid = requiredParentSchema.safeParse(parentData).success;
      } else if (stepBeingLeft === 4) {
        const waliData = form.getValues().wali;
        isStepBeingLeftValid = requiredParentSchema.safeParse(waliData).success;
      } else if (stepBeingLeft === 5) {
        const { nomorTeleponAyah, nomorTeleponIbu, nomorTeleponWali } = form.getValues();
        const atLeastOnePhone = !!nomorTeleponAyah || !!nomorTeleponIbu || !!nomorTeleponWali;
        let individualPhonesValid = true;
        if (nomorTeleponAyah && form.formState.errors.nomorTeleponAyah) individualPhonesValid = false;
        if (nomorTeleponIbu && form.formState.errors.nomorTeleponIbu) individualPhonesValid = false;
        if (nomorTeleponWali && form.formState.errors.nomorTeleponWali) individualPhonesValid = false;
        isStepBeingLeftValid = atLeastOnePhone && individualPhonesValid;
      }
      setStepCompletionStatus(prev => ({ ...prev, [stepBeingLeft]: isStepBeingLeftValid }));
    }

    if (action === 'next') {
      if (currentStep < TOTAL_STEPS) setCurrentStep(prev => prev + 1);
    } else if (action === 'prev') {
      if (currentStep > 1) setCurrentStep(prev => prev - 1);
    } else if (action === 'jumpTo' && targetStep !== undefined) {
      if (targetStep !== currentStep) {
          setCurrentStep(targetStep);
      }
    }
  };

  const onFormSubmit = async (data: RegistrationFormData) => {
    console.log("Form submitted successfully:", data);
    toast({
      title: "Pendaftaran Terkirim!",
      description: "Data Anda telah berhasil direkam.",
    });
    const allComplete: Record<number, boolean> = {};
    for (let i = 1; i <= TOTAL_STEPS; i++) allComplete[i] = true;
    setStepCompletionStatus(allComplete);
  };

  const onFormError = (errors: FieldErrors<RegistrationFormData>) => {
    toast({
      title: "Formulir Belum Lengkap",
      description: "Mohon periksa kembali isian Anda pada langkah yang ditandai.",
      variant: "destructive",
    });

    const newCompletionStatus: Record<number, boolean> = { ...stepCompletionStatus };
    let firstErrorStep = TOTAL_STEPS + 1;

    for (let i = 1; i <= TOTAL_STEPS; i++) {
      let currentStepHasError = false;
      
      if (i === 1) {
        const fieldsToCheck = getFieldsForStep(i);
        currentStepHasError = fieldsToCheck.some(field => getFieldError(field, errors));
        if (form.getValues("agama") === "Lainnya" && !form.getValues("agamaLainnya")) currentStepHasError = true;
        if (form.getValues("tempatTinggal") === "Lainnya" && !form.getValues("tempatTinggalLainnya")) currentStepHasError = true;
        if (form.getValues("modaTransportasi").includes("lainnya") && !form.getValues("modaTransportasiLainnya")) currentStepHasError = true;
      } else if (i === 2) {
        currentStepHasError = !requiredParentSchema.safeParse(form.getValues().ayah).success;
      } else if (i === 3) {
        currentStepHasError = !requiredParentSchema.safeParse(form.getValues().ibu).success;
      } else if (i === 4) { 
        currentStepHasError = !requiredParentSchema.safeParse(form.getValues().wali).success;
      } else if (i === 5) {
        const { nomorTeleponAyah, nomorTeleponIbu, nomorTeleponWali } = form.getValues();
        const atLeastOnePhone = !!nomorTeleponAyah || !!nomorTeleponIbu || !!nomorTeleponWali;
        let individualPhonesValid = true;
        if (nomorTeleponAyah && errors.nomorTeleponAyah) individualPhonesValid = false;
        if (nomorTeleponIbu && errors.nomorTeleponIbu) individualPhonesValid = false;
        if (nomorTeleponWali && errors.nomorTeleponWali) individualPhonesValid = false;
        currentStepHasError = !atLeastOnePhone || !individualPhonesValid;
        
        const phoneErrorMessages = registrationSchema.superRefine((data, ctx) => {
          if (!data.nomorTeleponAyah && !data.nomorTeleponIbu && !data.nomorTeleponWali) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Minimal satu nomor telepon (Ayah, Ibu, atau Wali) wajib diisi.",
              path: ["nomorTeleponAyah"], 
            });
          }
        }).safeParse(form.getValues());

        if(!phoneErrorMessages.success) {
            const phoneIssue = phoneErrorMessages.error.issues.find(issue => issue.message?.includes("Minimal satu nomor telepon"));
            if (phoneIssue) currentStepHasError = true;
        }
      }

      if (currentStepHasError) {
        newCompletionStatus[i] = false;
        if (i < firstErrorStep) firstErrorStep = i;
      } else {
        // Only mark as true if it wasn't previously marked as false due to submit error
        if (newCompletionStatus[i] !== false) {
             newCompletionStatus[i] = true;
        }
      }
    }
    setStepCompletionStatus(newCompletionStatus);
    if (firstErrorStep <= TOTAL_STEPS) {
      setCurrentStep(firstErrorStep);
    }
  };

 const renderStepIndicators = () => {
    return (
      <div className="grid grid-cols-5 gap-1 mb-8 rounded-md border shadow-sm p-1">
          {stepsData.map((step) => {
            const isCurrent = currentStep === step.num;
            // undefined means not yet validated by leaving the step or submitting
            // true means validated successfully
            // false means validation attempted and failed
            const validationState = stepCompletionStatus[step.num];
            const successfullyValidated = validationState === true;
            const attemptedAndInvalid = validationState === false;
            const StepIcon = step.Icon;

            return (
              <div
                key={step.num}
                className={cn(
                  "flex flex-col items-center justify-center p-1 rounded-lg border-2 cursor-pointer transition-all text-center relative shadow-sm hover:border-primary/70",
                  isCurrent
                    ? (attemptedAndInvalid ? "bg-primary text-primary-foreground border-destructive ring-2 ring-destructive ring-offset-background" : "bg-primary text-primary-foreground border-primary ring-2 ring-primary ring-offset-background")
                    : successfullyValidated
                    ? "border-green-500 bg-card"
                    : attemptedAndInvalid
                    ? "border-destructive bg-card" 
                    : "border-border bg-card", 
                )}
                onClick={() => processStep('jumpTo', step.num)}
                title={step.title}
                aria-current={isCurrent ? "step" : undefined}
              >
                {successfullyValidated && !isCurrent && (
                  <Check className="w-4 h-4 absolute top-0.5 right-0.5 text-green-600" strokeWidth={3} />
                )}
                
                <StepIcon className={cn(
                    "w-5 h-5 mb-0.5", 
                    isCurrent ? "text-primary-foreground" : 
                    attemptedAndInvalid ? "text-destructive" : 
                    "text-primary" 
                )} />
                <span className={cn(
                    "text-xs leading-tight font-medium", 
                    isCurrent ? "text-primary-foreground" :
                    attemptedAndInvalid ? "text-destructive" :
                    "text-card-foreground"
                )}>
                    {step.title}
                </span>
              </div>
            );
          })}
        </div>
    );
  };


  const renderParentFields = (parentType: 'ayah' | 'ibu' | 'wali') => {
    const title = parentType === 'ayah' ? 'Ayah Kandung' : parentType === 'ibu' ? 'Ibu Kandung' : 'Wali';
    const namePrefix = parentType;
    const description = parentType === 'wali' 
      ? "Wali adalah pihak yang saat ini bertanggung jawab atas peserta didik. Data Wali wajib diisi. Jika Ayah/Ibu masih menjadi penanggung jawab utama, silakan salin data dari mereka. Namun, jika peserta didik diasuh oleh kerabat lain (misalnya kakek, nenek, paman, bibi, dsb), mohon isikan data sesuai wali yang sebenarnya."
      : undefined;


    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-center">{`Data ${title}`}</CardTitle>
          {description && (
            <CardDescription className="text-center pt-1">
              {description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {parentType === 'wali' && (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 justify-center">
              <Button type="button" variant="outline" onClick={() => copyParentData('ayah')}>Salin dari Ayah</Button>
              <Button type="button" variant="outline" onClick={() => copyParentData('ibu')}>Salin dari Ibu</Button>
            </div>
          )}
          <FormField
            control={form.control}
            name={`${namePrefix}.nama` as FieldPath<RegistrationFormData>}
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
            name={`${namePrefix}.nik` as FieldPath<RegistrationFormData>}
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
            name={`${namePrefix}.tahunLahir` as FieldPath<RegistrationFormData>}
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
            name={`${namePrefix}.pendidikan` as FieldPath<RegistrationFormData>}
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
          {form.watch(`${namePrefix}.pendidikan` as FieldPath<RegistrationFormData>) === 'Lainnya' && (
            <FormField
              control={form.control}
              name={`${namePrefix}.pendidikanLainnya` as FieldPath<RegistrationFormData>}
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
            name={`${namePrefix}.pekerjaan` as FieldPath<RegistrationFormData>}
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
          {form.watch(`${namePrefix}.pekerjaan` as FieldPath<RegistrationFormData>) === 'Lainnya' && (
            <FormField
              control={form.control}
              name={`${namePrefix}.pekerjaanLainnya` as FieldPath<RegistrationFormData>}
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
            name={`${namePrefix}.penghasilan` as FieldPath<RegistrationFormData>}
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

  const copyParentData = (sourceParent: 'ayah' | 'ibu') => {
    const sourceData = form.getValues(sourceParent);
    if (sourceData) {
      form.setValue('wali.nama', sourceData.nama || '');
      form.setValue('wali.nik', sourceData.nik || '');
      form.setValue('wali.tahunLahir', sourceData.tahunLahir);
      form.setValue('wali.pendidikan', sourceData.pendidikan || undefined);
      form.setValue('wali.pendidikanLainnya', sourceData.pendidikanLainnya || '');
      form.setValue('wali.pekerjaan', sourceData.pekerjaan || undefined);
      form.setValue('wali.pekerjaanLainnya', sourceData.pekerjaanLainnya || '');
      form.setValue('wali.penghasilan', sourceData.penghasilan || undefined);
      
      const waliFieldsToTrigger: FieldPath<RegistrationFormData>[] = [
        "wali.nama", "wali.nik", "wali.tahunLahir", "wali.pendidikan",
        "wali.pekerjaan", "wali.penghasilan"
      ];
      if(sourceData.pendidikan === "Lainnya") waliFieldsToTrigger.push("wali.pendidikanLainnya");
      if(sourceData.pekerjaan === "Lainnya") waliFieldsToTrigger.push("wali.pekerjaanLainnya");
      form.trigger(waliFieldsToTrigger);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit, onFormError)} className="w-full max-w-3xl space-y-8 p-4 md:p-0">
        {renderStepIndicators()}
        
        {currentStep === 1 && (
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl text-center">Identitas Peserta Didik</CardTitle>
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
                <FormField control={form.control} name="agamaLainnya" render={({ field }) => (
                    <FormItem><FormLabel>Detail Agama Lainnya</FormLabel><FormControl><Input placeholder="Sebutkan agama lainnya" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                  )} />
              )}
              <FormField control={form.control} name="anakKe" render={({ field }) => (
                <FormItem><FormLabel>Anak Keberapa</FormLabel><FormControl><Input type="number" placeholder="Contoh: 1" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="jumlahSaudaraKandung" render={({ field }) => (
                <FormItem><FormLabel>Jumlah Saudara Kandung</FormLabel><FormControl><Input type="number" placeholder="Contoh: 2" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>
              )} />
              <Separator className="my-4" />
              <p className="font-medium text-center">Alamat Tempat Tinggal</p>
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
              <Separator className="my-4" />
              <FormField control={form.control} name="tempatTinggal" render={({ field }) => (
                <FormItem><FormLabel>Tempat Tinggal Saat Ini</FormLabel><Select onValueChange={field.onChange} value={field.value ?? undefined}><FormControl><SelectTrigger><SelectValue placeholder="Pilih tempat tinggal" /></SelectTrigger></FormControl><SelectContent>{tempatTinggalOptionsList.map(tt => <SelectItem key={tt} value={tt}>{tt}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
              )} />
              {form.watch('tempatTinggal') === 'Lainnya' && (
                <FormField control={form.control} name="tempatTinggalLainnya" render={({ field }) => (
                    <FormItem><FormLabel>Detail Tempat Tinggal Lainnya</FormLabel><FormControl><Input placeholder="Sebutkan tempat tinggal lainnya" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                  )} />
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
              {form.watch('modaTransportasi', []).includes('lainnya') && (
                <FormField control={form.control} name="modaTransportasiLainnya" render={({ field }) => (
                  <FormItem><FormLabel>Detail Moda Transportasi Lainnya</FormLabel><FormControl><Input placeholder="Sebutkan moda transportasi lainnya" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                )} />
              )}
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && renderParentFields('ayah')}
        {currentStep === 3 && renderParentFields('ibu')}
        {currentStep === 4 && renderParentFields('wali')}

        {currentStep === 5 && (
          <Card className="w-full shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-xl text-center">Kontak yang Bisa Dihubungi</CardTitle>
              <CardDescription className="text-center pt-1">Minimal isi salah satu nomor telepon. Awali nomor dengan +62 (contoh: +6281234567890).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField control={form.control} name="nomorTeleponAyah" render={({ field }) => (
                <FormItem><FormLabel>Nomor Telepon Ayah</FormLabel><FormControl><Input type="tel" placeholder="+6281234567890" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="nomorTeleponIbu" render={({ field }) => (
                <FormItem><FormLabel>Nomor Telepon Ibu</FormLabel><FormControl><Input type="tel" placeholder="+6281234567890" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="nomorTeleponWali" render={({ field }) => (
                <FormItem><FormLabel>Nomor Telepon Wali</FormLabel><FormControl><Input type="tel" placeholder="+6281234567890" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
              )} />
            </CardContent>
          </Card>
        )}

        <CardFooter className="flex justify-between mt-8">
          {currentStep > 1 ? (
            <Button type="button" variant="outline" onClick={() => processStep('prev')} disabled={form.formState.isSubmitting}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Sebelumnya
            </Button>
          ) : ( <div /> 
          )}

          {currentStep < TOTAL_STEPS ? (
            <Button type="button" onClick={() => processStep('next')} disabled={form.formState.isSubmitting} className="ml-auto">
              Berikutnya <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" className="w-full md:w-auto text-lg py-6 ml-auto" disabled={form.formState.isSubmitting || form.formState.isSubmitSuccessful}>
              {form.formState.isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}
            </Button>
          )}
        </CardFooter>
      </form>
    </Form>
  );
}
    

    




