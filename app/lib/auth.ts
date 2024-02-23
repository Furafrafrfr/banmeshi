import {
  LoaderFunction,
  LoaderFunctionArgs,
  json,
} from "@remix-run/cloudflare";
import { Env } from "~/types";

type LoaderFunctionBuilder<T> = (
  args: LoaderFunctionArgs,
  ...others: T[]
) => (loader: LoaderFunction) => ReturnType<LoaderFunction>;

const auth: LoaderFunctionBuilder<never> = (args) => {
  return async (loader) => {
    const env = args.context.env as Env;
    const authorization = args.request.headers.get("Authorization");
    if (authorization) {
      const [username, password] = atob(authorization.slice(6)).split(":");
      const hash = await env.ADMIN_USER.get(username);
      const input = Array.from(
        new Uint8Array(
          await crypto.subtle.digest(
            "sha-512",
            new TextEncoder().encode(password)
          )
        )
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .trim();

      if (input === hash) {
        return await loader(args);
      }
    }
    return json({ isAuthorized: false }, { status: 401 });
  };
};

export default auth;
