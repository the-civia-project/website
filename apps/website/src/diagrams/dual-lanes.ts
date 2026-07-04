export const dualLanes = `
flowchart TB
  identity["Shared identity layer<br/>EUDI verification + account"]

  subgraph publicLane ["Public lane"]
    direction LR
    pubPublish["Publish public post"] --> pubStore["Server stores, indexes<br/>content vectors"]
    pubStore --> pubFeed["Feeds: reverse-chronological default<br/>or optional algorithmic pipeline"]
  end

  subgraph privateLane ["Private lane"]
    direction LR
    privEncrypt["Client encrypts<br/>Signal Protocol"] --> privRelay["Server relays ciphertext<br/>holds no keys"]
    privRelay --> privDecrypt["Friends decrypt on device"]
    privDecrypt --> privFeed["Device-assembled feeds<br/>chronological + friends-only"]
  end

  identity --> publicLane
  identity --> privateLane
`;
