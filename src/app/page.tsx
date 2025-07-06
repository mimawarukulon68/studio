
import { RegistrationForm } from "@/components/forms/registration-form";

export default function Home() {
  return (
    <main className="flex flex-col items-center min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      <div className="bg-primary text-white p-6 w-full">
        <h1 className="text-2xl font-bold text-center">Formulir Pendaftaran</h1>
        <p className="text-center mt-2 text-primary-foreground/80">MI Roudlotut Tholibin Warukulon</p>
      </div>
      <div className="w-full px-2 md:px-4 flex justify-center">
         <RegistrationForm />
      </div>
      <div className="py-12">
        <p className="text-center text-sm text-muted-foreground">
          MI Roudlotut Tholibin Warukulon &copy; {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}
