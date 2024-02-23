import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { useFetcher } from "@remix-run/react";
import type { Env, Dish } from "~/types";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader: LoaderFunction = async ({ context }) => {
  const env = context.env as Env;

  let data: Readonly<D1Result<Dish>>;

  do {
    data = await env.DB.prepare(
      "SELECT * FROM dishes WHERE rowid = (SELECT ( SELECT ABS(RANDOM()) % MAX(rowid) FROM dishes) + 1)"
    ).all<Dish>();
  } while (!data);

  return data.results;
};

export default function Index() {
  const randomDish = useFetcher<Dish[]>();
  const dish = randomDish.data?.[0];

  return (
    <main>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          flexFlow: "column",
        }}
      >
        <h1
          style={{
            fontWeight: "normal",
            margin: "0",
            textAlign: "center",
          }}
        >
          今日の晩飯
        </h1>
        {dish ? (
            <div>
              <h2
                style={{
                  fontSize: "1.75rem",
                  fontWeight: "normal",
                  textAlign: "center",
                  width: "100%",
                }}
              >
                <a href={dish.link}>{dish.name}</a>
              </h2>
              {dish.memo.length > 0 && (
                <div style={{ textAlign: "center" }}>{dish.memo}</div>
              )}
              <randomDish.Form style={{ textAlign: "center", margin: "2rem" }}>
                <button type="submit">もう一度決定する</button>
              </randomDish.Form>
            </div>
        ) : randomDish.data && randomDish.data.length === 0 ? (
          <p>no dishes</p>
        ) : (
          <randomDish.Form
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "3rem 0",
            }}
          >
            <button type="submit" style={{ padding: "1rem 2rem" }}>
              決定
            </button>
          </randomDish.Form>
        )}
      </div>
    </main>
  );
}
