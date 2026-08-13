"use client";

import {Image} from "@rixl/media-react";

interface Props {
  id: string;
}

export const ImageMDX = ({id}: Props) => {
  return <Image id={id} />;
};
