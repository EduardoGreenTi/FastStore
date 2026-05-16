module.exports = {
  contentSource: {
    type: "CMS",
  },
  seo: {
    title: "FastStore",
    description: "A fast and performant store framework",
    titleTemplate: "%s | FastStore",
    author: "FastStore",
  },

  // Theming
  theme: "custom-theme",

  // Ecommerce Platform
  platform: "vtex",

  // Platform specific configs for API
  api: {
    storeId: "eduardofuentes",
    workspace: "master",
    environment: "vtexcommercestable",
    hideUnavailableItems: true,
    incrementAddress: false,
  },

  // Default session
  session: {
    currency: {
      code: "CLP",
      symbol: "$",
    },
    locale: "en-US",
    channel: '{"salesChannel":"1","regionId":"","hasOnlyDefaultSalesChannel":"true"}',
    country: "CHL",
    deliveryMode: null,
    addressType: null,
    postalCode: null,
    geoCoordinates: null,
    person: null,
  },

  cart: {
    id: "",
    items: [],
    messages: [],
    shouldSplitItem: true,
  },

  // Production URLs
  storeUrl: "https://eduardofuentes.myvtex.com",
  secureSubdomain: "https://eduardofuentes.myvtex.com",
  checkoutUrl: "https://eduardofuentes.myvtex.com/checkout",
  loginUrl: "https://eduardofuentes.myvtex.com/api/io/login",
  accountUrl: "https://eduardofuentes.myvtex.com/api/io/account",

  previewRedirects: {
    home: "/",
    plp: "/s?q=trioval",
    search: "/s?q=trioval",
    pdp: "/trioval/p",
  },

  // Lighthouse CI
  lighthouse: {
    server: process.env.BASE_SITE_URL || "http://localhost:3000",
    pages: {
      home: "/",
      pdp: "/trioval/p",
      collection: "/s?q=trioval",
    },
  },

  // E2E CI
  cypress: {
    pages: {
      home: "/",
      pdp: "/trioval/p",
      collection: "/s?q=trioval",
      collection_filtered: "/s?q=trioval",
      search: "/s?q=trioval",
    },
    browser: "electron",
  },

  analytics: {
    // https://developers.google.com/tag-platform/tag-manager/web#standard_web_page_installation,
    gtmContainerId: "",
  },

  experimental: {
    nodeVersion: 24,
    cypressVersion: 12,
    enableFaststoreMyAccount: false,
  },

  vtexHeadlessCms: {
    webhookUrls: ["https://eduardofuentes.myvtex.com/cms-releases/webhook-releases"],
  },
};
