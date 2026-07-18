import { CertificateStrip } from "./components/landing/certificate";
import { FinalCta } from "./components/landing/cta";
import { Features } from "./components/landing/features";
import { Footer } from "./components/landing/footer";
import { Header } from "./components/landing/header";
import { Hero } from "./components/landing/hero";
import { Journey } from "./components/landing/journey";
import { Tracks } from "./components/landing/tracks";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <Header />
      <Hero />
      <Tracks />
      <Features />
      <Journey />
      <CertificateStrip />
      <FinalCta />
      <Footer />
    </div>
  );
}
