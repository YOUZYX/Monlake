/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_QUICKNODE_RPC_URL: string
  readonly VITE_DRPC_RPC_URL: string
  readonly VITE_ALCHEMY_RPC_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}