import logo from "@/assets/logo.png";
import { ScrollReveal } from "./ScrollReveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-secondary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="container text-center">
        <ScrollReveal>
          <img
            src={logo}
            alt="Marc's Snackks"
            className="mx-auto h-32 w-32 sm:h-40 sm:w-40 rounded-full shadow-xl border-4 border-card"
          />
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-6 text-foreground leading-tight">
            Tu Desayuno y Snacks favoritos
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={200}>
          <p className="text-muted-foreground text-base sm:text-lg mt-3 max-w-md mx-auto">
            Entregándote el mejor sabor y la mayor calidad y ya !!
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
