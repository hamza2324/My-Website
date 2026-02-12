const POSTS = [
  {
    "id": 1,
    "title": "How to Automate Weekly Reporting with AI",
    "slug": "automate-weekly-reporting-with-ai",
    "category": "Automation Tutorials",
    "excerpt": "Build a lightweight AI workflow to prepare weekly KPI summaries in minutes.",
    "date": "2026-02-11",
    "readTime": "9 min read",
    "tags": [
      "Automation",
      "Reporting",
      "AI Workflow"
    ],
    "image": "https://picsum.photos/seed/weekly-reporting/1200/630",
    "url": "posts/automate-weekly-reporting-with-ai.html"
  },
  {
    "id": 2,
    "title": "Best Free AI Tools for Research and Summaries",
    "slug": "best-free-ai-tools-research-summaries",
    "category": "AI Tools",
    "excerpt": "Speed up your research process with tested free tools and workflows.",
    "date": "2026-02-07",
    "readTime": "8 min read",
    "tags": [
      "Research"
    ],
    "image": "https://picsum.photos/seed/ai15/800/500",
    "url": "posts/best-free-ai-tools-research-summaries.html"
  },
  {
    "id": 3,
    "title": "Top Prompt Templates for Sales Outreach",
    "slug": "prompt-templates-sales-outreach",
    "category": "LLM Guides",
    "excerpt": "Reusable prompt patterns for cold emails, follow-ups, and objection handling.",
    "date": "2026-02-05",
    "readTime": "6 min read",
    "tags": [
      "Sales",
      "Prompts"
    ],
    "image": "https://picsum.photos/seed/ai14/800/500",
    "url": "posts/prompt-templates-sales-outreach.html"
  },
  {
    "id": 4,
    "title": "Case Study: Automating Client Onboarding End-to-End",
    "slug": "case-study-client-onboarding-automation",
    "category": "Case Studies",
    "excerpt": "How a lean team reduced onboarding time by combining forms, AI, and workflows.",
    "date": "2026-02-04",
    "readTime": "8 min read",
    "tags": [
      "Onboarding"
    ],
    "image": "https://picsum.photos/seed/ai13/800/500",
    "url": "posts/case-study-client-onboarding-automation.html"
  },
  {
    "id": 5,
    "title": "What Is New in LLMs This Month",
    "slug": "latest-llm-updates-monthly",
    "category": "Industry News",
    "excerpt": "Model improvements, benchmark shifts, and what they mean for practitioners.",
    "date": "2026-02-03",
    "readTime": "7 min read",
    "tags": [
      "LLM News"
    ],
    "image": "https://picsum.photos/seed/ai12/800/500",
    "url": "posts/latest-llm-updates-monthly.html"
  },
  {
    "id": 6,
    "title": "Zapier vs Make in 2026: Which One Should You Choose?",
    "slug": "zapier-vs-make-2026",
    "category": "Automation Tutorials",
    "excerpt": "A direct comparison of pricing, complexity, reliability, and ecosystem.",
    "date": "2026-02-01",
    "readTime": "9 min read",
    "tags": [
      "Zapier",
      "Make"
    ],
    "image": "https://picsum.photos/seed/ai11/800/500",
    "url": "posts/zapier-vs-make-2026.html"
  },
  {
    "id": 7,
    "title": "Build an LLM-Powered FAQ Assistant in 1 Hour",
    "slug": "build-llm-faq-assistant",
    "category": "LLM Guides",
    "excerpt": "A fast path to shipping an internal support assistant with guardrails.",
    "date": "2026-01-30",
    "readTime": "12 min read",
    "tags": [
      "LLM API",
      "FAQ"
    ],
    "image": "https://picsum.photos/seed/ai10/800/500",
    "url": "posts/build-llm-faq-assistant.html"
  },
  {
    "id": 8,
    "title": "Best AI Tools for Small Business Operations",
    "slug": "best-ai-tools-small-business-ops",
    "category": "AI Tools",
    "excerpt": "Practical software stack recommendations for automation-ready small teams.",
    "date": "2026-01-28",
    "readTime": "10 min read",
    "tags": [
      "Small Business"
    ],
    "image": "https://picsum.photos/seed/ai9/800/500",
    "url": "posts/best-ai-tools-small-business-ops.html"
  },
  {
    "id": 9,
    "title": "I Automated My Content Pipeline for 30 Days: Results",
    "slug": "automated-content-pipeline-results",
    "category": "Case Studies",
    "excerpt": "What improved, what failed, and what to copy in your own content workflow.",
    "date": "2026-01-26",
    "readTime": "8 min read",
    "tags": [
      "Case Study",
      "Content"
    ],
    "image": "https://picsum.photos/seed/ai8/800/500",
    "url": "posts/automated-content-pipeline-results.html"
  },
  {
    "id": 10,
    "title": "AI Industry Weekly: Top Updates You Should Not Miss",
    "slug": "ai-industry-weekly-updates",
    "category": "Industry News",
    "excerpt": "A concise roundup of notable model launches, API changes, and funding news.",
    "date": "2026-01-24",
    "readTime": "6 min read",
    "tags": [
      "AI News"
    ],
    "image": "https://picsum.photos/seed/ai7/800/500",
    "url": "posts/ai-industry-weekly-updates.html"
  },
  {
    "id": 11,
    "title": "No-Code Automation with Make: A Step-by-Step Guide",
    "slug": "make-no-code-automation-guide",
    "category": "Automation Tutorials",
    "excerpt": "Learn how to automate lead routing and customer updates using Make.",
    "date": "2026-01-22",
    "readTime": "9 min read",
    "tags": [
      "Make",
      "Automation"
    ],
    "image": "https://picsum.photos/seed/ai6/800/500",
    "url": "posts/make-no-code-automation-guide.html"
  },
  {
    "id": 12,
    "title": "Prompt Engineering Tips for Business Teams",
    "slug": "prompt-engineering-business-teams",
    "category": "LLM Guides",
    "excerpt": "Prompt frameworks that improve output quality and reduce iteration time.",
    "date": "2026-01-20",
    "readTime": "11 min read",
    "tags": [
      "Prompt Engineering"
    ],
    "image": "https://picsum.photos/seed/ai5/800/500",
    "url": "posts/prompt-engineering-business-teams.html"
  },
  {
    "id": 13,
    "title": "15 Free AI Tools That Save 10+ Hours Per Week",
    "slug": "free-ai-tools-productivity",
    "category": "AI Tools",
    "excerpt": "A curated list of high-value free tools for creators, teams, and founders.",
    "date": "2026-01-18",
    "readTime": "8 min read",
    "tags": [
      "AI Tools",
      "Productivity"
    ],
    "image": "https://picsum.photos/seed/ai4/800/500",
    "url": "posts/free-ai-tools-productivity.html"
  },
  {
    "id": 14,
    "title": "How to Automate Email Workflows with ChatGPT and Zapier",
    "slug": "automate-email-chatgpt-zapier",
    "category": "Automation Tutorials",
    "excerpt": "Build a no-code automation pipeline for triage, drafting, and follow-ups.",
    "date": "2026-01-16",
    "readTime": "9 min read",
    "tags": [
      "Zapier",
      "No-Code"
    ],
    "image": "https://picsum.photos/seed/ai3/800/500",
    "url": "posts/automate-email-chatgpt-zapier.html"
  },
  {
    "id": 15,
    "title": "ChatGPT vs Claude vs Gemini: Best Assistant by Use Case",
    "slug": "chatgpt-vs-claude-vs-gemini",
    "category": "LLM Guides",
    "excerpt": "Compare strengths, costs, and best-fit scenarios across leading AI assistants.",
    "date": "2026-01-14",
    "readTime": "10 min read",
    "tags": [
      "ChatGPT",
      "Claude",
      "Gemini"
    ],
    "image": "https://picsum.photos/seed/ai2/800/500",
    "url": "posts/chatgpt-vs-claude-vs-gemini.html"
  },
  {
    "id": 16,
    "title": "The Complete Guide to AI Automation for Beginners in 2026",
    "slug": "ai-automation-guide-2026",
    "category": "Automation Tutorials",
    "excerpt": "A practical roadmap for getting started with AI-powered workflows from zero.",
    "date": "2026-01-12",
    "readTime": "12 min read",
    "tags": [
      "AI Automation",
      "Beginner"
    ],
    "image": "https://picsum.photos/seed/ai1/800/500",
    "url": "posts/ai-automation-guide-2026.html"
  }
];
