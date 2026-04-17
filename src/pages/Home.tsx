import { useDocumentHead } from '../hooks/useDocumentHead'
import CurtainLoader from '../components/home/CurtainLoader'
import Navbar from '../components/home/Navbar'
import ParticleCanvas from '../components/home/ParticleCanvas'
import HeroSection from '../components/home/HeroSection'
import ProblemSection from '../components/home/ProblemSection'
import WorkflowSection from '../components/home/WorkflowSection'
import CampaignFlowSection from '../components/home/CampaignFlowSection'
import NichesSection from '../components/home/NichesSection'
import GateSection from '../components/home/GateSection'
import Footer from '../components/home/Footer'

export default function Home() {
  useDocumentHead({
    title: 'JUST WHY US — Premium Creator Campaign Execution',
    description:
      'We execute creator campaigns end-to-end. One brief in, one report out. A vetted network of creators across AI, SaaS, filmmaking, tech and lifestyle.',
    canonical: 'https://justwhyus.com/',
  })

  return (
    <main>
      <CurtainLoader />
      <ParticleCanvas />
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <WorkflowSection />
      <CampaignFlowSection />
      <NichesSection />
      <GateSection />
      <Footer />
    </main>
  )
}
