import type {SVGProps} from "react";

export function ReactIcon({className, ...props}: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="-11.5 -10.23174 23 20.46348" fill="currentColor" aria-hidden="true" className={className} {...props}>
      <title>React</title>
      <circle cx="0" cy="0" r="2.05" fill="#00D8FE" />
      <g stroke="#00D8FE" strokeWidth="1" fill="none">
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
      <path d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z" fill="#42B883" />
      <path d="M161.096.001l-30.225 52.351L100.647.001H52.346l78.526 136.01L209.398.001z" fill="#35495E" />
    </svg>
  );
}

export function SvelteIcon({className, ...props}: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="#FF3E00" aria-hidden="true" className={className} {...props}>
      <title>Svelte</title>
      <path d="M21.996 10.05a6.452 6.452 0 0 0-.649-1.997 7.07 7.07 0 0 0-4.71-3.692 7.037 7.037 0 0 0-5.753 1.127l-5.32 3.86a4.912 4.912 0 0 0-1.848 3.013 4.887 4.887 0 0 0 .584 3.49c.28.483.633.91 1.047 1.267l-1.39 1.01a4.914 4.914 0 0 0-1.848 3.013 4.887 4.887 0 0 0 .584 3.49 4.916 4.916 0 0 0 3.278 2.57 4.945 4.945 0 0 0 4.004-.784l5.32-3.86a4.913 4.913 0 0 0 1.848-3.014 4.891 4.891 0 0 0-.584-3.49 4.922 4.922 0 0 0-1.047-1.267l1.39-1.01a4.913 4.913 0 0 0 1.848-3.014 4.887 4.887 0 0 0-.584-3.49l-.02-.027-.37.269.39-.296zm-9.055 8.79a2.766 2.766 0 0 1-2.253.442 2.75 2.75 0 0 1-1.834-1.44 2.738 2.738 0 0 1-.327-1.954 2.753 2.753 0 0 1 1.036-1.69l1.868-1.356 1.488 1.054a4.92 4.92 0 0 0 2.21.902l-2.188 2.042zm-2.434-6.49l-1.488-1.054a4.923 4.923 0 0 0-2.21-.902l2.188-2.042a2.766 2.766 0 0 1 2.253-.442 2.751 2.751 0 0 1 1.834 1.44c.264.457.382.98.34 1.503a2.75 2.75 0 0 1-.354.451 2.753 2.753 0 0 1-1.036 1.69l-1.527 1.354h-.001v.001z" />
    </svg>
  );
}

export function AngularIcon({className, ...props}: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 250 250" aria-hidden="true" className={className} {...props}>
      <title>Angular</title>
      <polygon fill="#DD0031" points="125,30 125,30 125,30 31.9,63.2 46.1,186.3 125,230 125,230 125,230 203.9,186.3 218.1,63.2" />
      <polygon fill="#C3002F" points="125,30 125,52.2 125,52.1 125,153.4 125,153.4 125,230 125,230 203.9,186.3 218.1,63.2 125,30" />
      <path fill="#FFFFFF" d="M125,52.1L66.8,182.6h21.7l11.7-29.2h49.4l11.7,29.2h21.7L125,52.1z M141.6,134.8h-33.3L125,94.4L141.6,134.8z" />
    </svg>
  );
}

export function LitIcon({className, ...props}: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...props}>
      <title>Lit</title>
      <path fill="#324FFF" d="M6 0l6 6-6 6 6 6-6 6H0l6-6-6-6 6-6L0 0h6z" />
      <path fill="#00E8C6" d="M18 0l6 6-6 6 6 6-6 6h-6l6-6-6-6 6-6-6-6h6z" />
      <path fill="#283198" d="M12 6l6 6-6 6-6-6 6-6z" />
    </svg>
  );
}

export function CoreIcon({className, ...props}: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...props}>
      <title>Media Core</title>
      <rect width="24" height="24" rx="4" fill="#3178C6" />
      <path
        fill="#FFFFFF"
        d="M11.75 16.5h-1.5v-7h-2.5V8.25h6.5V9.5h-2.5v7zm4.75.125c-1.375 0-2.312-.625-2.875-1.562l1.188-.813c.375.625.938 1.063 1.688 1.063.812 0 1.312-.438 1.312-1 0-.625-.562-.875-1.5-1.25-1.375-.562-2.313-1.125-2.313-2.375 0-1.313 1.063-2.313 2.563-2.313 1.187 0 2.062.5 2.625 1.375l-1.125.813c-.375-.5-.813-.813-1.5-.813-.625 0-1.125.375-1.125.875 0 .563.5.75 1.438 1.125 1.437.563 2.375 1.188 2.375 2.5 0 1.5-1.188 2.375-2.75 2.375z"
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
