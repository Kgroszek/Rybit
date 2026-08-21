import type {
  ReactNode,
} from "react";

export function BlogRichText({
  text,
}: {
  text: string;
}) {
  return (
    <>{renderRichText(text)}</>
  );
}

function renderRichText(
  text: string
): ReactNode[] {
  const nodes: ReactNode[] = [];

  const pattern =
    /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

  let lastIndex = 0;
  let match:
    | RegExpExecArray
    | null;

  let key = 0;

  while (
    (match =
      pattern.exec(text)) !== null
  ) {
    if (
      match.index >
      lastIndex
    ) {
      pushTextWithBreaks(
        nodes,
        text.slice(
          lastIndex,
          match.index
        ),
        key++
      );
    }

    const token = match[0];

    if (
      token.startsWith(
        "**"
      ) &&
      token.endsWith("**")
    ) {
      nodes.push(
        <strong
          key={`strong-${key++}`}
          className="font-extrabold text-text"
        >
          {token.slice(2, -2)}
        </strong>
      );
    } else if (
      token.startsWith("*") &&
      token.endsWith("*")
    ) {
      nodes.push(
        <em
          key={`em-${key++}`}
          className="italic text-text"
        >
          {token.slice(1, -1)}
        </em>
      );
    } else {
      const linkMatch =
        token.match(
          /^\[([^\]]+)\]\(([^)]+)\)$/
        );

      if (linkMatch) {
        const [
          ,
          label,
          href,
        ] = linkMatch;

        const safeHref =
          sanitizeHref(href);

        if (safeHref) {
          const external =
            safeHref.startsWith(
              "http://"
            ) ||
            safeHref.startsWith(
              "https://"
            );

          nodes.push(
            <a
              key={`link-${key++}`}
              href={safeHref}
              target={
                external
                  ? "_blank"
                  : undefined
              }
              rel={
                external
                  ? "noopener noreferrer"
                  : undefined
              }
              className="font-bold text-primary-700 underline decoration-primary-200 underline-offset-4 transition hover:text-primary-900 hover:decoration-primary-400"
            >
              {label}
            </a>
          );
        } else {
          nodes.push(token);
          key += 1;
        }
      }
    }

    lastIndex =
      pattern.lastIndex;
  }

  if (
    lastIndex < text.length
  ) {
    pushTextWithBreaks(
      nodes,
      text.slice(lastIndex),
      key++
    );
  }

  return nodes;
}

function pushTextWithBreaks(
  nodes: ReactNode[],
  value: string,
  keyBase: number
) {
  const parts =
    value.split("\n");

  parts.forEach(
    (part, index) => {
      if (part) {
        nodes.push(
          <span
            key={`text-${keyBase}-${index}`}
          >
            {part}
          </span>
        );
      }

      if (
        index <
        parts.length - 1
      ) {
        nodes.push(
          <br
            key={`br-${keyBase}-${index}`}
          />
        );
      }
    }
  );
}

export function sanitizeBlogHref(
  value: string
) {
  const href = value.trim();

  if (!href) {
    return null;
  }

  if (
    href.startsWith("/") ||
    href.startsWith("#") ||
    href.startsWith(
      "https://"
    ) ||
    href.startsWith(
      "http://"
    ) ||
    href.startsWith(
      "mailto:"
    ) ||
    href.startsWith("tel:")
  ) {
    return href;
  }

  return null;
}

function sanitizeHref(
  value: string
) {
  return sanitizeBlogHref(
    value
  );
}
