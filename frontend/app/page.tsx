import Navbar from "@/components/base/Navbar";
import HeroSection from "@/components/base/HeroSection";
import FeatureSection from "@/components/base/FeatureSection";
import UserReviews from "@/components/base/UserReviews";
import Footer from "@/components/base/Footer";
import { getSession } from "next-auth/react";

export default async function LandingPage() {
  
  const session = await getSession()
  return (
    <div className="min-h-screen flex flex-col ">
      {/* Header */}
      <Navbar user={session?.user} />
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeatureSection />

      {/* User Reviews Section */}
      <UserReviews />

      {/* Footer */}
      <Footer />
    </div>
  );
}