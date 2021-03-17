import Link from "next/link";
export default ({ currentuser }) => {
  const links = [
    !currentuser && { label: "Sign Up", href: "/auth/signup" },
    !currentuser && { label: "Sign In", href: "/auth/signin" },
    currentuser && { label: "Sell Tickets", href: "/tickets/new" },
    currentuser && { label: "My orders", href: "/orders" },
    currentuser && { label: "Sign Out", href: "/auth/signout" },
  ]
    .filter((linkConfig) => {
      return linkConfig;
    })
    .map(({ label, href }) => {
      return (
        <li className="nav-item" key={href}>
          <Link href={href}>
            <a className="nav-link">{label}</a>
          </Link>
        </li>
      );
    });
  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">GitTix</a>
      </Link>
      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">{links}</ul>
      </div>
    </nav>
  );
};
