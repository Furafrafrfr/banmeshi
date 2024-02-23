import { Link } from "@remix-run/react";

type PaginationProps = {
  pathname: string;
  current: number;
  end?: boolean;
};

export default function Pagination({
  pathname,
  current,
  end,
}: PaginationProps) {
  const prev = current - 1;
  const next = current + 1;
  return (
    <div>
      {prev > 2 && (
        <>
          <Link to={pathname}>first</Link>...
        </>
      )}
      {prev >= 1 && (
        <>
          <Link
            to={{
              pathname,
              search: `page=${prev}`,
            }}
          >
            {"<"}prev
          </Link>
          ...
        </>
      )}
      <Link to={{ pathname, search: `page=${current}` }}>{current}</Link>
      {!end && (
        <>
          ...
          <Link
            to={{
              pathname: pathname,
              search: `page=${next}`,
            }}
          >
            next{">"}
          </Link>
        </>
      )}
    </div>
  );
}
