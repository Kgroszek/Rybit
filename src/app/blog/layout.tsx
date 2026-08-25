import type { ReactNode } from "react";

import { PublicBlogHeader } from "@/components/blog/PublicBlogHeader";

// Publiczny blog celowo nie odczytuje sesji.
// Dzięki temu cache publicznych stron nie zależy od zalogowanego użytkownika.
export default function BlogLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <PublicBlogHeader />
      {children}
    </div>
  );
}
