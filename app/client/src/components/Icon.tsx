import { type ReactNode } from "react";

export default function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    compass: <><circle cx="12" cy="12" r="9" /><path d="m16.2 7.8-2.7 5.7-5.7 2.7 2.7-5.7 5.7-2.7Z" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></>,
    leaf: <><path d="M20 4c-8.2 0-13 3.6-13 9a6 6 0 0 0 6 6c5.4 0 9-4.8 7-15Z" /><path d="M4 21c2.2-4.8 5.6-8.1 11-11" /></>,
    mountain: <><path d="m3 20 7-13 4 7 2-3 5 9H3Z" /><path d="m8.5 10 1.5 2 1.4-1.2" /></>,
    sprout: <><path d="M12 21v-9" /><path d="M12 12c0-4-2.5-6-7-6 0 4.5 2 7 7 7m0-3c0-4 2.5-6 7-6 0 4.5-2 7-7 7" /><path d="M8 21h8" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4 4" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  };

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}