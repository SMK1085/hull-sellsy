import { Request, Response, RequestHandler, json } from "express";
import { AwilixContainer } from "awilix";
import { Logger } from "winston";
import { cloneDeep } from "lodash";
import { SyncAgent } from "../core/sync-agent";
import { SellsyWebhookRequest } from "../core/service-objects";

export const webhookActionFactory = (): RequestHandler => {
  return async (req: Request, res: Response): Promise<unknown> => {
    let logger: Logger | undefined;
    let correlationKey: string | undefined;

    try {
      const scope = (req as any).scope as AwilixContainer;
      logger = scope.resolve<Logger>("logger");
      correlationKey = scope.resolve<string>("correlationKey");
      const syncAgent = new SyncAgent(scope);
      res.json({ ok: true });
      const parsedBody =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      await syncAgent.handleWebhook(parsedBody as SellsyWebhookRequest);
      return Promise.resolve(true);
    } catch (error) {
      console.error(error);
      if (logger) {
        logger.error({
          code: `ERR-01-001`,
          message: `Unhandled exception at route '${req.method} ${req.url}'`,
          correlationKey,
          errorDetails: cloneDeep(error),
        });
      }
      res
        .status(500)
        .send({ message: "Unknown error", error: { message: error.message } });
      return Promise.resolve(false);
    }
  };
};
