"use client";

import * as React from "react";

export function RequestFormWrapper({
  children,
}: {
  children: (open: boolean, setOpen: (o: boolean) => void) => React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return <div className="flex justify-end">{children(open, setOpen)}</div>;
}
