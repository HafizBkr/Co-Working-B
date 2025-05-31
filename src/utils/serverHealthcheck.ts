import { Response, Request } from "express";

export const healthcheck = async (req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
};
