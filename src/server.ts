import app from "./app.js";
import config from "./config/index.js";

if (config.NODE_ENV !== "production") {
  app.listen(config.PORT, () => {
    console.log(`Server is running on Port ${config.PORT}`);
  });
}

export default app;
