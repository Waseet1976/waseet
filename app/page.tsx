import Navbar         from "@/components/landing/Navbar";
import Hero           from "@/components/landing/Hero";
import HowItWorks     from "@/components/landing/HowItWorks";
import ForWho         from "@/components/landing/ForWho";
import Advantages     from "@/components/landing/Advantages";
import CommissionCalc  from "@/components/landing/CommissionCalc";
import PricingSection  from "@/components/landing/PricingSection";
import Security        from "@/components/landing/Security";
import CTASection     from "@/components/landing/CTASection";
import Footer         from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <ForWho />
        <Advantages />
        <CommissionCalc />
        <PricingSection />
        <Security />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
