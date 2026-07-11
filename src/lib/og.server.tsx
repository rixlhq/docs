import "@tanstack/react-start/server-only";
import fs from "node:fs/promises";
import type {CSSProperties, ReactElement, ReactNode} from "react";
import ImageResponse from "@takumi-rs/image-response";
import path from "node:path";

interface GenerateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  primaryColor?: string;
  secondaryColor?: string;
  primaryTextColor?: string;
  site?: ReactNode;
}

const regularPath = path.join(process.cwd(), "src/lib/og/Inter-Regular.ttf");
const boldPath = path.join(process.cwd(), "src/lib/og/Inter-SemiBold.ttf");

const font = await fs.readFile(regularPath);
const fontBold = await fs.readFile(boldPath);

interface OGImageOptions {
  icon?: ReactNode;
}

interface OGPageData {
  data: {
    title?: string;
    description?: string;
  };
}

export async function generateOGImage(page: OGPageData, options?: OGImageOptions): Promise<Response> {
  const title = page.data.title ?? "Rixl";
  const description = page.data.description;

  const imageOptions = {
    width: 1200,
    height: 630,
    format: "png" as const,
    fonts: [
      {
        name: "Inter",
        data: font,
        weight: 400 as const,
      },
      {
        name: "Inter",
        data: fontBold,
        weight: 600 as const,
      },
    ],
  };

  return new ImageResponse(
    generate({
      title,
      description,
      icon: options?.icon,
    }),
    imageOptions
  );
}

const getTruncatedText = (maxLength: number, text?: string) => {
  if (!text) return "";
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
};

const iconRowStyle: CSSProperties = {display: "flex"};
const contentStyle: CSSProperties = {display: "flex", flexDirection: "column", maxWidth: "80%"};
const titleStyle: CSSProperties = {fontWeight: 600, fontSize: "82px", marginTop: 0, marginBottom: 0};
const descriptionStyle: CSSProperties = {
  fontWeight: 400,
  fontSize: "36px",
  marginBottom: 0,
  color: "rgba(240,240,240,0.8)",
};

function buildRootStyle(primaryColor: string, secondaryColor: string, primaryTextColor: string): CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    width: "100%",
    height: "100%",
    color: primaryTextColor,
    padding: "4rem",
    backgroundImage: `radial-gradient(at top right, ${primaryColor}, ${secondaryColor})`,
  };
}

function TextBlock({title, description}: {title: string; description?: string}) {
  return (
    <div style={contentStyle}>
      <p style={titleStyle}>{title}</p>
      <p style={descriptionStyle}>{getTruncatedText(80, description)}</p>
    </div>
  );
}

function generate({
  primaryColor = "#FFA41C",
  secondaryColor = "#D33F49",
  primaryTextColor = "#FFFFFF",
  title,
  description,
  icon,
}: GenerateProps): ReactElement {
  return (
    <div style={buildRootStyle(primaryColor, secondaryColor, primaryTextColor)}>
      <div style={iconRowStyle}>{icon}</div>
      <TextBlock title={title} description={description} />
    </div>
  );
}
