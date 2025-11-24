import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { Services } from "@/components/services";
import { About } from "@/components/about";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { type Locale } from "@/lib/i18n";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locale as Locale;

  return (
    <main className="min-h-screen">
      <Navbar locale={validLocale} />
      <Hero locale={validLocale} />
      <Services locale={validLocale} />
      <About locale={validLocale} />
      <CTASection locale={validLocale} />
      <Footer locale={validLocale} />
    </main>
  );
}

