'use client'

import ProjectShell from '@/components/ProjectShell'

export default function AIEmailAssistantPage() {
  return (
    <ProjectShell
      title="AI Email Assistant"
      subtitle="How might we make AI writing feel like a collaborator, not a ghostwriter?"
      company="Salesloft"
      year="2023"
      stats={[
        { value: '2×',  label: 'Adoption vs. prior AI features' },
        { value: '87%', label: 'Rep trust rating' },
      ]}
      impactStatement="Building trust in AI through transparency and explainability"
      passwordProtected
      sections={[
        {
          label: 'Overview',
          body: "AI Email Assistant is a generative AI composition tool embedded in Salesloft's sales engagement platform. It helps sales reps craft personalized, on-brand emails faster — while building in explainability so reps understand why the AI is suggesting what it suggests.",
        },
        {
          label: 'Problem',
          body: 'Early AI writing tools suffered from a trust gap: reps accepted suggestions without understanding them, producing generic outputs. Or they rejected them entirely, dismissing AI as a "black box." The product needed to be useful without being opaque — a collaborator, not a ghostwriter.',
        },
        {
          label: 'Process',
          body: "Conducted extensive interviews to understand how sales reps think about email — their mental models, their standards for 'good,' their fear of sounding inauthentic. I designed an explainability layer that surfaces reasoning alongside suggestions, letting reps edit with context. Multiple concept tests iterated the explanation format from verbose to scannable.",
        },
        {
          label: 'Outcome',
          body: 'Shipped to thousands of reps with measurably higher adoption rates than previous AI features. The explainability layer became a reference point for how the broader Salesloft product team approaches transparent AI design. Published internal design principles from the learnings.',
        },
      ]}
    />
  )
}
