/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    printReferences: import('./lib/print-references').PrintReference[];
  }
}
