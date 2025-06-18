import React from 'react';

export function HeroSection() {
  return (
    <section
      className="h-[40vh] w-full flex flex-col items-center justify-center text-center bg-primary/10 p-4"
      aria-labelledby="hero-title"
    >
      <h4 className="text-lg md:text-xl text-foreground">Selamat Datang di</h4>
      <h2 id="hero-title" className="font-headline text-4xl md:text-5xl font-bold text-primary my-2">PPDB Madrasah</h2>
      <h4 className="text-md md:text-lg text-foreground">MI Roudlotut Tholibin</h4>
      <h4 className="text-md md:text-lg text-foreground">Warukulon</h4>
      <p className="text-sm md:text-base text-muted-foreground mt-1">Tahun Pelajaran 2024/2025</p>
    </section>
  );
}
