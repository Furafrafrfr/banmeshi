import { HeadersFunction, LoaderFunction } from "@remix-run/cloudflare";
import { Outlet, useLoaderData, useSearchParams, Link } from "@remix-run/react";
import auth from "../lib/auth";
import { Env, Dish } from "~/types";
import Pagination from "~/components/Pagination";

const ITEMS_PER_PAGE = 20;

export const headers: HeadersFunction = () => {
  return {
    "WWW-Authenticate": 'Basic charset="UTF-8"',
  };
};

const _loader: LoaderFunction = async ({ context, request }) => {
  const env = context.env as Env;

  const url = new URL(request.url);
  const qPage = url.searchParams.get("page");
  const page = qPage ? parseInt(qPage) : 1;

  const data = await env.DB.prepare(
    "SELECT * FROM dishes ORDER BY rowid LIMIT ? OFFSET ?;"
  )
    .bind(ITEMS_PER_PAGE, (page - 1) * ITEMS_PER_PAGE)
    .all<Dish>();

  return { isAuthorized: true, payload: data.results };
};

export const loader: LoaderFunction = async (args) => {
  const loaderResult = await auth(args)(_loader);
  return loaderResult;
};

export default function Admin() {
  const dishes = useLoaderData<
    { isAuthorized: false } | { isAuthorized: true; payload: Dish[] }
  >();
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page");
  const cur = page ? parseInt(page, 10) : 1;

  return (
    <>
      <div>
        <div>
          <Link to="/admin/create">Create New</Link>
        </div>
      </div>
      {dishes.isAuthorized ? (
        <>
          {dishes.payload.length > 0 ? (
            <div>
              <Pagination pathname="/admin" current={cur} end={dishes.payload.length < ITEMS_PER_PAGE}/>
              <table>
                <thead>
                  <th>name</th>
                  <th>link</th>
                  <th>memo</th>
                </thead>
                <tbody>
                  {dishes.payload.map((dish) => (
                    <tr key={dish.link}>
                      <td>{dish.name}</td>
                      <td>{dish.link}</td>
                      <td>{dish.memo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>no dishes</div>
          )}
          <div>
            <Outlet />
          </div>
        </>
      ) : (
        "not authorized"
      )}
    </>
  );
}
