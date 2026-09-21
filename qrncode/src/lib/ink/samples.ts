export type Sample = {
  id: string;
  label: string;
  kind: "text" | "url";
  text: string;
};

export const SAMPLES: Sample[] = [
  {
    id: "zeros",
    label: "4,000 zeros",
    kind: "text",
    text: "0".repeat(4000),
  },
  {
    id: "url",
    label: "Lab URL",
    kind: "url",
    text: "https://www.slidphilabs.com",
  },
  {
    id: "copy",
    label: "Lab copy",
    kind: "text",
    text: "Slid Phi Labs is a compression lab in Cherry Hill. You send a file. We shrink it. You restore every byte.",
  },
  {
    id: "json",
    label: "Repeated JSON",
    kind: "text",
    text: JSON.stringify(
      {
        lab: "Slid Phi Labs",
        product: "INK",
        job: "qr-compressor",
        license: ["AGPL-3.0-or-later", "Commercial"],
      },
      null,
      2,
    ).repeat(12),
  },
];
