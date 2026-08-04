import app from "./app";
import config from "./config";

if (config.NODE_ENV !== "production") {
  app.listen(config.PORT, () => {
    console.log(`Server is running on Port ${config.PORT}`);
  });
}

export default app;
