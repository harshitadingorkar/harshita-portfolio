'use client'

import ProjectShell from '@/components/ProjectShell'

export default function GitHubPage() {
  return (
    <ProjectShell
      title="GitHub's Revamped Pull Request Experience"
      subtitle="How might we improve the code review process for better collaboration among developers?"
      company="Microsoft / GitHub"
      year="2022"
      stats={[
        { value: '50M+', label: 'Active Users' },
        { value: '1.5M+', label: 'Daily Pull Requests' },
      ]}
      impactStatement="Potentially streamlining workflow for millions of developers globally"
      sections={[
        {
          label: 'Overview',
          body: "During my internship at GitHub, I worked across several core developer workflows — focusing on reducing friction in the pull request experience and improving the legibility of CI/CD status at scale. The work spanned exploratory research through to shipped UI improvements.",
        },
        {
          label: 'Problem',
          body: "GitHub's pull request interface had accumulated years of complexity. Power users navigated by muscle memory, while newer or less experienced contributors struggled to understand what a PR was communicating. CI/CD status was particularly opaque — success/failure states buried under layers of indirection.",
        },
        {
          label: 'Process',
          body: 'I ran a series of contextual inquiries with developers across seniority levels, screen-recording their actual workflows. This surfaced patterns invisible in analytics data. I then led ideation workshops with engineering and PM to prioritize interventions, prototyped in Figma and React, and ran moderated usability sessions.',
        },
        {
          label: 'Outcome',
          body: 'Several of my designs were shipped as part of a broader PR refresh. Developer satisfaction scores improved measurably in the cohort study. The research artifacts — journey maps, mental model diagrams — were shared across the GitHub design team and influenced subsequent roadmap planning.',
        },
      ]}
    />
  )
}
