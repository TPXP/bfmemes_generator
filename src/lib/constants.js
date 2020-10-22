export const ELEMENT_COMPONENTS = [
  {
    key: "text",
    defaultValue: {
      colors: ["#000"],
    },
    icon: "title",
  },
  {
    key: "image",
    defaultValue: {},
    icon: "photo",
  },
  {
    key: "backgroundColors",
    defaultValue: ["#fff"],
    icon: "format_paint",
  },
];

export const MODES = [
  {
    label: 'Express',
    description: 'Les options de base pour les mèmeurs pressés',
  },
  {
    label: 'Avancé',
    description: "Plus d'options pour les habitués",
  },
  {
    label: 'Expert',
    description: 'La totale, parfait pour les perfectionnistes',
  }
];
export const MODE_EXPRESS = 0;
export const MODE_ADVANCED = 1;
export const MODE_EXPERT = 2;