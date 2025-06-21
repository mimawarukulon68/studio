
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, type FieldPath, type FieldErrors, type FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Check, UserRound, User as UserIcon, ShieldCheck, Phone, XIcon, ChevronsUpDown, CheckIcon, CalendarIcon } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import type IMask from 'imask';
import { format, parse, isValid as isDateValid } from 'date-fns';
import { id as localeID } from 'date-fns/locale/id';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { CustomDatePicker } from '@/components/ui/custom-date-picker';
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
import { Separator } from '@/components/ui/separator';

const TOTAL_STEPS = 5;

const stepsData = [
  { num: 1, title: "Identitas Siswa", Icon: UserRound, fields: [
    "namaLengkap", "namaPanggilan", "jenisKelamin", "nisn", "nikSiswa",
    "tempatLahir", "tanggalLahir", "agama", "anakKe", "jumlahSaudaraKandung",
    "tempatTinggal", "provinsi", "kabupaten", "kecamatan", "desaKelurahan", "dusun", "rtRw", "alamatJalan", "kodePos",
    "modaTransportasi", "agamaLainnya", "tempatTinggalLainnya", "modaTransportasiLainnya"
  ] as FieldPath<RegistrationFormData>[] },
  { num: 2, title: "Data Ayah", Icon: UserIcon, fields: [
    "ayah.nama", "ayah.nik", "ayah.tahunLahir", "ayah.pendidikan", "ayah.pekerjaan", "ayah.penghasilan", "ayah.pendidikanLainnya", "ayah.pekerjaanLainnya"
  ] as FieldPath<RegistrationFormData>[] },
  { num: 3, title: "Data Ibu", Icon: UserIcon, fields: [
    "ibu.nama", "ibu.nik", "ibu.tahunLahir", "ibu.pendidikan", "ibu.pekerjaan", "ibu.penghasilan", "ibu.pendidikanLainnya", "ibu.pekerjaanLainnya"
  ] as FieldPath<RegistrationFormData>[] },
  { num: 4, title: "Data Wali", Icon: ShieldCheck, fields: [
     "wali.nama", "wali.nik", "wali.tahunLahir", "wali.pendidikan", "wali.pekerjaan", "wali.penghasilan", "wali.pendidikanLainnya", "wali.pekerjaanLainnya"
  ] as FieldPath<RegistrationFormData>[] },
  { num: 5, title: "Kontak", Icon: Phone, fields: ["nomorTeleponAyah", "nomorTeleponIbu", "nomorTeleponWali"] as FieldPath<RegistrationFormData>[] },
];

interface WilayahBase {
  code: string;
  name: string;
}
interface Wilayah extends WilayahBase {}
interface VillageWilayah extends WilayahBase {
  postal_code: string;
}
interface WilayahOption {
  value: string; // code
  label: string; // name
  postalCode?: string;
}


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
  const [stepCompletionStatus, setStepCompletionStatus] = useState<Record<number, boolean | undefined>>({});
  const [isAttemptingSubmit, setIsAttemptingSubmit] = useState(false);

  const [provinces, setProvinces] = useState<WilayahOption[]>([]);
  const [regencies, setRegencies] = useState<WilayahOption[]>([]);
  const [districts, setDistricts] = useState<WilayahOption[]>([]);
  const [villages, setVillages] = useState<WilayahOption[]>([]);

  const [provincesLoading, setProvincesLoading] = useState(false);
  const [regenciesLoading, setRegenciesLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [villagesLoading, setVillagesLoading] = useState(false);

  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | null>(null);
  const [selectedRegencyCode, setSelectedRegencyCode] = useState<string | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string | null>(null);

  const [isKodePosReadOnly, setIsKodePosReadOnly] = useState(false);
  
  const [provincePopoverOpen, setProvincePopoverOpen] = useState(false);
  const [regencyPopoverOpen, setRegencyPopoverOpen] = useState(false);
  const [districtPopoverOpen, setDistrictPopoverOpen] = useState(false);
  const [villagePopoverOpen, setVillagePopoverOpen] = useState(false);


  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur', 
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
      tempatTinggal: undefined,
      tempatTinggalLainnya: '',
      provinsi: '',
      kabupaten: '',
      kecamatan: '',
      desaKelurahan: '',
      dusun: '',
      rtRw: '',
      alamatJalan: '',
      kodePos: '',
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

  useEffect(() => {
    const fetchProvinces = async () => {
      setProvincesLoading(true);
      try {
        const response = await fetch('/api/wilayah/provinces');
        if (!response.ok) throw new Error('Gagal memuat provinsi. Status: ' + response.status);
        const responseData = await response.json();
        const data: Wilayah[] = responseData.data; 
        setProvinces(data.map(p => ({ value: p.code, label: p.name })));
      } catch (error) {
        console.error("Error fetching provinces:", error);
        toast({ title: "Error", description: `Gagal memuat data provinsi: ${(error as Error).message}`, variant: "destructive" });
        setProvinces([]);
      } finally {
        setProvincesLoading(false);
      }
    };
    fetchProvinces();
  }, [toast]);

  useEffect(() => {
    if (selectedProvinceCode) {
      const fetchRegencies = async () => {
        setRegenciesLoading(true);
        setRegencies([]);
        setDistricts([]);
        setVillages([]);
        form.setValue("kabupaten", "");
        form.setValue("kecamatan", "");
        form.setValue("desaKelurahan", "");
        form.setValue("kodePos", "");
        setIsKodePosReadOnly(false);
        try {
          const response = await fetch(`/api/wilayah/regencies/${selectedProvinceCode}`);
          if (!response.ok) throw new Error('Gagal memuat kabupaten/kota. Status: ' + response.status);
          const responseData = await response.json();
          const data: Wilayah[] = responseData.data; 
          setRegencies(data.map(r => ({ value: r.code, label: r.name })));
        } catch (error) {
          console.error("Error fetching regencies:", error);
          toast({ title: "Error", description: `Gagal memuat data kabupaten/kota: ${(error as Error).message}`, variant: "destructive" });
           setRegencies([]);
        } finally {
          setRegenciesLoading(false);
        }
      };
      fetchRegencies();
    } else {
      setRegencies([]);
      setDistricts([]);
      setVillages([]);
    }
  }, [selectedProvinceCode, toast, form]);

  useEffect(() => {
    if (selectedRegencyCode) {
      const fetchDistricts = async () => {
        setDistrictsLoading(true);
        setDistricts([]);
        setVillages([]);
        form.setValue("kecamatan", "");
        form.setValue("desaKelurahan", "");
        form.setValue("kodePos", "");
        setIsKodePosReadOnly(false);
        try {
          const response = await fetch(`/api/wilayah/districts/${selectedRegencyCode}`);
          if (!response.ok) throw new Error('Gagal memuat kecamatan. Status: ' + response.status);
          const responseData = await response.json();
          const data: Wilayah[] = responseData.data; 
          setDistricts(data.map(d => ({ value: d.code, label: d.name })));
        } catch (error) {
          console.error("Error fetching districts:", error);
          toast({ title: "Error", description: `Gagal memuat data kecamatan: ${(error as Error).message}`, variant: "destructive" });
          setDistricts([]);
        } finally {
          setDistrictsLoading(false);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setVillages([]);
    }
  }, [selectedRegencyCode, toast, form]);

  useEffect(() => {
    if (selectedDistrictCode) {
      const fetchVillages = async () => {
        setVillagesLoading(true);
        setVillages([]);
        form.setValue("desaKelurahan", "");
        form.setValue("kodePos", "");
        setIsKodePosReadOnly(false);
        try {
          const response = await fetch(`/api/wilayah/villages/${selectedDistrictCode}`);
           if (!response.ok) throw new Error('Gagal memuat desa/kelurahan. Status: ' + response.status);
          const responseData = await response.json();
          const data: VillageWilayah[] = responseData.data; 
          setVillages(data.map(v => ({ value: v.code, label: v.name, postalCode: v.postal_code })));
        } catch (error) {
          console.error("Error fetching villages:", error);
          toast({ title: "Error", description: `Gagal memuat data desa/kelurahan: ${(error as Error).message}`, variant: "destructive" });
          setVillages([]);
        } finally {
          setVillagesLoading(false);
        }
      };
      fetchVillages();
    } else {
      setVillages([]);
    }
  }, [selectedDistrictCode, toast, form]);


  const getFieldsForStep = (step: number): FieldPath<RegistrationFormData>[] => {
    const stepData = stepsData.find(s => s.num === step);
    return stepData?.fields || [];
  };

  const validateStep = async (stepNumber: number): Promise<boolean> => {
    const fieldsToValidate = getFieldsForStep(stepNumber);
    if (fieldsToValidate.length === 0) return true;

    await form.trigger(fieldsToValidate);

    let isStepValid = true;
    // Custom logic for step 1 if needed, otherwise general check
    if (stepNumber === 1) {
      isStepValid = !fieldsToValidate.some(field => {
          const error = getFieldError(field, form.formState.errors);
          // Special conditions for conditional fields
          if (field === "agamaLainnya" && form.getValues("agama") !== "Lainnya") return false;
          if (field === "tempatTinggalLainnya" && form.getValues("tempatTinggal") !== "Lainnya") return false;
          if (field === "modaTransportasiLainnya" && !form.getValues("modaTransportasi").includes("lainnya")) return false;
          if (field === "alamatJalan") return false; // alamatJalan is optional
          return !!error;
      });
    } else if (stepNumber === 2) { // Ayah
        const ayahData = form.getValues().ayah;
        // Only validate if 'nama' is filled, otherwise considered optional step (unless submitting)
        const validationResult = requiredParentSchema.safeParse(ayahData);
        isStepValid = validationResult.success;

        if(!isStepValid && validationResult.error) {
            // Set errors manually for RHF to pick up
            validationResult.error.errors.forEach(err => {
                const path = `ayah.${err.path.join(".")}` as FieldPath<RegistrationFormData>;
                 form.setError(path, { type: 'manual', message: err.message });
            });
        } else if (isStepValid ) {
            // Clear errors if step becomes valid
            const ayahFields = getFieldsForStep(stepNumber);
            ayahFields.forEach(field => form.clearErrors(field));
        }
    } else if (stepNumber === 3) { // Ibu
        const ibuData = form.getValues().ibu;
        const validationResult = requiredParentSchema.safeParse(ibuData);
        isStepValid = validationResult.success;
         if(!isStepValid && validationResult.error) {
            validationResult.error.errors.forEach(err => {
                const path = `ibu.${err.path.join(".")}` as FieldPath<RegistrationFormData>;
                form.setError(path, { type: 'manual', message: err.message });
            });
        } else if (isStepValid) {
            const ibuFields = getFieldsForStep(stepNumber);
            ibuFields.forEach(field => form.clearErrors(field));
        }
    } else if (stepNumber === 4) { // Wali
        const waliData = form.getValues().wali;
        // Wali is also validated using requiredParentSchema (nama is mandatory)
        const validationResult = requiredParentSchema.safeParse(waliData);
        isStepValid = validationResult.success;
         if(!isStepValid && validationResult.error) {
            validationResult.error.errors.forEach(err => {
                const path = `wali.${err.path.join(".")}` as FieldPath<RegistrationFormData>;
                form.setError(path, { type: 'manual', message: err.message });
            });
        } else if (isStepValid) {
            const waliFields = getFieldsForStep(stepNumber);
            waliFields.forEach(field => form.clearErrors(field));
        }
    } else if (stepNumber === 5) { // Kontak
        // This step's validation depends on at least one phone number being present and valid if present
        const contactData = form.getValues();
        const atLeastOnePhone = !!contactData.nomorTeleponAyah || !!contactData.nomorTeleponIbu || !!contactData.nomorTeleponWali;

        if (!atLeastOnePhone) {
            // This error is primarily for submission. For step navigation, don't block.
            // But for visual feedback, it's invalid if no phone.
            form.setError("nomorTeleponAyah", { type: "manual", message: "Minimal satu nomor telepon (Ayah, Ibu, atau Wali) wajib diisi." });
            isStepValid = false;
        } else {
            // Clear the general "at least one phone" error if one is now provided
             if (form.formState.errors.nomorTeleponAyah?.type === 'manual' && form.formState.errors.nomorTeleponAyah?.message?.startsWith("Minimal satu nomor")) {
                form.clearErrors("nomorTeleponAyah");
            }
            // Validate individual phone numbers if they are filled
            const phoneFieldsToValidate: FieldPath<RegistrationFormData>[] = [];
            if (contactData.nomorTeleponAyah) phoneFieldsToValidate.push("nomorTeleponAyah");
            if (contactData.nomorTeleponIbu) phoneFieldsToValidate.push("nomorTeleponIbu");
            if (contactData.nomorTeleponWali) phoneFieldsToValidate.push("nomorTeleponWali");
            
            if (phoneFieldsToValidate.length > 0) {
              await form.trigger(phoneFieldsToValidate);
              // Check for errors on the triggered fields
              isStepValid = !phoneFieldsToValidate.some(field => !!getFieldError(field, form.formState.errors));
            } else {
              isStepValid = true; // No phones filled, but at least one was required (this path implies one IS filled but maybe got cleared)
                                   // This logic path (else part) might need refinement based on exact desired behavior for step 5 when navigating away vs submitting.
                                   // For submission, the `superRefine` in Zod handles the "at least one phone" globally.
                                   // For step navigation, if all are empty, it's invalid. If one is filled and valid, it's valid.
            }
        }
    }
    return isStepValid;
  };


  const processStep = async (action: 'next' | 'prev' | 'jumpTo', targetStep?: number) => {
    setIsAttemptingSubmit(false); 

    const stepBeingLeft = currentStep;
    const isStepBeingLeftValid = await validateStep(stepBeingLeft);
    setStepCompletionStatus(prev => ({ ...prev, [stepBeingLeft]: isStepBeingLeftValid }));

    if (action === 'next') {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(prev => prev + 1);
      }
    } else if (action === 'prev') {
      if (currentStep > 1) {
        setCurrentStep(prev => prev - 1);
      }
    } else if (action === 'jumpTo' && targetStep !== undefined) {
        setCurrentStep(targetStep);
    }
  };


 const onFormSubmit = async (data: RegistrationFormData) => {
    if (!isAttemptingSubmit) {
      return; // Not a true submit attempt, likely RHF background validation
    }

    let allStepsValid = true;
    const newCompletionStatus: Record<number, boolean | undefined> = {};
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      const isValid = await validateStep(i);
      newCompletionStatus[i] = isValid;
      if (!isValid) {
        allStepsValid = false;
      }
    }
    setStepCompletionStatus(newCompletionStatus);

    if (!allStepsValid) {
      const firstErrorStep = Object.entries(newCompletionStatus).find(([_, valid]) => !valid)?.[0];
      if (firstErrorStep) {
        setCurrentStep(parseInt(firstErrorStep, 10));
      }
      toast({
        title: "Formulir Belum Lengkap",
        description: "Mohon periksa kembali isian Anda pada langkah yang ditandai.",
        variant: "destructive",
      });
    } else {
      console.log("Form submitted successfully:", data);
      toast({
        title: "Pendaftaran Terkirim!",
        description: "Data Anda telah berhasil direkam.",
      });
    }
    setIsAttemptingSubmit(false); 
  };

  const onFormError = async (errors: FieldErrors<RegistrationFormData>) => {
    if (!isAttemptingSubmit) {
       return; // Not a true submit attempt
    }
    
    console.log("Form errors on submit (from RHF):", errors);
    toast({
      title: "Formulir Belum Lengkap",
      description: "Mohon periksa kembali isian Anda pada langkah yang ditandai.",
      variant: "destructive",
    });

    const newCompletionStatus: Record<number, boolean | undefined> = {};
    let firstErrorStep = TOTAL_STEPS + 1; 

    for (let i = 1; i <= TOTAL_STEPS; i++) {
      const isStepCurrentlyValid = await validateStep(i); 
      newCompletionStatus[i] = isStepCurrentlyValid;
      if (!isStepCurrentlyValid && i < firstErrorStep) {
        firstErrorStep = i;
      }
    }
    setStepCompletionStatus(newCompletionStatus);

    if (firstErrorStep <= TOTAL_STEPS) {
      setCurrentStep(firstErrorStep);
    }
    setIsAttemptingSubmit(false); 
  };
  
  const renderStepIndicators = () => {
    return (
        <div className="grid grid-cols-5 gap-1 rounded-md border shadow-sm p-0.5">
            {stepsData.map((step) => {
            const isCurrent = currentStep === step.num;
            const validationState = stepCompletionStatus[step.num];
            const successfullyValidated = validationState === true;
            const attemptedAndInvalid = validationState === false; 
            const StepIcon = step.Icon;

            return (
                <div
                key={step.num}
                className={cn(
                    "flex flex-col items-center justify-center p-1 rounded-lg border-2 cursor-pointer transition-colors text-center relative shadow-sm hover:border-primary/70",
                    isCurrent
                    ? (attemptedAndInvalid 
                        ? "bg-primary text-primary-foreground border-destructive ring-2 ring-destructive ring-offset-background"
                        : "bg-primary text-primary-foreground border-primary-foreground ring-2 ring-primary ring-offset-background") 
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
                {(successfullyValidated) && (
                    <Check className="w-4 h-4 absolute top-0.5 right-0.5 text-green-600" strokeWidth={3} />
                )}
                {(attemptedAndInvalid) && (
                    <XIcon className="w-4 h-4 absolute top-0.5 right-0.5 text-destructive" strokeWidth={3} />
                )}

                <StepIcon className={cn(
                    "w-5 h-5 mb-0.5",
                    isCurrent ? "text-primary-foreground" : 
                    attemptedAndInvalid ? "text-destructive" : 
                    successfullyValidated ? "text-green-600" : 
                    "text-primary" 
                )} />
                <span className={cn(
                    "text-xs leading-tight font-medium",
                    isCurrent ? "text-primary-foreground" :
                    attemptedAndInvalid ? "text-destructive" :
                    successfullyValidated ? "text-green-700" :
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
    const description = "Data Wali wajib diisi. Jika Ayah/Ibu adalah penanggung jawab, salin datanya. Jika diasuh kerabat lain (kakek, nenek, paman, bibi, dsb), isikan data wali yang sebenarnya.";


    return (
      <Card className="w-full shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-center">{`Data ${title}`}</CardTitle>
          {parentType === 'wali' && (
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
                  <Input
                    placeholder={`Masukkan nama ${title.toLowerCase()}`}
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
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
      <form onSubmit={form.handleSubmit(onFormSubmit, onFormError)} className="w-full max-w-3xl p-4 md:p-0">
        <div className="sticky top-0 z-30 bg-background py-4 shadow-md mb-8">
           {renderStepIndicators()}
        </div>

        <div className="space-y-8">
            {currentStep === 1 && (
            <Card className="w-full shadow-lg">
                <CardHeader>
                <CardTitle className="font-headline text-xl text-center">Identitas Peserta Didik</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                <FormField control={form.control} name="namaLengkap" render={({ field }) => (
                    <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input
                    placeholder="Sesuai Akta Kelahiran"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="namaPanggilan" render={({ field }) => (
                    <FormItem><FormLabel>Nama Panggilan</FormLabel><FormControl><Input
                    placeholder="Nama panggilan anda"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="jenisKelamin" render={({ field }) => (
                    <FormItem><FormLabel>Jenis Kelamin</FormLabel><Select onValueChange={field.onChange} value={field.value ?? undefined}><FormControl><SelectTrigger><SelectValue placeholder="Pilih jenis kelamin" /></SelectTrigger></FormControl><SelectContent>{jenisKelaminOptions.map(jk => <SelectItem key={jk} value={jk}>{jk}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField
                    control={form.control}
                    name="nisn"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>NISN (Nomor Induk Siswa Nasional)</FormLabel>
                        <FormControl>
                            <IMaskInput
                            mask="0000000000"
                            lazy={false}
                            placeholder="10 digit NISN"
                            className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", getFieldError('nisn', form.formState.errors) && "border-destructive")}
                            value={field.value ?? ''}
                            unmask={true}
                            onAccept={(value) => field.onChange(value)}
                            onBlur={field.onBlur}
                            inputRef={field.ref}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="nikSiswa"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>NIK (Nomor Induk Kependudukan)</FormLabel>
                        <FormControl>
                            <IMaskInput
                            mask="0000000000000000"
                            lazy={false}
                            placeholder="16 digit NIK (sesuai Kartu Keluarga)"
                            className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", getFieldError('nikSiswa', form.formState.errors) && "border-destructive")}
                            value={field.value ?? ''}
                            unmask={true}
                            onAccept={(value) => field.onChange(value)}
                            onBlur={field.onBlur}
                            inputRef={field.ref}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="tempatLahir" render={({ field }) => (
                    <FormItem><FormLabel>Tempat Lahir</FormLabel><FormControl><Input
                    placeholder="Kota/Kabupaten kelahiran"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField
                    control={form.control}
                    name="tanggalLahir"
                    render={({ field, fieldState }) => (
                    <FormItem className="flex flex-col">
                        <CustomDatePicker
                            id="tanggalLahir"
                            label="Tanggal Lahir"
                            value={field.value}
                            onDateChange={(dateStr) => field.onChange(dateStr)}
                            ariaInvalid={!!fieldState.error}
                            disabled={field.disabled}
                        />
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField control={form.control} name="agama" render={({ field }) => (
                    <FormItem><FormLabel>Agama</FormLabel><Select onValueChange={field.onChange} value={field.value ?? undefined}><FormControl><SelectTrigger><SelectValue placeholder="Pilih agama" /></SelectTrigger></FormControl><SelectContent>{agamaOptionsList.map(ag => <SelectItem key={ag} value={ag}>{ag}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                {form.watch('agama') === 'Lainnya' && (
                    <FormField control={form.control} name="agamaLainnya" render={({ field }) => (
                        <FormItem><FormLabel>Detail Agama Lainnya</FormLabel><FormControl><Input placeholder="Sebutkan agama lainnya" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                )}
                <FormField control={form.control} name="anakKe" render={({ field }) => (
                    <FormItem><FormLabel>Anak Keberapa</FormLabel><FormControl><Input type="number" min="1" placeholder="Contoh: 1" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="jumlahSaudaraKandung" render={({ field }) => (
                    <FormItem><FormLabel>Jumlah Saudara Kandung</FormLabel><FormControl><Input type="number" min="0" placeholder="Isi 0 jika tidak punya" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>
                )} />
                
                <Separator className="my-4" />
                <p className="font-medium text-center">Alamat Tempat Tinggal</p>

                <FormField control={form.control} name="tempatTinggal" render={({ field }) => (
                    <FormItem><FormLabel>Tempat Tinggal Saat Ini</FormLabel><Select onValueChange={field.onChange} value={field.value ?? undefined}><FormControl><SelectTrigger><SelectValue placeholder="Pilih tempat tinggal" /></SelectTrigger></FormControl><SelectContent>{tempatTinggalOptionsList.map(tt => <SelectItem key={tt} value={tt}>{tt}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                {form.watch('tempatTinggal') === 'Lainnya' && (
                    <FormField control={form.control} name="tempatTinggalLainnya" render={({ field }) => (
                        <FormItem><FormLabel>Detail Tempat Tinggal Lainnya</FormLabel><FormControl><Input placeholder="Sebutkan tempat tinggal lainnya" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                )}
                
                <FormField
                    control={form.control}
                    name="provinsi"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Provinsi</FormLabel>
                        <Popover open={provincePopoverOpen} onOpenChange={setProvincePopoverOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant="outline"
                                role="combobox"
                                className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                disabled={provincesLoading || provinces.length === 0}
                            >
                                {field.value ? provinces.find(p => p.label === field.value)?.label : (provincesLoading ? "Memuat..." : "Pilih Provinsi")}
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
                                    onSelect={(currentValue) => {
                                        const selectedOption = provinces.find(p => p.label.toLowerCase() === currentValue.toLowerCase());
                                        form.setValue("provinsi", selectedOption ? selectedOption.label : "");
                                        setSelectedProvinceCode(selectedOption ? selectedOption.value : null);
                                        form.setValue("kabupaten", "");
                                        setSelectedRegencyCode(null);
                                        form.setValue("kecamatan", "");
                                        setSelectedDistrictCode(null);
                                        form.setValue("desaKelurahan", "");
                                        form.setValue("kodePos", "");
                                        setIsKodePosReadOnly(false);
                                        setRegencies([]);
                                        setDistricts([]);
                                        setVillages([]);
                                        setProvincePopoverOpen(false);
                                        form.trigger("provinsi");
                                    }}
                                    >
                                    <CheckIcon className={cn("mr-2 h-4 w-4", province.label === field.value ? "opacity-100" : "opacity-0")} />
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
                    control={form.control}
                    name="kabupaten"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Kabupaten/Kota</FormLabel>
                        <Popover open={regencyPopoverOpen} onOpenChange={setRegencyPopoverOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant="outline"
                                role="combobox"
                                disabled={!selectedProvinceCode || regenciesLoading || regencies.length === 0}
                                className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                            >
                                {field.value ? regencies.find(r => r.label === field.value)?.label : (regenciesLoading ? "Memuat..." : "Pilih Kabupaten/Kota")}
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
                                    onSelect={(currentValue) => {
                                        const selectedOption = regencies.find(r => r.label.toLowerCase() === currentValue.toLowerCase());
                                        form.setValue("kabupaten", selectedOption ? selectedOption.label : "");
                                        setSelectedRegencyCode(selectedOption ? selectedOption.value : null);
                                        form.setValue("kecamatan", "");
                                        setSelectedDistrictCode(null);
                                        form.setValue("desaKelurahan", "");
                                        form.setValue("kodePos", "");
                                        setIsKodePosReadOnly(false);
                                        setDistricts([]);
                                        setVillages([]);
                                        setRegencyPopoverOpen(false);
                                        form.trigger("kabupaten");
                                    }}
                                    >
                                    <CheckIcon className={cn("mr-2 h-4 w-4", regency.label === field.value ? "opacity-100" : "opacity-0")} />
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
                    control={form.control}
                    name="kecamatan"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Kecamatan</FormLabel>
                        <Popover open={districtPopoverOpen} onOpenChange={setDistrictPopoverOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant="outline"
                                role="combobox"
                                disabled={!selectedRegencyCode || districtsLoading || districts.length === 0}
                                className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                            >
                                {field.value ? districts.find(d => d.label === field.value)?.label : (districtsLoading ? "Memuat..." : "Pilih Kecamatan")}
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
                                    onSelect={(currentValue) => {
                                        const selectedOption = districts.find(d => d.label.toLowerCase() === currentValue.toLowerCase());
                                        form.setValue("kecamatan", selectedOption ? selectedOption.label : "");
                                        setSelectedDistrictCode(selectedOption ? selectedOption.value : null);
                                        form.setValue("desaKelurahan", "");
                                        form.setValue("kodePos", "");
                                        setIsKodePosReadOnly(false);
                                        setVillages([]);
                                        setDistrictPopoverOpen(false);
                                        form.trigger("kecamatan");
                                    }}
                                    >
                                    <CheckIcon className={cn("mr-2 h-4 w-4", district.label === field.value ? "opacity-100" : "opacity-0")} />
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
                    control={form.control}
                    name="desaKelurahan"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Desa/Kelurahan</FormLabel>
                        <Popover open={villagePopoverOpen} onOpenChange={setVillagePopoverOpen}>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant="outline"
                                role="combobox"
                                disabled={!selectedDistrictCode || villagesLoading || villages.length === 0}
                                className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                            >
                                {field.value ? villages.find(v => v.label === field.value)?.label : (villagesLoading ? "Memuat..." : "Pilih Desa/Kelurahan")}
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
                                    onSelect={(currentValue) => {
                                        const selectedOption = villages.find(v => v.label.toLowerCase() === currentValue.toLowerCase());
                                        form.setValue("desaKelurahan", selectedOption ? selectedOption.label : "");
                                        if (selectedOption && selectedOption.postalCode) {
                                        form.setValue("kodePos", selectedOption.postalCode);
                                        setIsKodePosReadOnly(true);
                                        } else {
                                        form.setValue("kodePos", "");
                                        setIsKodePosReadOnly(false);
                                        }
                                        setVillagePopoverOpen(false);
                                        form.trigger("desaKelurahan");
                                        form.trigger("kodePos");
                                    }}
                                    >
                                    <CheckIcon className={cn("mr-2 h-4 w-4", village.label === field.value ? "opacity-100" : "opacity-0")} />
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

                <FormField control={form.control} name="dusun" render={({ field }) => (
                    <FormItem><FormLabel>Dusun</FormLabel><FormControl><Input
                    placeholder="Nama dusun/dukuh"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField
                    control={form.control}
                    name="rtRw"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>RT/RW</FormLabel>
                        <FormControl>
                            <IMaskInput
                            mask="000/000"
                            lazy={false}
                            placeholder="Contoh: 001/002"
                            className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", getFieldError('rtRw', form.formState.errors) && "border-destructive")}
                            value={field.value ?? ''}
                            unmask={true}
                            onAccept={(value) => field.onChange(value)}
                            onBlur={field.onBlur}
                            inputRef={field.ref}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="alamatJalan" render={({ field }) => (
                    <FormItem><FormLabel>Alamat Jalan</FormLabel><FormControl><Input placeholder="Contoh: Jl. Kenanga No. 27 (Bisa nama jalan saja)" {...field} value={field.value ?? ''} /></FormControl><FormDescription>Kosongkan jika tidak tahu nama jalan.</FormDescription><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="kodePos" render={({ field }) => (
                    <FormItem><FormLabel>Kode Pos</FormLabel><FormControl><Input type="text" inputMode="numeric" maxLength={5} placeholder="5 digit kode pos" {...field} value={field.value ?? ''} readOnly={isKodePosReadOnly} /></FormControl><FormMessage /></FormItem>
                )} />
                <Separator className="my-4" />
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
                <CardFooter>
                    <FormMessage>{form.formState.errors.nomorTeleponAyah?.message && form.formState.errors.nomorTeleponAyah.type === 'manual' ? form.formState.errors.nomorTeleponAyah.message : ""}</FormMessage>
                </CardFooter>
            </Card>
            )}
        </div>

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
            <Button 
              type="submit" 
              onClick={() => setIsAttemptingSubmit(true)} 
              className="w-full md:w-auto text-lg py-6 ml-auto" 
              disabled={form.formState.isSubmitting || form.formState.isSubmitSuccessful}
            >
              {form.formState.isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}
            </Button>
          )}
        </CardFooter>
      </form>
    </Form>
  );
}
