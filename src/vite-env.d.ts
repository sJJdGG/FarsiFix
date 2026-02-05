/// <reference types="vite/client" />
/// <reference types="vite-plugin-terminal/client" />

interface ImportMetaEnv {
  readonly VITE_MAX_FILE_SIZE_MB?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
