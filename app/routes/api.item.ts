import { AppLoadContext, LoaderFunction, json } from "@remix-run/cloudflare";
import type { Env } from "~/types/Env";
import type { Dish } from "~/types/Dish";

const ITEMS_PER_PAGE = 20;

type Service<T> = (c: AppLoadContext, req: Request) => Promise<T> | T;

const auth = async <T extends Response>(c: AppLoadContext, req: Request, next: Service<T>) => {
  const unauthorized = json({ authorized: false }, { status: 401 });
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return unauthorized;
  }

  const base64 = authHeader.slice("Basic ".length);
  const decoded = Buffer.from(base64, "base64").toString().split(":");

  const username = "admin";
  const password = "1234";

  if (decoded[0] === username && decoded[1] === password) {
    return next(c, req);
  } else {
    return unauthorized;
  }
};

const listDishes = async (c: AppLoadContext, req: Request) => {
  const env = c.env as Env;

  const url = new URL(req.url);
  const qPage = url.searchParams.get("page");
  const page = qPage ? parseInt(qPage) : 1;

  const data = await env.DB.prepare(
    "SELECT * FROM dishes ORDER BY rowid LIMIT ? OFFSET ?;"
  )
    .bind(ITEMS_PER_PAGE, (page - 1) * ITEMS_PER_PAGE)
    .all<Dish>();

  return data.results;
};

const readBodyBinaryString = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  prev: Uint8Array
): Promise<Uint8Array> => {
  const chunk = await reader.read();
  const cur = chunk.value || new Uint8Array();
  const result = new Uint8Array(prev.length + (cur ? cur.length : 0));
  result.set(prev, 0);
  result.set(cur, prev.length);
  if (chunk.done) {
    return result;
  } else {
    return readBodyBinaryString(reader, result);
  }
};

const createNewDish: Service<Response> = async (
  c: AppLoadContext,
  req: Request
) => {
  const env = c.env as Env;

  const reader = req.body?.getReader();

  if (reader) {
    const bodyStr = new TextDecoder().decode(
      await readBodyBinaryString(reader, new Uint8Array())
    );

    const body: Dish = JSON.parse(bodyStr);

    const result = await env.DB.prepare("INSERT INTO dishes VALUES(?, ?, ?)")
      .bind(body.name, body.link, body.memo)
      .run();

    if (result.error) {
      return new Response(undefined, { status: 500 });
    }

    return new Response(undefined, { status: 200 });
  } else {
    return new Response(undefined, { status: 500 });
  }
};

const updateDish: Service<Response> = async (
  c: AppLoadContext,
  req: Request
) => {
  const env = c.env as Env;
  const reader = req.body?.getReader();
  if (reader) {
    const bin = await readBodyBinaryString(reader, new Uint8Array());
    const bodyStr = new TextDecoder().decode(bin);
    const body: Dish = JSON.parse(bodyStr);

    const result = await env.DB.prepare(
      "UPDATE dishes SET name = ? memo = ? WHERE link = ?"
    )
      .bind(body.name, body.memo, body.link)
      .run();

    if (result.error) {
      return new Response("", { status: 500 });
    } else {
      return new Response("", { status: 200 });
    }
  } else {
    return new Response("", { status: 400 });
  }
};

export const loader: LoaderFunction = async ({ context, request }) => {
  switch (request.method) {
    case "GET":
      return listDishes(context, request);
    case "POST":
      return auth(context, request, createNewDish);
    case "PUT":
      return auth(context, request, updateDish);
  }
};
