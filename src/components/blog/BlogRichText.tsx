import type { ReactNode } from "react";

export function BlogRichText({ text }: { text: string }) {
  return <>{renderRichText(text)}</>;
}

function renderRichText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      pushTextWithBreaks(
        nodes,
        text.slice(lastIndex, match.index),
        key++
      );
    }

    const token = match[0];

    if (token.startsWith("**") && token.endsWith("**")) {
      nodes.push(
        <strong key={`strong-${key++}`} className="font-bold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

      if (linkMatch) {
        const [, label, href] = linkMatch;
        const safeHref = sanitizeHref(href);

        if (safeHref) {
          const external =
            safeHref.startsWith("http://") ||
            safeHref.startsWith("https://");

          nodes.push(
            <a
              key={`link-${key++}`}
              href={safeHref}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="font-semibold text-blue-600 underline decoration-blue-200 underline-offset-2 transition hover:text-blue-700 hover:decoration-blue-400"
            >
              {label}
            </a>
          );
        } else {
          nodes.push(token);
          key++;
        }
      }
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    pushTextWithBreaks(nodes, text.slice(lastIndex), key++);
  }

  return nodes;
}

function pushTextWithBreaks(
  nodes: ReactNode[],
  value: string,
  keyBase: number
) {
  const parts = value.split("\n");

  parts.forEach((part, index) => {
    if (part) {
      nodes.push(
        <span key={`text-${keyBase}-${index}`}>{part}</span>
      );
    }

    if (index < parts.length - 1) {
      nodes.push(<br key={`br-${keyBase}-${index}`} />);
    }
  });
}

function sanitizeHref(value: string) {
  const href = value.trim();

  if (!href) {
    return null;
  }

  if (
    href.startsWith("/") ||
    href.startsWith("#") ||
    href.startsWith("https://") ||
    href.startsWith("http://") ||
    href.startsWith("mailto:")
  ) {
    return href;
  }

  return null;
}
