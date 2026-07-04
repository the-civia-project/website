export const identityFlow = `
flowchart LR
  wallet["EUDI Wallet<br/>government credentials"]
  disclosure["Selective disclosure<br/>/ zero-knowledge proof"]
  verified["Verified account<br/>one human, one account"]
  pseudonym["Pseudonym separation<br/>on-platform handle"]

  wallet --> disclosure --> verified --> pseudonym
`;
