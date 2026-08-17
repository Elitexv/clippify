import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import StatsBar from "@/components/landing/StatsBar";
import HowItWorks from "@/components/landing/HowItWorks";
import ForEveryone from "@/components/landing/ForEveryone";
import PopularClips from "@/components/landing/PopularClips";
import TrendingTikTok from "@/components/landing/TrendingTikTok";
import TopCreators from "@/components/landing/TopCreators";
import Testimonial from "@/components/landing/Testimonial";
import CtaBanner from "@/components/landing/CtaBanner";
import Footer from "@/components/landing/Footer";
import Reveal from "@/components/landing/Reveal";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <div className="relative z-10 -mt-10 sm:-mt-12">
          <StatsBar />
        </div>
        <Reveal>
          <HowItWorks />
        </Reveal>
        <Reveal>
          <ForEveryone />
        </Reveal>
        <Reveal>
          <PopularClips />
        </Reveal>
        <Reveal>
          <TrendingTikTok />
        </Reveal>
        <Reveal>
          <TopCreators />
        </Reveal>
        <Reveal>
          <Testimonial />
        </Reveal>
        <Reveal>
          <CtaBanner />
        </Reveal>
      </main>
      <Footer />
    </div>
  );
}
