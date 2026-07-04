import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { FeaturedListings } from "@/components/FeaturedListings";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <FeaturedListings />
      </main>
      <Footer />
    </>
  );
}
