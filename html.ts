type EscapedHTML = { __escapedHTML: string };
type HTMLValue = string | EscapedHTML | (string | EscapedHTML)[];

function escapeHtmlValue(value: HTMLValue): EscapedHTML {
  if (typeof value === "string")
    return { __escapedHTML: Bun.escapeHTML(value) };
  if (Array.isArray(value))
    return {
      __escapedHTML: value
        .map(escapeHtmlValue)
        .map((v) => v.__escapedHTML)
        .join(""),
    };
  return value;
}

export function html(
  strings: TemplateStringsArray,
  ...values: HTMLValue[]
): EscapedHTML {
  const escapedValues = values.map((v) => escapeHtmlValue(v));
  return {
    __escapedHTML: strings
      .map(
        (str, i) =>
          str + (escapedValues[i] ? escapedValues[i].__escapedHTML : "")
      )
      .join(""),
  };
}

export function htmlResponse(
  html: EscapedHTML,
  status: number = 200
): Response {
  return new Response(html.__escapedHTML, {
    status,
    headers: { "Content-Type": "text/html" },
  });
}
