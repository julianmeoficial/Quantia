export type Palette = {
  brand: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    onPrimary: string;
  };
  surface: {
    canvas: string;
    raised: string;
    sunken: string;
    overlay: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  border: {
    subtle: string;
    strong: string;
  };
  focus: {
    ring: string;
  };
  state: {
    success: string;
    successSurface: string;
    warning: string;
    warningSurface: string;
    danger: string;
    dangerSurface: string;
    info: string;
    infoSurface: string;
  };
};

export const lightPalette: Palette = {
  brand: {
    primary: "#1F4E8C",
    primaryHover: "#1A4277",
    primaryActive: "#153762",
    onPrimary: "#FFFFFF",
  },
  surface: {
    canvas: "#F7F8FA",
    raised: "#FFFFFF",
    sunken: "#EEF1F5",
    overlay: "rgb(16 24 40 / 0.5)",
  },
  text: {
    primary: "#1A2230",
    secondary: "#4A5568",
    disabled: "#8A94A6",
    inverse: "#FFFFFF",
  },
  border: {
    subtle: "#D0D5DD",
    strong: "#7A8699",
  },
  focus: {
    ring: "#1F4E8C",
  },
  state: {
    success: "#067647",
    successSurface: "#ECFDF3",
    warning: "#B54708",
    warningSurface: "#FFFAEB",
    danger: "#B42318",
    dangerSurface: "#FEF3F2",
    info: "#175CD3",
    infoSurface: "#EFF8FF",
  },
};

export const darkPalette: Palette = {
  brand: {
    primary: "#7FA8E0",
    primaryHover: "#9BBBE7",
    primaryActive: "#B6CEEE",
    onPrimary: "#0F1520",
  },
  surface: {
    canvas: "#0F1520",
    raised: "#18202D",
    sunken: "#0A0F17",
    overlay: "rgb(0 0 0 / 0.6)",
  },
  text: {
    primary: "#E6EBF2",
    secondary: "#A7B1C2",
    disabled: "#6B7588",
    inverse: "#0F1520",
  },
  border: {
    subtle: "#2C3647",
    strong: "#6B7588",
  },
  focus: {
    ring: "#9BBBE7",
  },
  state: {
    success: "#47CD89",
    successSurface: "#0B2A1C",
    warning: "#FDB022",
    warningSurface: "#2E1F05",
    danger: "#F97066",
    dangerSurface: "#33100D",
    info: "#84ADFF",
    infoSurface: "#0E1F3D",
  },
};
