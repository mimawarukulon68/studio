import { HeroSection } from "@/components/sections/hero-section";
import { RegistrationForm } from "@/components/forms/registration-form";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="flex flex-col items-center min-h-screen bg-background text-foreground selection:bg-accent selection:text-accent-foreground">
      <HeroSection />
      <Separator className="my-8 w-11/12 md:w-4/5 max-w-3xl" />
      <RegistrationForm />
      <div className="py-12"> {/* Footer padding */}
        <p className="text-center text-sm text-muted-foreground">
          MI Roudlotut Tholibin Warukulon &copy; {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}
