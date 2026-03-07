'use client'

import ProjectShell from '@/components/ProjectShell'

export default function SonyPage() {
  return (
    <ProjectShell
      title="Sony Audio Companion"
      subtitle="How might we make digital companion apps feel as considered as the hardware they complement?"
      company="Sony"
      year="2021"
      stats={[
        { value: 'Research', label: 'Consumer insights' },
        { value: '2021',     label: 'Project year' },
      ]}
      impactStatement="Bridging physical affordances with digital companion experiences"
      sections={[
        {
          label: 'Overview',
          body: "Consumer research and interaction design for Sony's next-generation audio product line. The project focused on bridging physical affordances — hardware buttons, gestures, haptics — with digital companion app experiences on iOS and Android.",
        },
        {
          label: 'Problem',
          body: "Sony's premium audio customers were using the companion app far less than expected. Physical products were intuitive; the app felt like an afterthought. The challenge was to make the digital layer feel as considered as the hardware — without losing the tactile directness that made the physical products beloved.",
        },
        {
          label: 'Process',
          body: 'Shadowed customers in their natural listening contexts — commutes, home studios, gym sessions. Mapped the emotional arc of the listening experience from putting headphones on through to long sessions. Identified moments where the physical product created desire for digital extension that the app failed to satisfy.',
        },
        {
          label: 'Outcome',
          body: "Research findings and design recommendations delivered as a comprehensive deck and interactive prototype to the Sony product team. Several patterns were incorporated into the next hardware generation's companion app specification.",
        },
      ]}
    />
  )
}
