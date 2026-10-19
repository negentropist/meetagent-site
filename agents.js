// Scores per scoring guide v0.1 (documentation-based). null = not disclosed.
window.MEETAGENT = {
  checked: "2026-10-19",
  agents: [
    {
      id: "hex",
      name: "Hex",
      vendor: "Hex Technologies",
      url: "https://hex.tech/",
      plan: "Professional",
      price: "$36/editor/mo",
      models: "Not disclosed (Enterprise can bring OpenAI or Anthropic keys)",
      checked: "2026-10-19",
      best_for: "Warehouse-based teams",
      verdict: "A full data notebook with an agent that writes and edits SQL, Python and chart cells. Strong on connections and checkability, priced for teams.",
      scores: {
        model: { score: null, reason: "Hex refers to its \"AI providers\" without naming the models.", sources: [{ label: "Hex AI overview", url: "https://learn.hex.tech/docs/getting-started/ai-overview" }] },
        connectivity: { score: 4, reason: "16 native databases and warehouses, including Snowflake, BigQuery, Databricks, Redshift and Postgres. dbt and semantic models appear on higher plans.", sources: [{ label: "Data connections", url: "https://learn.hex.tech/docs/connect-to-data/data-connections/overview" }, { label: "Pricing", url: "https://hex.tech/pricing/" }] },
        analysis: { score: 5, reason: "The Notebook Agent builds and edits SQL, Python and chart cells, and Generative Apps (beta) turn work into data apps. Statistical tests are possible in Python but not called out in the docs.", sources: [{ label: "Hex AI overview", url: "https://learn.hex.tech/docs/getting-started/ai-overview" }] },
        checkability: { score: 5, reason: "Everything the agent writes lives in editable notebook cells with their outputs, and Professional keeps 30 days of version history.", sources: [{ label: "Hex AI overview", url: "https://learn.hex.tech/docs/getting-started/ai-overview" }, { label: "Pricing", url: "https://hex.tech/pricing/" }] },
        privacy: { score: 3, reason: "No training on customer data, zero data retention with AI providers by default, SOC 2 Type II. SSO (OIDC) and single tenant are Enterprise only.", sources: [{ label: "Hex AI overview", url: "https://learn.hex.tech/docs/getting-started/ai-overview" }, { label: "Security", url: "https://hex.tech/security/" }, { label: "Pricing", url: "https://hex.tech/pricing/" }] },
        affordability: { score: 2, reason: "Professional is $36 per editor per month. The free Community plan only includes an agent trial.", sources: [{ label: "Pricing", url: "https://hex.tech/pricing/" }] }
      }
    }
  ]
};
