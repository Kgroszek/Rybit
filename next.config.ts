import type { NextConfig } from "next";

const remotePatterns: {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
}[] = [];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (supabaseUrl) {
  try {
    const url = new URL(supabaseUrl);
    const protocol = url.protocol.replace(":", "");

    if (protocol === "http" || protocol === "https") {
      remotePatterns.push({
        protocol,
        hostname: url.hostname,
        port: url.port || undefined,
        pathname: "/storage/v1/**",
      });
    }
  } catch {
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
