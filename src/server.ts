import http from "http";
import app from "./app";
import { connectDB } from "./configs/mongodb";
import { config } from "./configs/configs";
import RealtimeService from "./services/realtime.service";

const port = config.port;

const server = http.createServer(app);

const realtimeService = new RealtimeService(server);

export { realtimeService };

connectDB()
  .then(() => {
    server.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error occurred, server can't start", error);
  });
