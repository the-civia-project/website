export const feedPipeline = `
flowchart LR
  s1["1. Intent<br/>computed on device"]
  s2["2. Send intent +<br/>filter snapshot"]
  s3["3. Query vector DB<br/>→ post IDs"]
  s4["4. Probabilistic filters<br/>remove seen posts"]
  s5["5. Ranking model"]
  s6["6. Return ranked feed"]

  s1 --> s2 --> s3 --> s4 --> s5 --> s6
`;
