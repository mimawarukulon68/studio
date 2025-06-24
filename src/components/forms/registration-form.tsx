
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, type FieldPath, type FieldErrors, type FieldError } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Send, UserRound, User as UserIcon, ShieldCheck, XIcon, ChevronsUpDown, CheckIcon, CalendarIcon, AlertCircle, FileCheck2 } from 'lucide-react';
import { IMaskInput } from 'react-imask';
import type IMask from 'imask';
import { format, parse, isValid as isDateValid } from 'date-fns';
import { id as localeID } from 'date-fns/locale/id';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  waliSchema,
  parentSchema,
  hubunganWaliOptionsList,
} from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const TOTAL_STEPS = 5;

const stepsData = [
  { num: 1, title: "Identitas Siswa", Icon: UserRound, fields: [
    "siswa.namaLengkap", "siswa.namaPanggilan", "siswa.jenisKelamin", "siswa.nisn", "siswa.nikSiswa",
    "siswa.tempatLahir", "siswa.tanggalLahir", "siswa.agama", "siswa.anakKe", "siswa.jumlahSaudaraKandung",
    "siswa.tempatTinggal", "siswa.provinsi", "siswa.kabupaten", "siswa.kecamatan", "siswa.desaKelurahan", "siswa.dusun", "siswa.rtRw", "siswa.alamatJalan", "siswa.kodePos",
    "siswa.modaTransportasi", "siswa.agamaLainnya", "siswa.tempatTinggalLainnya", "siswa.modaTransportasiLainnya"
  ] as FieldPath<RegistrationFormData>[] },
  { num: 2, title: "Data Ayah", Icon: UserIcon, fields: [
    "ayah.isDeceased", "ayah.nama", "ayah.nik", "ayah.tahunLahir", "ayah.pendidikan", "ayah.pekerjaan", "ayah.penghasilan", "ayah.pendidikanLainnya", "ayah.pekerjaanLainnya", "ayah.nomorTelepon"
  ] as FieldPath<RegistrationFormData>[] },
  { num: 3, title: "Data Ibu", Icon: UserIcon, fields: [
    "ibu.isDeceased", "ibu.nama", "ibu.nik", "ibu.tahunLahir", "ibu.pendidikan", "ibu.pekerjaan", "ibu.penghasilan", "ibu.pendidikanLainnya", "ibu.pekerjaanLainnya", "ibu.nomorTelepon"
  ] as FieldPath<RegistrationFormData>[] },
  { num: 4, title: "Data Wali", Icon: ShieldCheck, fields: [
     "wali.hubungan", "wali.hubunganLainnya", "wali.nama", "wali.nik", "wali.tahunLahir", "wali.pendidikan", "wali.pekerjaan", "wali.penghasilan", "wali.pendidikanLainnya", "wali.pekerjaanLainnya", "wali.nomorTelepon"
  ] as FieldPath<RegistrationFormData>[] },
  { num: 5, title: "Review", Icon: FileCheck2, fields: [] },
];

interface Wilayah {
  code: string;
  name: string;
}
interface VillageWilayah extends Wilayah {
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
  const [isSubmittedSuccessfully, setIsSubmittedSuccessfully] = useState(false);

  const [provinces, setProvinces] = useState<WilayahOption[]>([]);
  const [regencies, setRegencies] = useState<WilayahOption[]>(([]));
  const [districts, setDistricts] = useState<WilayahOption[]>([]);
  const [villages, setVillages] = useState<WilayahOption[]>([]);

  const [provincesLoading, setProvincesLoading] = useState(false);
  const [regenciesLoading, setRegenciesLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [villagesLoading, setVillagesLoading] = useState(false);
  
  const [isKodePosReadOnly, setIsKodePosReadOnly] = useState(false);
  
  const [provincePopoverOpen, setProvincePopoverOpen] = useState(false);
  const [regencyPopoverOpen, setRegencyPopoverOpen] = useState(false);
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
      form.setValue('ayah.pekerjaan', 'Meninggal Dunia', { shouldValidate: true });
      form.setValue('ayah.penghasilan', 'Meninggal Dunia', { shouldValidate: true });
      form.setValue('ayah.nomorTelepon', '', { shouldValidate: true });
      const fieldsToClear: FieldPath<RegistrationFormData>[] = ['ayah.nik', 'ayah.tahunLahir', 'ayah.pendidikan', 'ayah.pendidikanLainnya', 'ayah.pekerjaanLainnya', 'ayah.nomorTelepon'];
      fieldsToClear.forEach(field => form.clearErrors(field));
    } else {
      if (form.getValues('ayah.pekerjaan') === 'Meninggal Dunia') {
        form.setValue('ayah.pekerjaan', undefined);
      }
      if (form.getValues('ayah.penghasilan') === 'Meninggal Dunia') {
        form.setValue('ayah.penghasilan', undefined);
      }
    }
  }, [isAyahDeceased, form]);

  useEffect(() => {
    if (isIbuDeceased) {
      form.setValue('ibu.pekerjaan', 'Meninggal Dunia', { shouldValidate: true });
      form.setValue('ibu.penghasilan', 'Meninggal Dunia', { shouldValidate: true });
      form.setValue('ibu.nomorTelepon', '', { shouldValidate: true });
       const fieldsToClear: FieldPath<RegistrationFormData>[] = ['ibu.nik', 'ibu.tahunLahir', 'ibu.pendidikan', 'ibu.pendidikanLainnya', 'ibu.pekerjaanLainnya', 'ibu.nomorTelepon'];
       fieldsToClear.forEach(field => form.clearErrors(field));
    } else {
      if (form.getValues('ibu.pekerjaan') === 'Meninggal Dunia') {
        form.setValue('ibu.pekerjaan', undefined);
      }
      if (form.getValues('ibu.penghasilan') === 'Meninggal Dunia') {
        form.setValue('ibu.penghasilan', undefined);
      }
    }
  }, [isIbuDeceased, form]);

  useEffect(() => {
    if (isWaliRequired) {
      // Trigger validation for the entire wali step when it becomes required
      const waliFields = getFieldsForStep(4);
      form.trigger(waliFields);
    }
  }, [isWaliRequired, form]);


  const nisnValue = form.watch("siswa.nisn");
  const nikValue = form.watch("siswa.nikSiswa");
  const ayahNikValue = form.watch("ayah.nik");
  const ibuNikValue = form.watch("ibu.nik");
  const waliNikValue = form.watch("wali.nik");
  const rtRwValue = form.watch("siswa.rtRw");
  const selectedProvinceCode = form.watch("siswa.provinsi");
  const selectedRegencyCode = form.watch("siswa.kabupaten");
  const selectedDistrictCode = form.watch("siswa.kecamatan");

  const hubunganWali = form.watch('wali.hubungan');

  useEffect(() => {
    const copyParentDataToWali = (parentType: 'ayah' | 'ibu') => {
        const parentData = form.getValues(parentType);
        // Do not copy 'isDeceased' status
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
      setProvincesLoading(true);
      try {
        const response = await fetch('/api/wilayah/provinces');
        if (!response.ok) throw new Error('Gagal memuat provinsi. Status: ' + response.status);
        const jsonResponse = await response.json();
        if (!isMounted) return;

        const data = Array.isArray(jsonResponse) ? jsonResponse : [];
        const mappedProvinces = data.map((p: Wilayah) => ({ value: p.code, label: p.name }));
        setProvinces(mappedProvinces);

        const targetProvince = mappedProvinces.find(p => p.label.toUpperCase() === "JAWA TIMUR");
        if (targetProvince) {
          form.setValue("siswa.provinsi", targetProvince.value);
        }
      } catch (error) {
        console.error("Error fetching provinces:", error);
        if (isMounted) toast({ title: "Error", description: `Gagal memuat data provinsi: ${(error as Error).message}`, variant: "destructive" });
        setProvinces([]);
      } finally {
        if (isMounted) setProvincesLoading(false);
      }
    };
    fetchProvinces();
    return () => { isMounted = false; };
  }, [toast, form]);

  useEffect(() => {
    let isMounted = true;
    if (selectedProvinceCode) {
      const fetchRegencies = async () => {
        setRegenciesLoading(true);
        setRegencies([]);
        setDistricts([]);
        setVillages([]);
        form.setValue("siswa.kabupaten", "");
        form.setValue("siswa.kecamatan", "");
        form.setValue("siswa.desaKelurahan", "");
        form.setValue("siswa.kodePos", "");
        setIsKodePosReadOnly(false);
        try {
          const response = await fetch(`/api/wilayah/regencies/${selectedProvinceCode}`);
          if (!response.ok) throw new Error('Gagal memuat kabupaten/kota. Status: ' + response.status);
          const jsonResponse = await response.json();
          if (!isMounted) return;

          const data = Array.isArray(jsonResponse) ? jsonResponse : [];
          const mappedRegencies = data.map((r: Wilayah) => ({ value: r.code, label: r.name }));
          setRegencies(mappedRegencies);

          const province = provinces.find(p => p.value === selectedProvinceCode);
          if (province && province.label.toUpperCase() === "JAWA TIMUR") {
            const targetRegency = mappedRegencies.find(r => r.label.toUpperCase() === "KAB. LAMONGAN");
            if (targetRegency) {
              form.setValue("siswa.kabupaten", targetRegency.value);
            }
          }
        } catch (error) {
          console.error("Error fetching regencies:", error);
          if(isMounted) toast({ title: "Error", description: `Gagal memuat data kabupaten/kota: ${(error as Error).message}`, variant: "destructive" });
           setRegencies([]);
        } finally {
          if(isMounted) setRegenciesLoading(false);
        }
      };
      fetchRegencies();
    } else {
      setRegencies([]);
      setDistricts([]);
      setVillages([]);
    }
    return () => { isMounted = false; };
  }, [selectedProvinceCode, toast, form, provinces]);

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
          if(isMounted) toast({ title: "Error", description: `Gagal memuat data kecamatan: ${(error as Error).message}`, variant: "destructive" });
          setDistricts([]);
        } finally {
          if(isMounted) setDistrictsLoading(false);
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
          if(isMounted) toast({ title: "Error", description: `Gagal memuat data desa/kelurahan: ${(error as Error).message}`, variant: "destructive" });
          setVillages([]);
        } finally {
          if(isMounted) setVillagesLoading(false);
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
    // Step 5 (Review) doesn't have fields to validate, it's always "valid" to proceed TO it.
    if (step === 5) return true;

    const fieldsToValidate = getFieldsForStep(step);
    if (fieldsToValidate.length === 0) return true;

    await form.trigger(fieldsToValidate);

    const hasError = fieldsToValidate.some(field => getFieldError(field, form.formState.errors));
    if (hasError) return false;

    // Special logic for conditional fields that might not be caught by RHF's default trigger
    if (step === 1) {
        const isStepValid = !fieldsToValidate.some(field => {
            const error = getFieldError(field, form.formState.errors);
            if (field === "siswa.agamaLainnya" && form.getValues("siswa.agama") !== "Lainnya") return false;
            if (field === "siswa.tempatTinggalLainnya" && form.getValues("siswa.tempatTinggal") !== "Lainnya") return false;
            if (field === "siswa.modaTransportasiLainnya" && !form.getValues("siswa.modaTransportasi").includes("lainnya")) return false;
            if (field === "siswa.dusun") return false;
            if (field === "siswa.alamatJalan") return false; 
            return !!error;
        });
        return isStepValid;
    } else if (step === 2) { // Ayah
        const ayahData = form.getValues().ayah;
        const validationResult = parentSchema.safeParse(ayahData);
        if (!validationResult.success) {
            validationResult.error.errors.forEach(err => {
                const path = `ayah.${err.path.join(".")}` as FieldPath<RegistrationFormData>;
                form.setError(path, { type: 'manual', message: err.message });
            });
        }
        return validationResult.success;
    } else if (step === 3) { // Ibu
        const ibuData = form.getValues().ibu;
        const validationResult = parentSchema.safeParse(ibuData);
         if (!validationResult.success) {
            validationResult.error.errors.forEach(err => {
                const path = `ibu.${err.path.join(".")}` as FieldPath<RegistrationFormData>;
                form.setError(path, { type: 'manual', message: err.message });
            });
        }
        return validationResult.success;
    } else if (step === 4) { // Wali
        const waliData = form.getValues().wali;
        const isRequired = form.getValues('ayah.isDeceased') && form.getValues('ibu.isDeceased');
        
        await form.trigger(getFieldsForStep(4));
        const waliFieldsHaveErrors = getFieldsForStep(4).some(field => getFieldError(field, form.formState.errors));
        if (waliFieldsHaveErrors) return false;

        if (!isRequired) {
            const hasWaliInput = Object.values(waliData).some(v => v !== '' && v !== undefined && v !== null);
            if (!hasWaliInput) {
                getFieldsForStep(4).forEach(field => form.clearErrors(field));
                return true;
            } else {
                 const validationResult = waliSchema.safeParse(waliData);
                 return validationResult.success;
            }
        }
    }
    return true;
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
      return; 
    }

    let allStepsValid = true;
    const newCompletionStatus: Record<number, boolean | undefined> = {};
    for (let i = 1; i < TOTAL_STEPS; i++) { // Validate steps 1 to 4
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
      setIsAttemptingSubmit(false); 
      return;
    }
    
    // Final check for phone number before submission
    if (!data.ayah.nomorTelepon && !data.ibu.nomorTelepon && !data.wali.nomorTelepon) {
        toast({
            title: "Nomor Telepon Belum Diisi",
            description: "Mohon isi minimal salah satu nomor telepon (Ayah, Ibu, atau Wali).",
            variant: "destructive",
        });
        form.setError("ayah.nomorTelepon", { type: "manual", message: "Minimal satu nomor telepon wajib diisi." });
        setStepCompletionStatus(prev => ({ ...prev, 2: false }));
        setCurrentStep(2);
        setIsAttemptingSubmit(false);
        return;
    }

    const processedData: any = JSON.parse(JSON.stringify(data));

    if (processedData.ayah.nomorTelepon) {
        processedData.ayah.nomorTelepon = `+62${processedData.ayah.nomorTelepon}`;
    }
    if (processedData.ibu.nomorTelepon) {
        processedData.ibu.nomorTelepon = `+62${processedData.ibu.nomorTelepon}`;
    }
    if (processedData.wali.nomorTelepon) {
        processedData.wali.nomorTelepon = `+62${processedData.wali.nomorTelepon}`;
    }


    // Find labels for wilayah inside the 'siswa' object
    processedData.siswa.provinsi = provinces.find(p => p.value === data.siswa.provinsi)?.label || data.siswa.provinsi;
    processedData.siswa.kabupaten = regencies.find(r => r.value === data.siswa.kabupaten)?.label || data.siswa.kabupaten;
    processedData.siswa.kecamatan = districts.find(d => d.value === data.siswa.kecamatan)?.label || data.siswa.kecamatan;
    processedData.siswa.desaKelurahan = villages.find(v => v.value === data.siswa.desaKelurahan)?.label || data.siswa.desaKelurahan;


    const processSingleLainnya = (obj: any, mainField: string, otherField: string) => {
      if (obj && obj[mainField] === 'Lainnya' && obj[otherField]) {
        obj[mainField] = `Lainnya: ${obj[otherField]}`;
      }
      if (obj) {
        delete obj[otherField];
      }
    };
    
    const processParentLainnya = (parentObj: any) => {
      if (!parentObj) return;
      processSingleLainnya(parentObj, 'pendidikan', 'pendidikanLainnya');
      processSingleLainnya(parentObj, 'pekerjaan', 'pekerjaanLainnya');
      if ('isDeceased' in parentObj) {
          delete parentObj.isDeceased;
      }
      if ('hubungan' in parentObj) {
          processSingleLainnya(parentObj, 'hubungan', 'hubunganLainnya');
      }
    };
    
    processSingleLainnya(processedData.siswa, 'agama', 'agamaLainnya');
    processSingleLainnya(processedData.siswa, 'tempatTinggal', 'tempatTinggalLainnya');
    
    processParentLainnya(processedData.ayah);
    processParentLainnya(processedData.ibu);
    processParentLainnya(processedData.wali);
    
    if (processedData.siswa.modaTransportasi) {
      const transportationMap = new Map(modaTransportasiOptions.map(opt => [opt.id, opt.label]));
      const transportationLabels = processedData.siswa.modaTransportasi.map((id: string) => {
          if (id === 'lainnya') {
              return processedData.siswa.modaTransportasiLainnya ? `Lainnya: ${processedData.siswa.modaTransportasiLainnya}` : 'Lainnya';
          }
          return transportationMap.get(id) || id;
      });
      processedData.siswa.modaTransportasi = transportationLabels;
      delete processedData.siswa.modaTransportasiLainnya;
    }

    console.log("Form submitted successfully:", processedData);
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

  const renderParentFields = (parentType: 'ayah' | 'ibu' | 'wali') => {
    const title = parentType === 'ayah' ? 'Ayah Kandung' : parentType === 'ibu' ? 'Ibu Kandung' : 'Wali';
    const namePrefix = parentType;
    const isDeceased = parentType === 'ayah' ? isAyahDeceased : parentType === 'ibu' ? isIbuDeceased : false;
    const isWaliCurrentlyRequired = form.watch('ayah.isDeceased') && form.watch('ibu.isDeceased');

    const pekerjaanOptions = isDeceased ? [...pekerjaanOptionsList, "Meninggal Dunia"] : pekerjaanOptionsList;
    const penghasilanOptions = isDeceased ? [...penghasilanOptionsList, "Meninggal Dunia"] : penghasilanOptionsList;

    const nikIsFocused = parentType === 'ayah' ? ayahNikIsFocused : parentType === 'ibu' ? ibuNikIsFocused : waliNikIsFocused;
    const setNikIsFocused = parentType === 'ayah' ? setAyahNikIsFocused : parentType === 'ibu' ? setIbuNikIsFocused : setWaliNikIsFocused;
    const nikValue = parentType === 'ayah' ? ayahNikValue : parentType === 'ibu' ? ibuNikValue : waliNikValue;


    const description = "Wali adalah pihak yang turut bertanggung jawab atas siswa, seperti Ayah/Ibu kandung, kakek, nenek, paman, bibi, orang tua tiri, atau pihak lain yang dianggap sebagai wali. Jika kedua orang tua telah tiada, data wali wajib diisi. Jika salah satu orang tua masih hidup dan menjadi pendamping utama, bagian ini boleh dilewati. Namun, Anda juga tetap boleh mengisi data wali meskipun orang tua masih ada, jika ada pihak lain yang turut mendampingi siswa.";


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
           {parentType === 'wali' && isWaliCurrentlyRequired && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Perhatian</AlertTitle>
              <AlertDescription>
                Karena kedua orang tua telah meninggal, maka data wali wajib diisi sebagai pihak yang saat ini mendampingi siswa.
              </AlertDescription>
            </Alert>
          )}

          {(parentType === 'ayah' || parentType === 'ibu') && (
            <FormField
              control={form.control}
              name={`${namePrefix}.isDeceased` as FieldPath<RegistrationFormData>}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal">
                      {title} sudah meninggal dunia
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          )}

          {parentType === 'wali' && (
             <FormField
                control={form.control}
                name="wali.hubungan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hubungan dengan Siswa {isWaliCurrentlyRequired ? '*' : '(Opsional)'}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? undefined}>
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
          )}
          {parentType === 'wali' && form.watch('wali.hubungan') === 'Lainnya (tuliskan)' && (
            <FormField
              control={form.control}
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
            control={form.control}
            name={`${namePrefix}.nama` as FieldPath<RegistrationFormData>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama {title} {parentType === 'wali' && !isWaliCurrentlyRequired ? '(Opsional)' : '*'}</FormLabel>
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
                <FormLabel>NIK {title} { parentType === 'wali' ? (isWaliCurrentlyRequired ? '*' : '(Opsional)') : (isDeceased ? '(Opsional)' : '*') }</FormLabel>
                <FormControl>
                  <IMaskInput
                    mask="0000000000000000"
                    lazy={!nikIsFocused && !nikValue}
                    inputMode="numeric"
                    placeholder="16 digit NIK"
                    className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", getFieldError(`${namePrefix}.nik`, form.formState.errors) && "border-destructive")}
                    value={field.value ?? ''}
                    unmask={true}
                    onAccept={(value) => field.onChange(value)}
                    onFocus={() => setNikIsFocused(true)}
                    onBlur={(e) => {
                        field.onBlur(e);
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
            control={form.control}
            name={`${namePrefix}.tahunLahir` as FieldPath<RegistrationFormData>}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tahun Lahir { parentType === 'wali' ? (isWaliCurrentlyRequired ? '*' : '(Opsional)') : (isDeceased ? '(Opsional)' : '*') }</FormLabel>
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
                <FormLabel>Pendidikan Terakhir { parentType === 'wali' ? (isWaliCurrentlyRequired ? '*' : '(Opsional)') : (isDeceased ? '(Opsional)' : '*') }</FormLabel>
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
                  <FormLabel>Detail Pendidikan Lainnya *</FormLabel>
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
                <FormLabel>Pekerjaan Utama { parentType === 'wali' ? (isWaliCurrentlyRequired ? '*' : '(Opsional)') : (isDeceased ? '(Opsional)' : '*') }</FormLabel>
                <Select 
                    onValueChange={field.onChange} 
                    value={field.value ?? undefined}
                >
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
          {form.watch(`${namePrefix}.pekerjaan` as FieldPath<RegistrationFormData>) === 'Lainnya' && (
            <FormField
              control={form.control}
              name={`${namePrefix}.pekerjaanLainnya` as FieldPath<RegistrationFormData>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detail Pekerjaan Lainnya *</FormLabel>
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
                <FormLabel>Penghasilan Bulanan { parentType === 'wali' ? (isWaliCurrentlyRequired ? '*' : '(Opsional)') : (isDeceased ? '(Opsional)' : '*') }</FormLabel>
                <Select 
                    onValueChange={field.onChange} 
                    value={field.value ?? undefined}
                >
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
            control={form.control}
            name={`${namePrefix}.nomorTelepon` as FieldPath<RegistrationFormData>}
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
                            value={field.value ?? ''}
                            disabled={parentType !== 'wali' && isDeceased}
                        />
                    </FormControl>
                  </div>
                 <FormDescription>
                  {parentType !== 'wali' && isDeceased
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
  };
  
    const renderReviewStep = () => {
    const formData = form.getValues();

    const renderValue = (value: any): string => {
        if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak';
        if (Array.isArray(value)) {
            const transportationMap = new Map(modaTransportasiOptions.map(opt => [opt.id, opt.label]));
             const labels = value.map((id: string) => {
                if (id === 'lainnya') {
                    return formData.siswa.modaTransportasiLainnya ? `Lainnya: ${formData.siswa.modaTransportasiLainnya}` : 'Lainnya';
                }
                return transportationMap.get(id) || id;
            });
            return labels.join(', ');
        }
        if (!value) return '-';
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
        'isDeceased': 'Sudah Meninggal',
        'nama': 'Nama',
        'nik': 'NIK',
        'tahunLahir': 'Tahun Lahir',
        'pendidikan': 'Pendidikan',
        'pekerjaan': 'Pekerjaan',
        'penghasilan': 'Penghasilan',
        'nomorTelepon': 'Nomor HP',
        'hubungan': 'Hubungan dengan Siswa',
    };

    const renderSectionData = (data: Record<string, any>, sectionName: string) => {
        return (
             <dl className="space-y-2">
                {Object.entries(data).map(([key, value]) => {
                    if (key.endsWith('Lainnya') || value === undefined || value === '' || value === null) return null;
                    
                    let displayValue = value;
                    if (key === 'agama' && value === 'Lainnya') displayValue = `Lainnya: ${data.agamaLainnya}`;
                    if (key === 'tempatTinggal' && value === 'Lainnya') displayValue = `Lainnya: ${data.tempatTinggalLainnya}`;
                    if (key === 'pendidikan' && value === 'Lainnya') displayValue = `Lainnya: ${data.pendidikanLainnya}`;
                    if (key === 'pekerjaan' && value === 'Lainnya') displayValue = `Lainnya: ${data.pekerjaanLainnya}`;
                    if (key === 'hubungan' && value === 'Lainnya (tuliskan)') displayValue = `Lainnya: ${data.hubunganLainnya}`;
                    if (key === 'provinsi') displayValue = provinces.find(p => p.value === value)?.label || value;
                    if (key === 'kabupaten') displayValue = regencies.find(r => r.value === value)?.label || value;
                    if (key === 'kecamatan') displayValue = districts.find(d => d.value === value)?.label || value;
                    if (key === 'desaKelurahan') displayValue = villages.find(v => v.value === value)?.label || value;
                    if (key === 'nomorTelepon') displayValue = value ? `+62${value}` : '-';

                    return (
                        <div key={`${sectionName}-${key}`} className="flex justify-between items-start py-2 border-b border-dashed">
                            <dt className="text-sm text-muted-foreground pr-2">{displayLabels[key] || key}</dt>
                            <dd className="text-sm font-medium text-right break-words">{renderValue(displayValue)}</dd>
                        </div>
                    );
                })}
            </dl>
        );
    };

    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="font-headline text-xl text-center">Review Data Pendaftaran</CardTitle>
                <CardDescription className="text-center pt-1">
                    Pastikan semua data yang Anda masukkan sudah benar sebelum mengirim.
                </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
        </Card>
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
            <Card key="step-1" className="w-full shadow-lg">
                <CardHeader>
                <CardTitle className="font-headline text-xl text-center">Identitas Peserta Didik</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                <FormField control={form.control} name="siswa.namaLengkap" render={({ field }) => (
                    <FormItem><FormLabel>Nama Lengkap *</FormLabel><FormControl><Input
                    placeholder="Sesuai Akta Kelahiran"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="siswa.namaPanggilan" render={({ field }) => (
                    <FormItem><FormLabel>Nama Panggilan *</FormLabel><FormControl><Input
                    placeholder="Nama panggilan anda"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="siswa.jenisKelamin" render={({ field }) => (
                    <FormItem><FormLabel>Jenis Kelamin *</FormLabel><Select onValueChange={field.onChange} value={field.value ?? undefined}><FormControl><SelectTrigger><SelectValue placeholder="Pilih jenis kelamin" /></SelectTrigger></FormControl><SelectContent>{jenisKelaminOptions.map(jk => <SelectItem key={jk} value={jk}>{jk}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                <FormField
                    control={form.control}
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
                                className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", getFieldError('siswa.nisn', form.formState.errors) && "border-destructive")}
                                value={field.value ?? ''}
                                unmask={true}
                                onAccept={(value) => field.onChange(value)}
                                onFocus={() => setNisnIsFocused(true)}
                                onBlur={(e) => {
                                    field.onBlur(e);
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
                    control={form.control}
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
                                className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", getFieldError('siswa.nikSiswa', form.formState.errors) && "border-destructive")}
                                value={field.value ?? ''}
                                unmask={true}
                                onAccept={(value) => field.onChange(value)}
                                onFocus={() => setNikIsFocused(true)}
                                onBlur={(e) => {
                                    field.onBlur(e);
                                    setNikIsFocused(false);
                                }}
                                inputRef={field.ref}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="siswa.tempatLahir" render={({ field }) => (
                    <FormItem><FormLabel>Tempat Lahir *</FormLabel><FormControl><Input
                    placeholder="Kota/Kabupaten kelahiran"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField
                    control={form.control}
                    name="siswa.tanggalLahir"
                    render={({ field, fieldState }) => (
                    <FormItem className="flex flex-col">
                        <CustomDatePicker
                            id="tanggalLahir"
                            label="Tanggal Lahir *"
                            value={field.value}
                            onDateChange={(dateStr) => field.onChange(dateStr)}
                            ariaInvalid={!!fieldState.error}
                            disabled={field.disabled}
                        />
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField control={form.control} name="siswa.agama" render={({ field }) => (
                    <FormItem><FormLabel>Agama *</FormLabel><Select onValueChange={field.onChange} value={field.value ?? undefined}><FormControl><SelectTrigger><SelectValue placeholder="Pilih agama" /></SelectTrigger></FormControl><SelectContent>{agamaOptionsList.map(ag => <SelectItem key={ag} value={ag}>{ag}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                {form.watch('siswa.agama') === 'Lainnya' && (
                    <FormField control={form.control} name="siswa.agamaLainnya" render={({ field }) => (
                        <FormItem><FormLabel>Detail Agama Lainnya *</FormLabel><FormControl><Input placeholder="Sebutkan agama lainnya" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                )}
                <FormField control={form.control} name="siswa.anakKe" render={({ field }) => (
                    <FormItem><FormLabel>Anak Keberapa *</FormLabel><FormControl><Input type="number" min="1" placeholder="Contoh: 1" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="siswa.jumlahSaudaraKandung" render={({ field }) => (
                    <FormItem><FormLabel>Jumlah Saudara Kandung *</FormLabel><FormControl><Input type="number" min="0" placeholder="Isi 0 jika tidak punya" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} /></FormControl><FormMessage /></FormItem>
                )} />
                
                <Separator className="my-4" />
                <p className="font-medium text-center">Alamat Tempat Tinggal</p>

                <FormField control={form.control} name="siswa.tempatTinggal" render={({ field }) => (
                    <FormItem><FormLabel>Tempat Tinggal Saat Ini *</FormLabel><Select onValueChange={field.onChange} value={field.value ?? undefined}><FormControl><SelectTrigger><SelectValue placeholder="Pilih tempat tinggal" /></SelectTrigger></FormControl><SelectContent>{tempatTinggalOptionsList.map(tt => <SelectItem key={tt} value={tt}>{tt}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                {form.watch('siswa.tempatTinggal') === 'Lainnya' && (
                    <FormField control={form.control} name="siswa.tempatTinggalLainnya" render={({ field }) => (
                        <FormItem><FormLabel>Detail Tempat Tinggal Lainnya *</FormLabel><FormControl><Input placeholder="Sebutkan tempat tinggal lainnya" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                )}
                
                <FormField
                    control={form.control}
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
                                            form.setValue("siswa.provinsi", province.value);
                                            form.setValue("siswa.kabupaten", "");
                                            form.setValue("siswa.kecamatan", "");
                                            form.setValue("siswa.desaKelurahan", "");
                                            form.setValue("siswa.kodePos", "");
                                            setIsKodePosReadOnly(false);
                                            setRegencies([]);
                                            setDistricts([]);
                                            setVillages([]);
                                            form.trigger("siswa.provinsi");
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
                    control={form.control}
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
                                disabled={!selectedProvinceCode || regenciesLoading || regencies.length === 0}
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
                                            form.setValue("siswa.kabupaten", regency.value);
                                            form.setValue("siswa.kecamatan", "");
                                            form.setValue("siswa.desaKelurahan", "");
                                            form.setValue("siswa.kodePos", "");
                                            setIsKodePosReadOnly(false);
                                            setDistricts([]);
                                            setVillages([]);
                                            form.trigger("siswa.kabupaten");
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
                    control={form.control}
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
                                disabled={!selectedRegencyCode || districtsLoading || districts.length === 0}
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
                                            form.setValue("siswa.kecamatan", district.value);
                                            form.setValue("siswa.desaKelurahan", "");
                                            form.setValue("siswa.kodePos", "");
                                            setIsKodePosReadOnly(false);
                                            setVillages([]);
                                            form.trigger("siswa.kecamatan");
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
                    control={form.control}
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
                                disabled={!selectedDistrictCode || villagesLoading || villages.length === 0}
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
                                            form.setValue("siswa.desaKelurahan", village.value);
                                            if (village.postalCode) {
                                                form.setValue("siswa.kodePos", village.postalCode);
                                                setIsKodePosReadOnly(true);
                                            } else {
                                                form.setValue("siswa.kodePos", "");
                                                setIsKodePosReadOnly(false);
                                            }
                                            form.trigger("siswa.desaKelurahan");
                                            form.trigger("siswa.kodePos");
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

                <FormField control={form.control} name="siswa.dusun" render={({ field }) => (
                    <FormItem><FormLabel>Dusun (Opsional)</FormLabel><FormControl><Input
                    placeholder="Nama dusun/dukuh"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField
                    control={form.control}
                    name="siswa.rtRw"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>RT/RW *</FormLabel>
                        <FormControl>
                            <IMaskInput
                                mask="000/000"
                                lazy={!rtRwIsFocused && !rtRwValue}
                                placeholder="Contoh: 001/002"
                                className={cn("flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", getFieldError('siswa.rtRw', form.formState.errors) && "border-destructive")}
                                value={field.value ?? ''}
                                unmask={false}
                                onAccept={(value) => field.onChange(value)}
                                onFocus={() => setRtRwIsFocused(true)}
                                onBlur={(e) => {
                                    field.onBlur(e);
                                    setRtRwIsFocused(false);
                                }}
                                inputRef={field.ref}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField control={form.control} name="siswa.alamatJalan" render={({ field }) => (
                    <FormItem><FormLabel>Alamat Jalan (Opsional)</FormLabel><FormControl><Input placeholder="Contoh: Jl. Kenanga No. 27 (Bisa nama jalan saja)" {...field} value={field.value ?? ''} /></FormControl><FormDescription>Kosongkan jika tidak tahu nama jalan.</FormDescription><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="siswa.kodePos" render={({ field }) => (
                    <FormItem><FormLabel>Kode Pos *</FormLabel><FormControl><Input type="text" inputMode="numeric" maxLength={5} placeholder="5 digit kode pos" {...field} value={field.value ?? ''} readOnly={isKodePosReadOnly} /></FormControl><FormMessage /></FormItem>
                )} />
                <Separator className="my-4" />
                <FormField control={form.control} name="siswa.modaTransportasi" render={() => (
                    <FormItem>
                      <fieldset>
                        <legend className="text-sm font-medium leading-none">Moda Transportasi ke Sekolah *</legend>
                        <div className="space-y-2 pt-2">
                          {modaTransportasiOptions.map((option) => (
                            <FormField key={option.id} control={form.control} name="siswa.modaTransportasi"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox checked={field.value?.includes(option.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), option.id])
                                          : field.onChange((field.value || []).filter((value: string) => value !== option.id));
                                      }} />
                                  </FormControl>
                                  <FormLabel className="font-normal">{option.label}</FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </fieldset>
                      <FormMessage />
                    </FormItem>
                )} />
                {form.watch('siswa.modaTransportasi', []).includes('lainnya') && (
                    <FormField control={form.control} name="siswa.modaTransportasiLainnya" render={({ field }) => (
                    <FormItem><FormLabel>Detail Moda Transportasi Lainnya *</FormLabel><FormControl><Input placeholder="Sebutkan moda transportasi lainnya" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                    )} />
                )}
                </CardContent>
            </Card>
            )}

            {currentStep === 2 && <div key="step-2">{renderParentFields('ayah')}</div>}
            {currentStep === 3 && <div key="step-3">{renderParentFields('ibu')}</div>}
            {currentStep === 4 && <div key="step-4">{renderParentFields('wali')}</div>}
            {currentStep === 5 && <div key="step-5">{renderReviewStep()}</div>}
        </div>

        <CardFooter className="flex justify-between mt-8">
          {currentStep > 1 ? (
            <Button type="button" variant="outline" onClick={() => processStep('prev')} disabled={form.formState.isSubmitting || isSubmittedSuccessfully} className="gap-0">
              <ArrowLeft className="h-4 w-4" /> Sebelumnya
            </Button>
          ) : ( <div />
          )}

          {currentStep < TOTAL_STEPS ? (
            <Button type="button" onClick={() => processStep('next')} disabled={form.formState.isSubmitting} className="ml-auto gap-0">
              Berikutnya <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="submit" 
              onClick={() => setIsAttemptingSubmit(true)} 
              className="ml-auto gap-2" 
              disabled={form.formState.isSubmitting || isSubmittedSuccessfully}
            >
              {form.formState.isSubmitting ? 'Mengirim...' : isSubmittedSuccessfully ? 'Terkirim' : 'Kirim Pendaftaran'}
              <Send className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </form>
    </Form>
  );
}

    
