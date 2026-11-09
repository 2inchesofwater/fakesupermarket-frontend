import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export default {
  route: "studies/sauces",
  storefront: require("./storefront.json")
};
