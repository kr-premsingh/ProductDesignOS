import { buildApp } from "./app";

const port = Number(process.env.PORT || 4000);
const app = buildApp();

app.listen({ port, host: "0.0.0.0" }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
