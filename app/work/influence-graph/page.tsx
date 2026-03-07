'use client'

import ProjectShell from '@/components/ProjectShell'

export default function InfluenceGraphPage() {
  return (
    <ProjectShell
      title="Influence Graph"
      subtitle="How might we surface invisible stakeholder connections to help enterprise sellers navigate complex deals?"
      company="Salesloft"
      year="2024"
      stats={[
        { value: '0→1', label: 'Product launch' },
        { value: 'Q1',  label: 'Adoption target met' },
      ]}
      impactStatement="Helping enterprise AEs see the relationships that close deals"
      passwordProtected
      sections={[
        {
          label: 'Overview',
          body: 'Influence Graph is a 0→1 AI-powered relationship intelligence tool designed to help enterprise sales teams understand the full buying committee within target accounts. By visualizing stakeholder networks and surfacing influence pathways, the tool enables reps to navigate complex deals with more confidence and fewer surprises.',
        },
        {
          label: 'Problem',
          body: "Enterprise sales involves multiple stakeholders — but most CRM tools treat contacts as flat lists. Reps were losing deals not because they lacked relationships, but because they couldn't see the invisible connections between the people they knew and the people who mattered. We needed to make the invisible visible.",
        },
        {
          label: 'Process',
          body: 'I started with 30+ discovery interviews across rep, manager, and VP personas. I mapped the mental models reps use to navigate buying committees, then explored graph visualization approaches that felt intuitive rather than intimidating. Multiple rounds of concept testing refined the interaction model from complex network graphs to a readable, actionable format.',
        },
        {
          label: 'Outcome',
          body: 'The shipped product saw strong adoption among enterprise AEs in the first quarter. Qualitative feedback highlighted the "aha moment" when reps discovered previously invisible connections. The design became a model for how Salesloft approaches AI-augmented selling.',
        },
      ]}
    />
  )
}
