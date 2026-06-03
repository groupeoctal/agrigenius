"use client"

import dynamic from "next/dynamic"
import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"

// Chargement dynamique pour éviter les erreurs SSR avec GSAP
const HeroSection = dynamic(() => import("@/components/sections/HeroSection"), { ssr: false })
const ModulesSection = dynamic(() => import("@/components/sections/ModulesSection"), { ssr: false })
const StatsSection = dynamic(() => import("@/components/sections/StatsSection"), { ssr: false })
const CTASection = dynamic(() => import("@/components/sections/CTASection"), { ssr: false })

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--background)" }}>
      <Navbar />
      <HeroSection />
      <ModulesSection />
      <StatsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
