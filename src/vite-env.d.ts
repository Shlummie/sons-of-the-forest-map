/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_COORDINATE_EDITOR?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
