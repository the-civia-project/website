export const systemOverview = `
flowchart TB
  subgraph identityLayer ["Identity layer"]
    direction LR
    eudi["EUDI Wallet"] --> zkp["Selective disclosure / ZKP"] --> pseudo["Pseudonym separation"]
  end

  subgraph publicLane ["Public lane"]
    direction TB
    pubPipe["Intent → vector query → filter seen → rank"]
    pubData["Public posts · content vectors · secret follow graph"]
  end

  subgraph privateLane ["Private lane"]
    direction TB
    privPipe["Encrypt → relay ciphertext → decrypt on device"]
    privData["No server-side algorithmic pipeline"]
  end

  subgraph metricsLayer ["Anonymized aggregate metrics"]
    m["DAU/MAU bands · post volume · error rates<br/>no per-user profiling"]
  end

  identityLayer --> publicLane
  identityLayer --> privateLane
  publicLane --> metricsLayer
  privateLane --> metricsLayer
`;
