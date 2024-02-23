import { Link } from "@remix-run/react";

export default function Header() {
  return (
    <div
      style={{
        position: "sticky",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontSize: "2rem" }}>
        <Link to="/" style={{textDecoration: "none", color: "InfoText"}}>晩飯決定器</Link>
      </div>
      <div>
        <a href="http://x.com/Furafrafrfr">X</a>
      </div>
    </div>
  );
}
