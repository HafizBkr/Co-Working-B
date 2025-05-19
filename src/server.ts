import app from "./app";
import { connectDB } from "./configs/mongodb";
import { config } from "./configs/configs";

const port = config.port;

connectDB().then(() => {
  app.listen(port, (error) => {
    if (!error) console.log(`App listening om port ${port}`);
    else console.log("Error occurred, server can't start", error);
  });
});
