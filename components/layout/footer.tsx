"use client";

import Link from 'next/link';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BUSINESS_NAME, BUSINESS_TAGLINE } from '@/lib/constants';
import { Reveal } from '@/components/shared/reveal';

const quickLinks = [
  { name: 'Shop All', href: '/shop' },
  { name: 'Art & Crafts', href: '/shop?category=art-crafts' },
  { name: 'Healthy Foods', href: '/healthy-foods' },
  { name: 'Custom Cakes', href: '/cakes' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

const supportLinks = [
  { name: 'FAQ', href: '/faq' },
  { name: 'Shipping Info', href: '/faq' },
  { name: 'Returns', href: '/faq' },
  { name: 'Track Order', href: '/track-order' },
  { name: 'Privacy Policy', href: '/faq' },
  { name: 'Terms of Service', href: '/faq' },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-muted/20">
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <Reveal className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-7 w-7 text-primary" />
              <span className="text-lg font-bold">{BUSINESS_NAME}</span>
            </Link>
            <p className="text-sm text-muted-foreground">{BUSINESS_TAGLINE}</p>
            <div className="flex gap-3">
              {['f', 'in', 'x'].map((label) => (
                <a
                  key={label}
                  href="#"
                  aria-label={`Social link ${label}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-xs font-semibold uppercase text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {label}
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h3 className="mb-4 font-semibold">Quick Links</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.1}>
            <h3 className="mb-4 font-semibold">Support</h3>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.15} className="space-y-4">
            <h3 className="font-semibold">Stay Connected</h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>123 Artisan Way, Creative District</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>hello@artisanhaven.com</span>
              </div>
            </div>
            <form className="flex gap-2">
              <Input type="email" placeholder="Your email" className="flex-1 text-sm" />
              <Button type="submit" size="sm">
                Join
              </Button>
            </form>
          </Reveal>
        </div>

        <Separator className="my-10" />

        <Reveal delay={0.2}>
          <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground md:flex-row">
            <p>&copy; {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.</p>
            <p>Made with ♥ for a sustainable future</p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
