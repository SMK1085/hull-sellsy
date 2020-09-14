import { statusActionFactory } from "./status";
import { accountUpdateHandlerFactory } from "./account-update";
import { userUpdateHandlerFactory } from "./user-update";
import { webhookUrlActionFactory } from "./webhook-url";
import { webhookActionFactory } from "./webhook";
import { metaIdentityActionFactory, metaFieldsActionFactory } from "./meta";
import { fetchActionFactory } from "./fetch";

export default {
  status: statusActionFactory,
  accountUpdate: accountUpdateHandlerFactory,
  userUpdate: userUpdateHandlerFactory,
  webhookUrl: webhookUrlActionFactory,
  webhook: webhookActionFactory,
  metaIdentity: metaIdentityActionFactory,
  metaFields: metaFieldsActionFactory,
  fetch: fetchActionFactory,
};
