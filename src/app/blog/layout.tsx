import type { ReactNode } from "react";

import { BlogSessionShell } from "@/components/blog/BlogSessionShell";
import { PublicHeader } from "@/components/public/PublicHeader";

export default function BlogLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <BlogSessionShell publicHeader={<PublicHeader />}>
      {children}
    </BlogSessionShell>
  );
}
