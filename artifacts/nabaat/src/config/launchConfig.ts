/**
 * LAUNCH-DEPENDENT DETAILS — founder confirmation required before launch.
 * Keep pending contact, hours, service area, social, pricing and price-confirmation
 * details here; do not surface unconfirmed values elsewhere.
 */
export const launchConfig = {
  status: 'Preparing to launch in Abu Dhabi',
  email: null as string | null,
  phone: null as string | null,
  whatsapp: null as string | null,
  openingHours: null as string | null,
  deliveryArea: null as string | null,
  socialLinks: {
    instagram: null as string | null,
    tiktok: null as string | null,
  },
  currency: 'AED',
  pricesConfirmed: false,
  prices: {} as Record<string, number>,
} as const;
