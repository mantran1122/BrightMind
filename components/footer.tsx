import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faTwitter,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";

const companyLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Courses", href: "/courses" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "404", href: "/404" },
];

const templateLinks = [
  { label: "looped", href: "#" },
  { label: "axinn", href: "#" },
];

const socialLinks = [
  { icon: faInstagram, href: "#", label: "Instagram" },
  { icon: faFacebookF, href: "#", label: "Facebook" },
  { icon: faTwitter, href: "#", label: "Twitter" },
  { icon: faLinkedinIn, href: "#", label: "LinkedIn" },
];

export default function Footer() {
  return (
    <footer className="bg-[#f3f4f6] pt-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.7fr_0.6fr_0.8fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <FontAwesomeIcon
                icon={faGraduationCap}
                className="h-6 w-6 text-[#0b0b1f]"
              />
              <h2 className="text-[20px] font-bold text-[#0b0b1f]">
                Bright<span className="text-[#8b6cff]">Mind</span>
              </h2>
            </Link>

            <p className="mt-8 max-w-[320px] text-[18px] leading-8 text-[#0b0b1f]">
              Empower your learning journey with modern design and expert-led
              online courses today.
            </p>

            <div className="mt-8 flex items-center gap-5">
              {socialLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className="text-[#0b0b1f] transition hover:text-[#8b6cff]"
                >
                  <FontAwesomeIcon icon={item.icon} className="h-5 w-5" />
                </Link>
              ))}
            </div>

            <Link
              href="/contact"
              className="mt-10 inline-flex items-center justify-center rounded-full bg-[#5b3df5] px-7 py-4 text-base font-semibold text-white transition hover:bg-[#4c31db]"
            >
              Contact Us
            </Link>
          </div>

          <div>
            <h3 className="text-[22px] font-bold text-[#0b0b1f]">Company</h3>
            <ul className="mt-8 space-y-4">
              {companyLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[18px] text-[#0b0b1f] transition hover:text-[#8b6cff]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[22px] font-bold text-[#0b0b1f]">Template</h3>
            <ul className="mt-8 space-y-4">
              {templateLinks.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-[18px] text-[#0b0b1f] transition hover:text-[#8b6cff]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[22px] font-bold text-[#0b0b1f]">Contact</h3>
            <div className="mt-8 space-y-5 text-[18px] leading-8 text-[#0b0b1f]">
              <p>
                <a
                  href="tel:+621829017"
                  className="transition hover:text-[#8b6cff]"
                >
                  +(62) 1829017
                </a>
              </p>
              <p>
                <a
                  href="mailto:meme@brightmind.com"
                  className="transition hover:text-[#8b6cff]"
                >
                  meme@brightmind.com
                </a>
              </p>
              <p>
                <a
                  href="https://maps.app.goo.gl/4V5ctMrPKCooaWSD7"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#8b6cff]"
                >
                  168 Nguyễn Văn Cừ Nối Dài 
                  <br />
                  An Bình, Cần Thơ, Việt Nam
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-gray-300 py-5 text-center text-sm text-gray-700">
          © 2026 BrightMind. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
