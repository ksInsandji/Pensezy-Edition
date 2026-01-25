/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // REMARQUEZ LE CHANGEMENT ICI :
    '@tailwindcss/postcss': {}, 
    autoprefixer: {},
  },
};

export default config;