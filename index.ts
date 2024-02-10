import { html, htmlResponse } from "./html.ts";

let items = ["buy milk", "walk the dog", "watch a movie"];

const routeHandlers = [
  [
    "POST",
    "/add-todo",
    async (req: Request) => {
      const form = await req.formData();
      const item = form.get("item");
      if (typeof item === "string") items.push(item);
      return new Response(null, { status: 303, headers: { Location: "/" } });
    },
  ],
  [
    "POST",
    "/delete-todo",
    async (req: Request) => {
      const form = await req.formData();
      const item = form.get("item");
      if (typeof item === "string") items = items.filter((i) => i !== item);
      return new Response(null, { status: 303, headers: { Location: "/" } });
    },
  ],
  [
    "GET",
    "/",
    async (_req: Request) =>
      htmlResponse(html`
        <body hx-boost="true">
          <script src="https://unpkg.com/htmx.org@1.9.10"></script>
          <form action="add-todo" method="post">
            <input type="text" name="item" placeholder="add item" />
          </form>
          <ol>
            ${items.map(
              (item) =>
                html`<li>
                  <div style="display: flex; gap: .5rem;">
                    <span>${item}</span>
                    <form action="delete-todo" method="post">
                      <input type="hidden" name="item" value="${item}" />
                      <input type="submit" value="done" />
                    </form>
                  </div>
                </li>`
            )}
          </ol>
        </body>
      `),
  ],
] as const;

const server = Bun.serve({
  fetch: async (req) => {
    const url = new URL(req.url);
    const match = routeHandlers.find(
      ([method, path]) => url.pathname === path && req.method === method
    );
    if (match) return match[2](req);
    return new Response("404 - not found", { status: 404 });
  },
});

console.log(`Listening on http://${server.hostname}:${server.port}`);
