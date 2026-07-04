'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/today', label: "Today's Plan" },
  { href: '/dashboard', label: 'Performance' },
  { href: '/leads', label: 'Inbound Leads' },
  { href: '/pipeline', label: 'Deal Pipeline' },
  { href: '/listings', label: 'My Listings' },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="side-nav">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={`nav-link ${path === l.href ? 'active' : ''}`}>{l.label}</Link>
      ))}
    </nav>
  );
}
