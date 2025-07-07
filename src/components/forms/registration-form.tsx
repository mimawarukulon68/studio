
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, type FieldPath, type FieldErrors, type FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Send, UserRound, User as UserIcon, ShieldCheck, XIcon, CheckIcon, FileCheck2, Loader2 } from 'lucide-react';
import {
  registrationSchema,
  type RegistrationFormData,
} from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Step1Siswa } from './registration-steps/step-1-siswa';
import { Step2Ayah } from './registration-steps/step-2-ayah';
import { Step3Ibu } from './registration-steps/step-3-ibu';
import { Step4Wali } from './registration-steps/step-4-wali';
import { Step5Review } from './registration-steps/step-5-review';


const TOTAL_STEPS = 5;

const stepsData = [
  {
    num: 1, title: "Identitas Siswa", Icon: UserRound, fields: [
      "siswa.namaLengkap", "siswa.namaPanggilan", "siswa.jenisKelamin", "siswa.nisn", "siswa.nikSiswa",
      "siswa.tempatLahir", "siswa.tanggalLahir", "siswa.agama", "siswa.anakKe", "siswa.jumlahSaudaraKandung",
      "siswa.tempatTinggal", "siswa.provinsi", "siswa.kabupaten", "siswa.kecamatan", "siswa.desaKelurahan", "siswa.dusun", "siswa.rtRw", "siswa.alamatJalan", "siswa.kodePos",
      "siswa.modaTransportasi", "siswa.agamaLainnya", "siswa.tempatTinggalLainnya", "siswa.modaTransportasiLainnya"
    ] as FieldPath<RegistrationFormData>[]
  },
  {
    num: 2, title: "Data Ayah", Icon: UserIcon, fields: [
      "ayah.isDeceased", "ayah.nama", "ayah.nik", "ayah.tahunLahir", "ayah.pendidikan", "ayah.pekerjaan", "ayah.penghasilan", "ayah.pendidikanLainnya", "ayah.pekerjaanLainnya", "ayah.nomorTelepon"
    ] as FieldPath<RegistrationFormData>[]
  },
  {
    num: 3, title: "Data Ibu", Icon: UserIcon, fields: [
      "ibu.isDeceased", "ibu.nama", "ibu.nik", "ibu.tahunLahir", "ibu.pendidikan", "ibu.pekerjaan", "ibu.penghasilan", "ibu.pendidikanLainnya", "ibu.pekerjaanLainnya", "ibu.nomorTelepon"
    ] as FieldPath<RegistrationFormData>[]
  },
  {
    num: 4, title: "Data Wali", Icon: ShieldCheck, fields: [
      "wali.hubungan", "wali.hubunganLainnya", "wali.nama", "wali.nik", "wali.tahunLahir", "wali.pendidikan", "wali.pekerjaan", "wali.penghasilan", "wali.pendidikanLainnya", "wali.pekerjaanLainnya", "wali.nomorTelepon"
    ] as FieldPath<RegistrationFormData>[]
  },
  { num: 5, title: "Review", Icon: FileCheck2, fields: [] },
];

interface Wilayah {
  code: string;
  name: string;
}
interface VillageWilayah extends Wilayah {
  postal_code: string;
}
export interface WilayahOption {
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
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);

  const [provinces, setProvinces] = useState<WilayahOption[]>([]);
  const [regencies, setRegencies] = useState<WilayahOption[]>([]);
  const [districts, setDistricts] = useState<WilayahOption[]>([]);
  const [villages, setVillages] = useState<WilayahOption[]>([]);

  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [villagesLoading, setVillagesLoading] = useState(false);

  const [isKodePosReadOnly, setIsKodePosReadOnly] = useState(false);

  const [districtPopoverOpen, setDistrictPopoverOpen] = useState(false);
  const [villagePopoverOpen, setVillagePopoverOpen] = useState(false);

  const [nisnIsFocused, setNisnIsFocused] = useState(false);
  const [nikIsFocused, setNikIsFocused] = useState(false);
  const [rtRwIsFocused, setRtRwIsFocused] = useState(false);
  const [ayahNikIsFocused, setAyahNikIsFocused] = useState(false);
  const [ibuNikIsFocused, setIbuNikIsFocused] = useState(false);
  const [waliNikIsFocused, setWaliNikIsFocused] = useState(false);


  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onBlur',
    defaultValues: {
      siswa: {
        namaLengkap: '',
        namaPanggilan: '',
        nisn: '',
        nikSiswa: '',
        tempatLahir: '',
        tanggalLahir: undefined,
        agama: 'Islam',
        agamaLainnya: '',
        anakKe: undefined,
        jumlahSaudaraKandung: undefined,
        tempatTinggal: undefined,
        tempatTinggalLainnya: '',
        provinsi: '35',
        kabupaten: '3524',
        kecamatan: '',
        desaKelurahan: '',
        dusun: '',
        rtRw: '',
        alamatJalan: '',
        kodePos: '',
        modaTransportasi: [],
        modaTransportasiLainnya: '',
      },
      ayah: {
        isDeceased: false,
        nama: '',
        nik: '',
        tahunLahir: undefined,
        pendidikan: undefined,
        pendidikanLainnya: '',
        pekerjaan: undefined,
        pekerjaanLainnya: '',
        penghasilan: undefined,
        nomorTelepon: '',
      },
      ibu: {
        isDeceased: false,
        nama: '',
        nik: '',
        tahunLahir: undefined,
        pendidikan: undefined,
        pendidikanLainnya: '',
        pekerjaan: undefined,
        pekerjaanLainnya: '',
        penghasilan: undefined,
        nomorTelepon: '',
      },
      wali: {
        hubungan: undefined,
        hubunganLainnya: '',
        nama: '',
        nik: '',
        tahunLahir: undefined,
        pendidikan: undefined,
        pendidikanLainnya: '',
        pekerjaan: undefined,
        pekerjaanLainnya: '',
        penghasilan: undefined,
        nomorTelepon: '',
      },
    },
  });

  const isAyahDeceased = form.watch('ayah.isDeceased');
  const isIbuDeceased = form.watch('ibu.isDeceased');
  const isWaliRequired = isAyahDeceased && isIbuDeceased;

  useEffect(() => {
    if (isAyahDeceased) {
        form.setValue('ayah.pekerjaan', '-', { shouldValidate: true });
        form.setValue('ayah.penghasilan', '-', { shouldValidate: true });
        form.setValue('ayah.nomorTelepon', '', { shouldValidate: true }); 
        const fieldsToClear: FieldPath<RegistrationFormData>[] = ['ayah.nik', 'ayah.tahunLahir', 'ayah.pendidikan', 'ayah.pendidikanLainnya', 'ayah.pekerjaanLainnya'];
        fieldsToClear.forEach(field => form.clearErrors(field));
    } else {
        if (form.getValues('ayah.pekerjaan') === '-') {
            form.setValue('ayah.pekerjaan', '');
        }
        if (form.getValues('ayah.penghasilan') === '-') {
            form.setValue('ayah.penghasilan', '');
        }
    }
}, [isAyahDeceased, form]);

useEffect(() => {
    if (isIbuDeceased) {
        form.setValue('ibu.pekerjaan', '-', { shouldValidate: true });
        form.setValue('ibu.penghasilan', '-', { shouldValidate: true });
        form.setValue('ibu.nomorTelepon', '', { shouldValidate: true });
        const fieldsToClear: FieldPath<RegistrationFormData>[] = ['ibu.nik', 'ibu.tahunLahir', 'ibu.pendidikan', 'ibu.pendidikanLainnya', 'ibu.pekerjaanLainnya'];
        fieldsToClear.forEach(field => form.clearErrors(field));
    } else {
        if (form.getValues('ibu.pekerjaan') === '-') {
            form.setValue('ibu.pekerjaan', '');
        }
        if (form.getValues('ibu.penghasilan') === '-') {
            form.setValue('ibu.penghasilan', '');
        }
    }
}, [isIbuDeceased, form]);


  useEffect(() => {
    if (isWaliRequired) {
      const waliFields = getFieldsForStep(4);
      form.trigger(waliFields);
    }
  }, [isWaliRequired, form]);


  const nisnValue = form.watch("siswa.nisn");
  const nikValue = form.watch("siswa.nikSiswa");
  const rtRwValue = form.watch("siswa.rtRw");
  const ayahNikValue = form.watch("ayah.nik");
  const ibuNikValue = form.watch("ibu.nik");
  const waliNikValue = form.watch("wali.nik");
  const selectedRegencyCode = form.watch("siswa.kabupaten");
  const selectedDistrictCode = form.watch("siswa.kecamatan");

  const hubunganWali = form.watch('wali.hubungan');

  useEffect(() => {
    const copyParentDataToWali = (parentType: 'ayah' | 'ibu') => {
      const parentData = form.getValues(parentType);
      form.setValue('wali.nama', parentData.nama || '', { shouldValidate: true });
      form.setValue('wali.nik', parentData.nik || '', { shouldValidate: true });
      form.setValue('wali.tahunLahir', parentData.tahunLahir, { shouldValidate: true });
      form.setValue('wali.pendidikan', parentData.pendidikan, { shouldValidate: true });
      form.setValue('wali.pendidikanLainnya', parentData.pendidikanLainnya || '', { shouldValidate: true });
      form.setValue('wali.pekerjaan', parentData.pekerjaan, { shouldValidate: true });
      form.setValue('wali.pekerjaanLainnya', parentData.pekerjaanLainnya || '', { shouldValidate: true });
      form.setValue('wali.penghasilan', parentData.penghasilan, { shouldValidate: true });
      form.setValue('wali.nomorTelepon', parentData.nomorTelepon || '', { shouldValidate: true });
    }

    if (hubunganWali === 'Ayah Kandung') {
      copyParentDataToWali('ayah');
    } else if (hubunganWali === 'Ibu Kandung') {
      copyParentDataToWali('ibu');
    }
  }, [hubunganWali, form]);


  useEffect(() => {
    let isMounted = true;
    const fetchProvinces = async () => {
      try {
        const response = await fetch('/api/wilayah/provinces');
        if (!response.ok) throw new Error('Gagal memuat provinsi.');
        const jsonResponse = await response.json();
        if (!isMounted) return;
        const data = Array.isArray(jsonResponse) ? jsonResponse : [];
        setProvinces(data.map((p: Wilayah) => ({ value: p.code, label: p.name })));
      } catch (error) {
        console.error("Error fetching provinces:", error);
        if (isMounted) toast({ title: "Error", description: `Gagal memuat data provinsi.`, variant: "destructive" });
      }
    };
    fetchProvinces();
    return () => { isMounted = false; };
  }, [toast]);

  useEffect(() => {
    let isMounted = true;
    const fetchRegencies = async () => {
      try {
        const response = await fetch(`/api/wilayah/regencies/35`);
        if (!response.ok) throw new Error('Gagal memuat kabupaten/kota.');
        const jsonResponse = await response.json();
        if (!isMounted) return;
        const data = Array.isArray(jsonResponse) ? jsonResponse : [];
        setRegencies(data.map((r: Wilayah) => ({ value: r.code, label: r.name })));
      } catch (error) {
        console.error("Error fetching regencies:", error);
        if (isMounted) toast({ title: "Error", description: `Gagal memuat data kabupaten/kota.`, variant: "destructive" });
      }
    };
    fetchRegencies();
    return () => { isMounted = false; };
  }, [toast]);

  useEffect(() => {
    let isMounted = true;
    if (selectedRegencyCode) {
      const fetchDistricts = async () => {
        setDistrictsLoading(true);
        setDistricts([]);
        setVillages([]);
        form.setValue("siswa.kecamatan", "");
        form.setValue("siswa.desaKelurahan", "");
        form.setValue("siswa.kodePos", "");
        setIsKodePosReadOnly(false);
        try {
          const response = await fetch(`/api/wilayah/districts/${selectedRegencyCode}`);
          if (!response.ok) throw new Error('Gagal memuat kecamatan. Status: ' + response.status);
          const jsonResponse = await response.json();
          if (!isMounted) return;

          const data = Array.isArray(jsonResponse) ? jsonResponse : [];
          setDistricts(data.map((d: Wilayah) => ({ value: d.code, label: d.name })));
        } catch (error) {
          console.error("Error fetching districts:", error);
          if (isMounted) toast({ title: "Error", description: `Gagal memuat data kecamatan: ${(error as Error).message}`, variant: "destructive" });
          setDistricts([]);
        } finally {
          if (isMounted) setDistrictsLoading(false);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setVillages([]);
    }
    return () => { isMounted = false; };
  }, [selectedRegencyCode, toast, form]);

  useEffect(() => {
    let isMounted = true;
    if (selectedDistrictCode) {
      const fetchVillages = async () => {
        setVillagesLoading(true);
        setVillages([]);
        form.setValue("siswa.desaKelurahan", "");
        form.setValue("siswa.kodePos", "");
        setIsKodePosReadOnly(false);
        try {
          const response = await fetch(`/api/wilayah/villages/${selectedDistrictCode}`);
          if (!response.ok) throw new Error('Gagal memuat desa/kelurahan. Status: ' + response.status);
          const jsonResponse = await response.json();
          if (!isMounted) return;

          const data = Array.isArray(jsonResponse) ? jsonResponse : [];
          setVillages(data.map((v: VillageWilayah) => ({ value: v.code, label: v.name, postalCode: v.postal_code })));
        } catch (error) {
          console.error("Error fetching villages:", error);
          if (isMounted) toast({ title: "Error", description: `Gagal memuat data desa/kelurahan: ${(error as Error).message}`, variant: "destructive" });
          setVillages([]);
        } finally {
          if (isMounted) setVillagesLoading(false);
        }
      };
      fetchVillages();
    } else {
      setVillages([]);
    }
    return () => { isMounted = false; };
  }, [selectedDistrictCode, toast, form]);


  const getFieldsForStep = (step: number): FieldPath<RegistrationFormData>[] => {
    const stepData = stepsData.find(s => s.num === step);
    return stepData?.fields || [];
  };

  const validateStep = async (step: number): Promise<boolean> => {
    if (step === 5) return true;
    const fieldsToValidate = getFieldsForStep(step);
    if (fieldsToValidate.length === 0) return true;

    await form.trigger(fieldsToValidate);

    const hasError = fieldsToValidate.some(field => getFieldError(field, form.formState.errors));
    return !hasError;
  };


  const processStep = async (action: 'next' | 'prev' | 'jumpTo', targetStep?: number) => {
    setIsAttemptingSubmit(false);

    const stepBeingLeft = currentStep;
    const isStepBeingLeftValid = await validateStep(stepBeingLeft);
    setStepCompletionStatus(prev => ({ ...prev, [stepBeingLeft]: isStepBeingLeftValid }));

    switch (action) {
      case 'next':
          if (currentStep < TOTAL_STEPS) {
              setCurrentStep(currentStep + 1);
          }
          break;
      
      case 'prev':
          if (currentStep > 1) {
              setCurrentStep(currentStep - 1);
          }
          break;

      case 'jumpTo':
          if (targetStep !== undefined) {
              setCurrentStep(targetStep);
          }
          break;
    }
  };


  const onFormSubmit = async (data: RegistrationFormData) => {
    if (!isAttemptingSubmit) {
      return;
    }

    const validationResult = registrationSchema.safeParse(data);
    if (!validationResult.success) {
         toast({
            title: "Formulir Belum Lengkap",
            description: "Masih ada data yang belum valid. Mohon periksa kembali.",
            variant: "destructive",
        });
        setIsAttemptingSubmit(false);
        return;
    }

    const processedData = JSON.parse(JSON.stringify(data));

    const processObject = (obj: any) => {
      for (const key in obj) {
        if (obj[key] === '' || obj[key] === null || obj[key] === undefined) {
          obj[key] = '-';
        }
      }

      const processLainnyaField = (mainField: string, lainnyaField: string, lainnyaValue: string | string[]) => {
          const mainFieldValue = obj[mainField];
          const lainnyaFieldValue = obj[lainnyaField];

          if (Array.isArray(mainFieldValue) && mainFieldValue.includes('lainnya')) {
            const modaLainnyaText = lainnyaFieldValue || '';
            obj[mainField] = mainFieldValue.map((m: string) => 
                m === 'lainnya' ? `Lainnya: ${modaLainnyaText || '-'}` : m
            );
          } else if (typeof mainFieldValue === 'string' && mainFieldValue === lainnyaValue && lainnyaFieldValue) {
              obj[mainField] = `${mainFieldValue}: ${lainnyaFieldValue}`;
          }
          delete obj[lainnyaField];
      };

      processLainnyaField('agama', 'agamaLainnya', 'Lainnya');
      processLainnyaField('tempatTinggal', 'tempatTinggalLainnya', 'Lainnya');
      processLainnyaField('modaTransportasi', 'modaTransportasiLainnya', ['lainnya']);
      processLainnyaField('pendidikan', 'pendidikanLainnya', 'Lainnya');
      processLainnyaField('pekerjaan', 'pekerjaanLainnya', 'Lainnya');
      processLainnyaField('hubungan', 'hubunganLainnya', 'Lainnya (tuliskan)');

      return obj;
    };
    
    processedData.siswa = processObject(processedData.siswa);
    processedData.ayah = processObject(processedData.ayah);
    processedData.ibu = processObject(processedData.ibu);
    processedData.wali = processObject(processedData.wali);
    
    if (data.ayah.isDeceased && processedData.ayah.nama) {
        processedData.ayah.nama = `(Alm.) ${processedData.ayah.nama}`;
    }
    if (data.ibu.isDeceased && processedData.ibu.nama) {
        processedData.ibu.nama = `(Almh.) ${processedData.ibu.nama}`;
    }

    processedData.ayah.status = data.ayah.isDeceased ? 'meninggal' : 'hidup';
    delete processedData.ayah.isDeceased;
    
    processedData.ibu.status = data.ibu.isDeceased ? 'meninggal' : 'hidup';
    delete processedData.ibu.isDeceased;

    console.log("Form submitted successfully. Processed Data:", processedData);
    toast({
      title: "Pendaftaran Terkirim!",
      description: "Data Anda telah berhasil direkam.",
    });

    setIsSubmittedSuccessfully(true);
    setIsAttemptingSubmit(false);
  };

  const onFormError = async (errors: FieldErrors<RegistrationFormData>) => {
    if (!isAttemptingSubmit) {
      return;
    }

    console.log("Form errors on submit (from RHF):", errors);
    toast({
      title: "Formulir Belum Lengkap",
      description: "Mohon periksa kembali isian Anda pada langkah yang ditandai.",
      variant: "destructive",
    });

    const newCompletionStatus: Record<number, boolean | undefined> = {};
    let firstErrorStep = TOTAL_STEPS + 1;

    for (let i = 1; i < TOTAL_STEPS; i++) {
        const fieldsForStep = getFieldsForStep(i);
        const stepHasError = fieldsForStep.some(field => getFieldError(field, errors));
        
        let extraError = false;
        if (i === 2 && errors.ayah) extraError = true;
        if (i === 3 && errors.ibu) extraError = true;
        if (i === 4 && errors.wali) extraError = true;

        if (stepHasError || extraError) {
            newCompletionStatus[i] = false;
            if (i < firstErrorStep) {
                firstErrorStep = i;
            }
        } else {
            newCompletionStatus[i] = await validateStep(i);
        }
    }

    if (errors.root) {
        if (firstErrorStep > 2) firstErrorStep = 2;
        newCompletionStatus[2] = false;
        newCompletionStatus[3] = false;
        newCompletionStatus[4] = false;
    }


    setStepCompletionStatus(prev => ({ ...prev, ...newCompletionStatus }));

    if (firstErrorStep <= TOTAL_STEPS) {
      setCurrentStep(firstErrorStep);
    }
    setIsAttemptingSubmit(false);
  };

  const renderStepIndicators = () => {
    return (
      <div className="grid grid-cols-5 gap-1 rounded-md border shadow-sm p-1.5">
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
                "flex flex-col items-center justify-center p-1 rounded-lg border-2 cursor-pointer transition-colors text-center relative shadow-inner",
                isCurrent
                  ? attemptedAndInvalid
                    ? "bg-primary text-primary-foreground border-primary-foreground ring-2 ring-destructive ring-offset-background"
                    : "bg-primary text-primary-foreground border-primary-foreground ring-2 ring-primary ring-offset-background"
                  : successfullyValidated
                    ? "bg-card border-green-500 hover:bg-primary/5"
                    : attemptedAndInvalid
                      ? "bg-card border-destructive hover:bg-primary/5"
                      : "bg-card border-border hover:bg-primary/5"
              )}
              onClick={() => processStep('jumpTo', step.num)}
              title={step.title}
              aria-current={isCurrent ? "step" : undefined}
            >
              {(successfullyValidated && step.num < TOTAL_STEPS) && (
                <CheckIcon className="w-4 h-4 absolute top-0.5 right-0.5 text-green-600" strokeWidth={3} />
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


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit, onFormError)} className="w-full max-w-3xl p-2">
        <div className="sticky top-0 z-30 bg-background shadow-md mb-8 rounded-md">
          {renderStepIndicators()}
        </div>

        <div className="space-y-8">
          {currentStep === 1 && (
             <Step1Siswa
                control={form.control}
                formState={form.formState}
                setValue={form.setValue}
                trigger={form.trigger}
                watch={form.watch}
                getFieldError={getFieldError}
                districts={districts}
                villages={villages}
                districtsLoading={districtsLoading}
                villagesLoading={villagesLoading}
                isKodePosReadOnly={isKodePosReadOnly}
                setIsKodePosReadOnly={setIsKodePosReadOnly}
                districtPopoverOpen={districtPopoverOpen}
                setDistrictPopoverOpen={setDistrictPopoverOpen}
                villagePopoverOpen={villagePopoverOpen}
                setVillagePopoverOpen={setVillagePopoverOpen}
                nisnIsFocused={nisnIsFocused}
                setNisnIsFocused={setNisnIsFocused}
                nisnValue={nisnValue}
                nikIsFocused={nikIsFocused}
                setNikIsFocused={setNikIsFocused}
                nikValue={nikValue}
                rtRwIsFocused={rtRwIsFocused}
                setRtRwIsFocused={setRtRwIsFocused}
                rtRwValue={rtRwValue}
            />
          )}

          {currentStep === 2 && <Step2Ayah control={form.control} watch={form.watch} formState={form.formState} getFieldError={getFieldError} nikIsFocused={ayahNikIsFocused} setNikIsFocused={setAyahNikIsFocused} nikValue={ayahNikValue} />}
          {currentStep === 3 && <Step3Ibu control={form.control} watch={form.watch} formState={form.formState} getFieldError={getFieldError} nikIsFocused={ibuNikIsFocused} setNikIsFocused={setIbuNikIsFocused} nikValue={ibuNikValue} />}
          {currentStep === 4 && <Step4Wali control={form.control} watch={form.watch} formState={form.formState} getFieldError={getFieldError} isWaliRequired={isWaliRequired} nikIsFocused={waliNikIsFocused} setNikIsFocused={setWaliNikIsFocused} nikValue={waliNikValue} />}
          {currentStep === 5 && <Step5Review formData={form.getValues()} provinces={provinces} regencies={regencies} districts={districts} villages={villages}/>}
        </div>

        <CardFooter className="flex justify-between mt-8">
          {currentStep > 1 ? (
            <Button type="button" variant="outline" onClick={() => processStep('prev')} disabled={form.formState.isSubmitting || isSubmittedSuccessfully} className="gap-0">
              <ArrowLeft className="h-4 w-4" /> Sebelumnya
            </Button>
          ) : (<div />
          )}

          {currentStep < TOTAL_STEPS ? (
            <Button type="button" onClick={() => processStep('next')} disabled={form.formState.isSubmitting} className="ml-auto gap-0">
              Berikutnya <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              className="ml-auto gap-2"
              onClick={() => setIsAttemptingSubmit(true)}
              disabled={form.formState.isSubmitting || isSubmittedSuccessfully}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengirim...
                </>
              ) : isSubmittedSuccessfully ? (
                'Terkirim'
              ) : (
                <>
                  Kirim Pendaftaran
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </form>
    </Form>
  );
}
