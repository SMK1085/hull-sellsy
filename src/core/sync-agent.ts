import { AwilixContainer, asClass } from "awilix";
import { ServiceClient } from "./service-client";
import { LoggingUtil } from "../utils/logging-util";
import { FilterUtil } from "../utils/filter-util";
import { MappingUtil } from "../utils/mapping-util";
import { ConnectorStatusResponse } from "../types/connector-status";
import { Logger } from "winston";
import { PrivateSettings } from "./connector";
import IHullClient from "../types/hull-client";
import {
  isNil,
  cloneDeep,
  forEach,
  pick,
  get,
  set,
  first,
  forIn,
} from "lodash";
import {
  ERROR_UNHANDLED_GENERIC,
  STATUS_SETUPREQUIRED_CONSUMERSECRET,
  STATUS_SETUPREQUIRED_CONSUMERTOKEN,
  STATUS_SETUPREQUIRED_USERTOKEN,
  STATUS_SETUPREQUIRED_USERSECRET,
} from "./messages";
import { ConnectorRedisClient } from "../utils/redis-client";
import IHullAccountUpdateMessage from "../types/account-update-message";
import asyncForEach from "../utils/async-foreach";
import {
  OutgoingOperationEnvelope,
  SELLSY_DEFAULTFIELDS_CLIENT,
  SELLSY_DEFAULTFIELDS_CONTACT,
  SellsyCustomField,
  SellsyFieldDefinition,
  SellsyFieldType,
  SELLSY_DEFAULTFIELDS_PROSPECT,
  SellsyWebhookRequest,
} from "./service-objects";
import IHullUserUpdateMessage from "../types/user-update-message";
import { FieldsSchema } from "../types/fields-schema";
import { CachingUtil } from "../utils/caching-util";

export class SyncAgent {
  public readonly diContainer: AwilixContainer;

  constructor(container: AwilixContainer) {
    this.diContainer = container;
    this.diContainer.register("serviceClient", asClass(ServiceClient));
    this.diContainer.register("loggingUtil", asClass(LoggingUtil));
    this.diContainer.register("filterUtil", asClass(FilterUtil));
    this.diContainer.register("mappingUtil", asClass(MappingUtil));
  }

  /**
   * Processes outgoing notifications for user:update lane.
   *
   * @param {IHullUserUpdateMessage[]} messages The notification messages.
   * @param {boolean} [isBatch=false] `True` if it is a batch; otherwise `false`.
   * @returns {Promise<unknown>} An awaitable Promise.
   * @memberof SyncAgent
   */
  public async sendUserMessages(
    messages: IHullUserUpdateMessage[],
    isBatch = false,
  ): Promise<void> {
    const logger = this.diContainer.resolve<Logger>("logger");
    const loggingUtil = this.diContainer.resolve<LoggingUtil>("loggingUtil");
    const correlationKey = this.diContainer.resolve<string>("correlationKey");
    const hullClient = this.diContainer.resolve<IHullClient>("hullClient");

    try {
      const connectorId = this.diContainer.resolve<string>("hullAppId");
      if (isBatch === true) {
        logger.debug(
          loggingUtil.composeOperationalMessage(
            "OPERATION_SENDUSERMESSAGESBATCH_START",
            correlationKey,
          ),
        );
      } else {
        logger.debug(
          loggingUtil.composeOperationalMessage(
            "OPERATION_SENDUSERMESSAGES_START",
            correlationKey,
          ),
        );
      }

      logger.info(
        loggingUtil.composeMetricMessage(
          "OPERATION_SENDUSERMESSAGES_COUNT",
          correlationKey,
          messages.length,
        ),
      );

      const filterUtil = this.diContainer.resolve<FilterUtil>("filterUtil");
      const envelopesFiltered = filterUtil.filterUserMessagesInitial(
        messages,
        isBatch,
      );

      forEach(envelopesFiltered.skips, (envelope) => {
        hullClient
          .asUser(envelope.message.user)
          .logger.info(
            `outgoing.${envelope.objectType}.${envelope.operation}`,
            {
              details: envelope.notes,
            },
          );
      });

      // TODO: Add handling

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_SENDUSERMESSAGES_SUCCESS",
          correlationKey,
        ),
      );
    } catch (error) {
      logger.error(
        loggingUtil.composeErrorMessage(
          "OPERATION_SENDUSERMESSAGES_UNHANDLED",
          cloneDeep(error),
          correlationKey,
        ),
      );
    }
  }

  /**
   * Processes outgoing notifications for account:update lane.
   *
   * @param {IHullAccountUpdateMessage[]} messages The notification messages.
   * @param {boolean} [isBatch=false] `True` if it is a batch; otherwise `false`.
   * @returns {Promise<unknown>} An awaitable Promise.
   * @memberof SyncAgent
   */
  public async sendAccountMessages(
    messages: IHullAccountUpdateMessage[],
    isBatch = false,
  ): Promise<void> {
    const logger = this.diContainer.resolve<Logger>("logger");
    const loggingUtil = this.diContainer.resolve<LoggingUtil>("loggingUtil");
    const correlationKey = this.diContainer.resolve<string>("correlationKey");
    const hullClient = this.diContainer.resolve<IHullClient>("hullClient");

    try {
      const connectorId = this.diContainer.resolve<string>("hullAppId");
      if (isBatch === true) {
        logger.debug(
          loggingUtil.composeOperationalMessage(
            "OPERATION_SENDACCOUNTMESSAGESBATCH_START",
            correlationKey,
          ),
        );
      } else {
        logger.debug(
          loggingUtil.composeOperationalMessage(
            "OPERATION_SENDACCOUNTMESSAGES_START",
            correlationKey,
          ),
        );
      }

      logger.info(
        loggingUtil.composeMetricMessage(
          "OPERATION_SENDACCOUNTMESSAGES_COUNT",
          correlationKey,
          messages.length,
        ),
      );

      const filterUtil = this.diContainer.resolve<FilterUtil>("filterUtil");
      const envelopesFiltered = filterUtil.filterAccountMessagesInitial(
        messages,
        isBatch,
      );

      forEach(envelopesFiltered.skips, (envelope) => {
        hullClient
          .asAccount(envelope.message.account)
          .logger.info(
            `outgoing.${envelope.objectType}.${envelope.operation}`,
            {
              details: envelope.notes,
            },
          );
      });

      // TODO: Add handling

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_SENDACCOUNTMESSAGES_SUCCESS",
          correlationKey,
        ),
      );
    } catch (error) {
      logger.error(
        loggingUtil.composeErrorMessage(
          "OPERATION_SENDACCOUNTMESSAGES_UNHANDLED",
          cloneDeep(error),
          correlationKey,
        ),
      );
    }
  }

  public async fetchDataFromService(objectType: string): Promise<void> {
    let page = 0;
    let maxPages = 1;

    const connectorId = this.diContainer.resolve<string>("hullAppId");
    const cachingUtil = this.diContainer.resolve<CachingUtil>("cachingUtil");
    const serviceClient = this.diContainer.resolve<ServiceClient>(
      "serviceClient",
    );
    let customFieldsResponse = await cachingUtil.getCachedApiResponse(
      `${connectorId}_cfs_p1`,
      () => serviceClient.getCustomFields({ pagenum: 1, nbperpage: 100 }),
      5 * 60,
    );
    let cfPage = 1;
    let customFields = {
      ...customFieldsResponse.data?.response.result,
    };
    if (
      customFieldsResponse.data &&
      customFieldsResponse.data.response.infos.nbpages > cfPage
    ) {
      cfPage += 1;
      customFieldsResponse = await cachingUtil.getCachedApiResponse(
        `${connectorId}_cfs_p${cfPage}`,
        () =>
          serviceClient.getCustomFields({ pagenum: cfPage, nbperpage: 100 }),
        5 * 60,
      );
      customFields = {
        ...customFields,
        ...customFieldsResponse.data?.response.result,
      };
    }

    // Transform the custom fields into a list form
    const customFieldsList: SellsyCustomField[] = [];
    forIn(customFields, (v, k) => {
      if (objectType === "clients") {
        if (v.useOn_client === "Y" || v.useOn_people === "Y") {
          customFieldsList.push(v);
        }
      } else if (objectType === "prospects") {
        if (v.useOn_prospect === "Y" || v.useOn_people === "Y") {
          customFieldsList.push(v);
        }
      } else if (objectType === "contacts") {
        if (v.useOn_people === "Y") {
          customFieldsList.push(v);
        }
      }
    });

    const customFieldDefs: SellsyFieldDefinition[] = customFieldsList.map(
      (cf) => {
        return {
          code: cf.code,
          isDefault: false,
          label: cf.name,
          readonly: false,
          type: cf.type as SellsyFieldType,
        };
      },
    );
    const mappingUtil = this.diContainer.resolve<MappingUtil>("mappingUtil");
    const hullClient = this.diContainer.resolve<IHullClient>("hullClient");

    while (page < maxPages) {
      page += 1;

      switch (objectType) {
        case "prospects":
          const prospectResult = await serviceClient.getProspects({
            pagenum: page,
            nbperpage: 50,
          });
          if (prospectResult.success && prospectResult.data) {
            maxPages = prospectResult.data.response.infos.nbpages;
            const hullApiCalls: Promise<unknown>[] = [];
            forIn(prospectResult.data.response.result, (v, k) => {
              if (v.type === "corporation") {
                // Import as account
                const acctIdent = mappingUtil.mapClientProspectToHullAccountIdentity(
                  v,
                );
                const acctAttribs = mappingUtil.mapToHullAttributes(
                  v,
                  "prospect",
                  undefined,
                  customFieldDefs,
                );
                console.log(acctIdent, acctAttribs);
                hullApiCalls.push(
                  hullClient.asAccount(acctIdent).traits(acctAttribs),
                );
                if (v.contacts) {
                  forIn(v.contacts, (contact, contactId) => {
                    const contactIdentity = mappingUtil.mapContactToHullUserIdentity(
                      contact,
                    );
                    const contactAttribs = mappingUtil.mapToHullAttributes(
                      contact,
                      "contact",
                      v.id,
                      customFieldDefs,
                    );
                    console.log(contactIdentity, contactAttribs);
                    hullApiCalls.push(
                      hullClient.asUser(contactIdentity).traits(contactAttribs),
                    );
                  });
                }
              } else {
                // Import as user
                const userIdent = mappingUtil.mapClientProspectToHullUserIdentity(
                  v,
                );
                const userAttribs = mappingUtil.mapToHullAttributes(
                  v,
                  "prospect",
                  undefined,
                  customFieldDefs,
                );
                console.log(userIdent, userAttribs);
                hullApiCalls.push(
                  hullClient.asUser(userIdent).traits(userAttribs),
                );
              }
            });

            await Promise.all(hullApiCalls);
          }
          break;
        case "clients":
          const clientResult = await serviceClient.getClients({
            pagenum: page,
            nbperpage: 50,
          });
          console.log(clientResult);
          if (clientResult.success && clientResult.data) {
            maxPages = clientResult.data.response.infos.nbpages;
            const hullApiCalls: Promise<unknown>[] = [];
            forIn(clientResult.data.response.result, (v, k) => {
              if (v.type === "corporation") {
                // Import as account
                const acctIdent = mappingUtil.mapClientProspectToHullAccountIdentity(
                  v,
                );
                const acctAttribs = mappingUtil.mapToHullAttributes(
                  v,
                  "client",
                  undefined,
                  customFieldDefs,
                );
                console.log(acctIdent, acctAttribs);
                hullApiCalls.push(
                  hullClient.asAccount(acctIdent).traits(acctAttribs),
                );
                if (v.contacts) {
                  forIn(v.contacts, (contact, contactId) => {
                    const contactIdentity = mappingUtil.mapContactToHullUserIdentity(
                      contact,
                    );
                    const contactAttribs = mappingUtil.mapToHullAttributes(
                      contact,
                      "contact",
                      v.id,
                      customFieldDefs,
                    );
                    console.log(contactIdentity, contactAttribs);
                    hullApiCalls.push(
                      hullClient.asUser(contactIdentity).traits(contactAttribs),
                    );
                  });
                }
              } else {
                // Import as user
                const userIdent = mappingUtil.mapClientProspectToHullUserIdentity(
                  v,
                );
                const userAttribs = mappingUtil.mapToHullAttributes(
                  v,
                  "client",
                  undefined,
                  customFieldDefs,
                );
                console.log(userIdent, userAttribs);
                hullApiCalls.push(
                  hullClient.asUser(userIdent).traits(userAttribs),
                );
              }
            });

            await Promise.all(hullApiCalls);
          }
          break;
        case "contacts":
          const contactResult = await serviceClient.getContacts({
            pagenum: page,
            nbperpage: 50,
          });
          if (contactResult.success && contactResult.data) {
            maxPages = contactResult.data.response.infos.nbpages;
            const hullApiCalls: Promise<unknown>[] = [];
            forIn(contactResult.data.response.result, (v, k) => {
              // Import as user
              const userIdent = mappingUtil.mapContactToHullUserIdentity(v);
              const userAttribs = mappingUtil.mapToHullAttributes(
                v,
                "contact",
                undefined,
                customFieldDefs,
              );
              console.log(userIdent, userAttribs);
              hullApiCalls.push(
                hullClient.asUser(userIdent).traits(userAttribs),
              );
              if ((v as any).linkedid && (v as any).linkedid !== "") {
                hullApiCalls.push(
                  (hullClient.asUser(userIdent) as any).alias({
                    anonymous_id: `sellsy-contact:${(v as any).linkedid}`,
                  }),
                );
              }
            });

            await Promise.all(hullApiCalls);
          }
          break;
        default:
          // TODO: Log unsupported type
          break;
      }
    }
  }

  public async listIdentityFields(
    objectType: string,
    direction: string,
  ): Promise<FieldsSchema> {
    const result: FieldsSchema = {
      ok: true,
      error: null,
      options: [],
    };

    const connectorId = this.diContainer.resolve<string>("hullAppId");
    const cachingUtil = this.diContainer.resolve<CachingUtil>("cachingUtil");
    const serviceClient = this.diContainer.resolve<ServiceClient>(
      "serviceClient",
    );
    // Retrieve all the custom field groups and custom fields
    let customFieldsResponse = await cachingUtil.getCachedApiResponse(
      `${connectorId}_cfs_p1`,
      () => serviceClient.getCustomFields({ pagenum: 1, nbperpage: 100 }),
      5 * 60,
    );
    let cfPage = 1;
    let customFields = {
      ...customFieldsResponse.data?.response.result,
    };
    if (
      customFieldsResponse.data &&
      customFieldsResponse.data.response.infos.nbpages > cfPage
    ) {
      cfPage += 1;
      customFieldsResponse = await cachingUtil.getCachedApiResponse(
        `${connectorId}_cfs_p${cfPage}`,
        () =>
          serviceClient.getCustomFields({ pagenum: cfPage, nbperpage: 100 }),
        5 * 60,
      );
      customFields = {
        ...customFields,
        ...customFieldsResponse.data?.response.result,
      };
    }

    // Transform the custom fields into a list form
    const customFieldsList: SellsyCustomField[] = [];
    forIn(customFields, (v, k) => {
      if (["corporation", "person"].includes(objectType)) {
        if (v.useOn_client === "Y" || v.useOn_prospect === "Y") {
          customFieldsList.push(v);
        }
      } else if (objectType === "contact") {
        if (v.useOn_people === "Y") {
          customFieldsList.push(v);
        }
      }
    });

    switch (objectType) {
      case "corporation":
      case "person":
        if (direction === "incoming") {
          const defaultOptions = SELLSY_DEFAULTFIELDS_CLIENT.map((sf) => {
            return {
              value: sf.code,
              label: sf.label,
            };
          });
          result.options.push(...defaultOptions);
        } else {
          const defaultOptions = SELLSY_DEFAULTFIELDS_CLIENT.filter((sf) => {
            return sf.readonly === false;
          }).map((sf) => {
            return {
              value: sf.code,
              label: sf.label,
            };
          });
          result.options.push(...defaultOptions);
        }
        const customOptionsClientProspects = customFieldsList.map((cf) => {
          return {
            value: `$customfield.${cf.code}`,
            label: cf.name,
          };
        });
        result.options.push(...customOptionsClientProspects);
        break;
      case "contact":
        if (direction === "incoming") {
          const defaultOptions = SELLSY_DEFAULTFIELDS_CONTACT.map((sf) => {
            return {
              value: sf.code,
              label: sf.label,
            };
          });
          result.options.push(...defaultOptions);
        } else {
          const defaultOptions = SELLSY_DEFAULTFIELDS_CONTACT.filter((sf) => {
            return sf.readonly === false;
          }).map((sf) => {
            return {
              value: sf.code,
              label: sf.label,
            };
          });
          result.options.push(...defaultOptions);
        }
        const customOptionsContacts = customFieldsList.map((cf) => {
          return {
            value: `$customfield.${cf.code}`,
            label: cf.name,
          };
        });
        result.options.push(...customOptionsContacts);
        break;
      default:
        result.ok = false;
        result.error = `Unknown objectType '${objectType}'.`;
        break;
    }

    return result;
  }

  public async listMappingFields(
    objectType: string,
    direction: string,
  ): Promise<FieldsSchema> {
    const result: FieldsSchema = {
      ok: true,
      error: null,
      options: [],
    };

    const connectorId = this.diContainer.resolve<string>("hullAppId");
    const cachingUtil = this.diContainer.resolve<CachingUtil>("cachingUtil");
    const serviceClient = this.diContainer.resolve<ServiceClient>(
      "serviceClient",
    );
    // Retrieve all the custom field groups and custom fields
    let customFieldsResponse = await cachingUtil.getCachedApiResponse(
      `${connectorId}_cfs_p1`,
      () => serviceClient.getCustomFields({ pagenum: 1, nbperpage: 100 }),
      5 * 60,
    );
    let cfPage = 1;
    let customFields = {
      ...customFieldsResponse.data?.response.result,
    };
    if (
      customFieldsResponse.data &&
      customFieldsResponse.data.response.infos.nbpages > cfPage
    ) {
      cfPage += 1;
      customFieldsResponse = await cachingUtil.getCachedApiResponse(
        `${connectorId}_cfs_p${cfPage}`,
        () =>
          serviceClient.getCustomFields({ pagenum: cfPage, nbperpage: 100 }),
        5 * 60,
      );
      customFields = {
        ...customFields,
        ...customFieldsResponse.data?.response.result,
      };
    }

    // Transform the custom fields into a list form
    const customFieldsList: SellsyCustomField[] = [];
    forIn(customFields, (v, k) => {
      if (objectType === "client") {
        if (v.useOn_client === "Y") {
          customFieldsList.push(v);
        }
      } else if (objectType === "prospect") {
        if (v.useOn_prospect === "Y") {
          customFieldsList.push(v);
        }
      } else if (objectType === "contact") {
        if (v.useOn_people === "Y") {
          customFieldsList.push(v);
        }
      }
    });

    switch (objectType) {
      case "prospect":
        if (direction === "incoming") {
          const defaultOptions = SELLSY_DEFAULTFIELDS_PROSPECT.map((sf) => {
            return {
              value: sf.code,
              label: sf.label,
            };
          });
          result.options.push(...defaultOptions);
          // Add smart-tags to the options
          result.options.push({
            label: "Smart Tags",
            value: "$smartTags",
          });
        } else {
          const defaultOptions = SELLSY_DEFAULTFIELDS_PROSPECT.filter((sf) => {
            return sf.readonly === false;
          }).map((sf) => {
            return {
              value: sf.code,
              label: sf.label,
            };
          });
          result.options.push(...defaultOptions);
        }
        const customOptionsClientProspects = customFieldsList.map((cf) => {
          return {
            value: `$customfield.${cf.code}`,
            label: cf.name,
          };
        });
        result.options.push(...customOptionsClientProspects);
        break;
      case "client":
        if (direction === "incoming") {
          const defaultOptions = SELLSY_DEFAULTFIELDS_CLIENT.map((sf) => {
            return {
              value: sf.code,
              label: sf.label,
            };
          });
          result.options.push(...defaultOptions);
          // Add smart-tags to the options
          result.options.push({
            label: "Smart Tags",
            value: "$smartTags",
          });
        } else {
          const defaultOptions = SELLSY_DEFAULTFIELDS_CLIENT.filter((sf) => {
            return sf.readonly === false;
          }).map((sf) => {
            return {
              value: sf.code,
              label: sf.label,
            };
          });
          result.options.push(...defaultOptions);
        }
        const customOptionsClientClients = customFieldsList.map((cf) => {
          return {
            value: `$customfield.${cf.code}`,
            label: cf.name,
          };
        });
        result.options.push(...customOptionsClientClients);
        break;
      case "contact":
        if (direction === "incoming") {
          const defaultOptions = SELLSY_DEFAULTFIELDS_CONTACT.map((sf) => {
            return {
              value: sf.code,
              label: sf.label,
            };
          });
          result.options.push(...defaultOptions);
          // Add smart-tags to the options
          result.options.push({
            label: "Smart Tags",
            value: "$smartTags",
          });
        } else {
          const defaultOptions = SELLSY_DEFAULTFIELDS_CONTACT.filter((sf) => {
            return sf.readonly === false;
          }).map((sf) => {
            return {
              value: sf.code,
              label: sf.label,
            };
          });
          result.options.push(...defaultOptions);
        }
        const customOptionsContacts = customFieldsList.map((cf) => {
          return {
            value: `$customfield.${cf.code}`,
            label: cf.name,
          };
        });
        result.options.push(...customOptionsContacts);
        break;
      default:
        result.ok = false;
        result.error = `Unknown objectType '${objectType}'.`;
        break;
    }

    return result;
  }

  public async handleWebhook(payload: SellsyWebhookRequest): Promise<void> {
    console.log(payload);
    return Promise.resolve();
  }

  /**
   * Determines the overall status of the connector.
   *
   * @returns {Promise<ConnectorStatusResponse>} The status response.
   * @memberof SyncAgent
   */
  public async determineConnectorStatus(): Promise<ConnectorStatusResponse> {
    const logger = this.diContainer.resolve<Logger>("logger");
    const loggingUtil = this.diContainer.resolve<LoggingUtil>("loggingUtil");
    const correlationKey = this.diContainer.resolve<string>("correlationKey");

    const statusResult: ConnectorStatusResponse = {
      status: "ok",
      messages: [],
    };

    try {
      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_CONNECTORSTATUS_START",
          correlationKey,
        ),
      );

      const connectorSettings = this.diContainer.resolve<PrivateSettings>(
        "hullAppSettings",
      );
      const hullClient = this.diContainer.resolve<IHullClient>("hullClient");
      const connectorId = this.diContainer.resolve<string>("hullAppId");

      // Perfom checks to verify setup is complete
      if (isNil(connectorSettings.auth_consumer_secret)) {
        statusResult.status = "setupRequired";
        statusResult.messages.push(STATUS_SETUPREQUIRED_CONSUMERSECRET);
      }

      if (isNil(connectorSettings.auth_consumer_token)) {
        statusResult.status = "setupRequired";
        statusResult.messages.push(STATUS_SETUPREQUIRED_CONSUMERTOKEN);
      }

      if (isNil(connectorSettings.auth_user_secret)) {
        statusResult.status = "setupRequired";
        statusResult.messages.push(STATUS_SETUPREQUIRED_USERSECRET);
      }

      if (isNil(connectorSettings.auth_user_token)) {
        statusResult.status = "setupRequired";
        statusResult.messages.push(STATUS_SETUPREQUIRED_USERTOKEN);
      }

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_CONNECTORSTATUS_STARTHULLAPI",
          correlationKey,
        ),
      );

      await hullClient.put(`${connectorId}/status`, statusResult);

      logger.debug(
        loggingUtil.composeOperationalMessage(
          "OPERATION_CONNECTORSTATUS_SUCCESS",
          correlationKey,
        ),
      );
    } catch (error) {
      const logPayload = loggingUtil.composeErrorMessage(
        "OPERATION_CONNECTORSTATUS_UNHANDLED",
        cloneDeep(error),
        correlationKey,
      );
      logger.error(logPayload);
      statusResult.status = "error";
      if (logPayload && logPayload.message) {
        statusResult.messages.push(logPayload.message);
      } else {
        statusResult.messages.push(ERROR_UNHANDLED_GENERIC);
      }
    }

    return statusResult;
  }
}
