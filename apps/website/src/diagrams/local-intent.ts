export const localIntent = `
flowchart LR
  subgraph device ["User device"]
    intent["Compute intent<br/>locally"]
    filters["Maintain seen-post filters<br/>Bloom / Cuckoo / Quotient"]
    state["Settings & history<br/>stays on device"]
  end

  subgraph server ["Platform server — per request, not retained"]
    query["Vector DB query"]
    ids["Post IDs"]
    seen["Filter seen posts"]
    rank["Rank"]
    out["Return feed"]
  end

  intent -->|"intent vector"| query
  filters -->|"compact snapshot"| seen
  query --> ids --> seen --> rank --> out
`;
