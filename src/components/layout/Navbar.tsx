import { useState } from "react";
import { Icon } from "@/components/ui/Icons";
import { Brand } from "@/components/layout/Brand";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function closeMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <>
      <div className="announcement">
        <Icon name="spark" size={15} />
        Straight answers. Clear scopes. Roofing that earns its keep.
        <a href="#estimate">
          Request an estimate <Icon name="arrow" size={13} />
        </a>
      </div>
      <header className="site-header">
        <Brand />
        <button
          className="mobile-menu-toggle"
          aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <Icon name={mobileMenuOpen ? "close" : "menu"} size={23} />
        </button>
        <nav
          id="primary-navigation"
          className={mobileMenuOpen ? "main-nav open" : "main-nav"}
          aria-label="Main navigation"
        >
          <a href="#services" onClick={closeMenu}>Services</a>
          <a href="#process" onClick={closeMenu}>Our process</a>
          <a href="#reviews" onClick={closeMenu}>Why us</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
          <a className="button button-dark nav-cta" href="#estimate" onClick={closeMenu}>
            Get an estimate <Icon name="arrow" size={16} />
          </a>
        </nav>
      </header>
    </>
  );
}
