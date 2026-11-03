import type {SVGProps} from "react";

export function ReactIcon({className, ...props}: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="-11.5 -10.23 23 20.46" aria-hidden="true" className={className} {...props}>
      <title>React</title>
      <circle r="2.05" fill="#61dafb" />
      <g fill="none" stroke="#61dafb">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  );
}

export function VueIcon({className, ...props}: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 261.76 226.69" aria-hidden="true" className={className} {...props}>
      <title>Vue.js</title>
      <path fill="#41b883" d="m161.1 0-30.23 52.35L100.65 0H0l130.87 226.7L261.75 0z" />
      <path fill="#34495e" d="m161.1 0-30.23 52.35L100.65 0h-48.3l78.52 136.01L209.4.01z" />
    </svg>
  );
}

export function SvelteIcon({className, ...props}: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 107 128" aria-hidden="true" className={className} {...props}>
      <title>Svelte</title>
      <path
        fill="#ff3e00"
        d="M94.16 22.82c-10.4-14.89-30.94-19.3-45.8-9.84L22.29 29.61A30 30 0 0 0 8.76 49.65a31.5 31.5 0 0 0 3.11 20.23A30 30 0 0 0 7.4 81.07a32 32 0 0 0 5.44 24.11c10.4 14.89 30.94 19.3 45.8 9.84l26.08-16.63a30 30 0 0 0 13.52-20.04 31.5 31.5 0 0 0-3.11-20.23 30 30 0 0 0 4.47-11.19 32 32 0 0 0-5.44-24.11"
      />
      <path
        fill="#fff"
        d="M45.82 106.58a20.7 20.7 0 0 1-22.24-8.24 19.2 19.2 0 0 1-3.28-14.5 18 18 0 0 1 .63-2.44l.49-1.5 1.33.98a34 34 0 0 0 10.2 5.1l.98.3-.1.96a6 6 0 0 0 1.06 3.88 6.2 6.2 0 0 0 6.7 2.49 6 6 0 0 0 1.6-.7l26.08-16.63a5.4 5.4 0 0 0 2.45-3.63 5.8 5.8 0 0 0-.99-4.37 6.2 6.2 0 0 0-6.7-2.49 6 6 0 0 0-1.6.7l-9.95 6.35a19 19 0 0 1-5.3 2.33 20.7 20.7 0 0 1-22.23-8.25 19.2 19.2 0 0 1-3.28-14.5 18 18 0 0 1 8.13-12.05l26.08-16.62a19 19 0 0 1 5.3-2.33 20.7 20.7 0 0 1 22.24 8.24 19.2 19.2 0 0 1 3.28 14.5 18 18 0 0 1-.63 2.44l-.49 1.5-1.33-.98a34 34 0 0 0-10.2-5.1l-.98-.3.1-.96a6 6 0 0 0-1.06-3.88 6.2 6.2 0 0 0-6.7-2.49 6 6 0 0 0-1.6.7L37.73 51.73a5.4 5.4 0 0 0-2.45 3.63 5.8 5.8 0 0 0 .99 4.37 6.2 6.2 0 0 0 6.7 2.49 6 6 0 0 0 1.6-.7l9.95-6.35a19 19 0 0 1 5.3-2.33 20.7 20.7 0 0 1 22.23 8.25 19.2 19.2 0 0 1 3.28 14.5 18 18 0 0 1-8.13 12.05l-26.08 16.62a19 19 0 0 1-5.3 2.33"
      />
    </svg>
  );
}

export function AngularIcon({className, ...props}: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...props}>
      <title>Angular</title>
      <defs>
        <linearGradient id="angular-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e40046" />
          <stop offset="100%" stopColor="#f637e3" />
        </linearGradient>
      </defs>
      <path
        fill="url(#angular-gradient)"
        d="M16.71 17.71H7.3l-1.2 2.92L12 24l5.92-3.37zM14.7 0l7.83 16.86L23.34 4zM9.31 0 .66 4l.82 12.86zm-.4 13.93h6.2L12 6.4z"
      />
    </svg>
  );
}

export function LitIcon({className, ...props}: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 160 200" aria-hidden="true" className={className} {...props}>
      <title>Lit</title>
      <path fill="#324fff" d="M0 80v80a70.3 70.3 0 0 0 40-40z" />
      <path fill="#283198" d="M40 120c5.7 27.3 5.3 47 0 80L0 160z" />
      <path fill="#0ff" d="M40 120v80l40-40a150 150 0 0 0-40-40" />
      <path fill="#324fff" d="M80 0v80S48.3 55.7 40 40z" />
      <path fill="#324fff" d="M40 40v80a84.8 84.8 0 0 0 40-40z" />
      <path fill="#00e8ff" d="M80 80a182 182 0 0 1 0 80l-40-40z" />
      <path fill="#283198" d="M80 80v80c17-7.5 31.5-19 40-40-5.9-17-18.1-30.9-40-40" />
      <path fill="#283198" d="M120 40v80L80 80z" />
      <path fill="#00e8ff" d="M120 120c6.1 27 4.9 53.6 0 80l-40-40z" />
      <path fill="#324fff" d="M120 120v80l40-40c-5.4-15-18.3-27.9-40-40" />
      <path fill="#324fff" d="M160 80v80l-40-40z" />
    </svg>
  );
}

export function CoreIcon({className, ...props}: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 512 512" fill="none" aria-hidden="true" className={className} {...props}>
      <title>TypeScript</title>
      <rect width="512" height="512" fill="#3178c6" rx="64" />
      <path
        fill="#fff"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M316.94 407.42v50.06q12.2 6.26 28.87 9.4c16.67 3.13 22.83 3.12 35.14 3.12q18 0 34.2-3.44 16.2-3.45 28.4-11.34 12.2-7.9 19.33-20.65c7.13-12.75 7.12-19.01 7.12-31.53q0-13.6-4.07-23.85c-4.07-10.25-6.62-12.9-11.74-18.23q-7.66-7.98-18.39-14.31c-10.73-6.33-15.2-8.22-24.18-11.97a305 305 0 0 1-17.68-7.9 90 90 0 0 1-13.3-7.82 34 34 0 0 1-8.46-8.45 18 18 0 0 1-2.97-10.1q0-5.15 2.66-9.3c2.66-4.15 4.28-5.13 7.51-7.12a40 40 0 0 1 11.9-4.61 69 69 0 0 1 15.65-1.64q6.26 0 13.22.93 6.97.95 14.01 2.9t13.7 4.93a76 76 0 0 1 12.28 6.88V246.6q-11.43-4.38-24.96-6.49c-13.53-2.1-19.38-2.11-31.07-2.11q-17.85 0-33.8 3.83c-15.95 3.83-20 6.55-28.1 11.97a60 60 0 0 0-19.17 20.73q-7.05 12.6-7.04 30.11 0 22.38 12.91 38.18t39.2 26.75q10.33 4.22 19.26 8.29c8.93 4.07 11.08 5.53 15.41 8.45q6.5 4.38 10.25 9.54a19.4 19.4 0 0 1 3.76 11.73q0 4.84-2.35 9c-2.35 4.16-3.94 5.16-7.12 7.2s-7.15 3.62-11.9 4.76q-7.12 1.72-16.66 1.72-16.28 0-32.24-5.7a96 96 0 0 1-29.58-17.14m-84.16-123.34H297V243H118v41.08h63.9V467h50.88z"
      />
    </svg>
  );
}

export function UiIcon({className, ...props}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="#8B5CF6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <title>Rixl UI</title>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}
