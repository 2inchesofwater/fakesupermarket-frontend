import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export default {
  route: "studies/breakfastcereal",
  storefront: require("./storefront.json")
};
