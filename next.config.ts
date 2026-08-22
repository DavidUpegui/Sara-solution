import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // onnxruntime-node carga sus binarios nativos (.so) por dlopen en tiempo de
  // ejecución, por lo que el tracing de standalone no los incluye automáticamente.
  outputFileTracingIncludes: {
    "/*": [
      "./node_modules/onnxruntime-node/bin/**/libonnxruntime.so*",
      "./node_modules/onnxruntime-node/bin/**/libonnxruntime_providers_shared.so",
    ],
  },
};

export default nextConfig;
