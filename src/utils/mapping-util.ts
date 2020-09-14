import { Logger } from "winston";
import { set, forIn, snakeCase, forEach, get, isNil } from "lodash";
import { IHullAccountAttributes, IHullAccountClaims } from "../types/account";
import { DateTime } from "luxon";
import { PrivateSettings } from "../core/connector";
import { HullAttribute } from "../types/common-types";
import {
  SellsyClient,
  SellsyProspect,
  SellsyContactBase,
  SellsyCustomField,
  SellsyFieldDefinition,
  SellsyClientCustomField,
  SELLSY_DEFAULTFIELDS_CLIENT,
  SELLSY_DEFAULTFIELDS_CONTACT,
} from "../core/service-objects";
import { IHullUserClaims } from "../types/user";
const ATTRIBUTE_GROUP_PREFIX = "sellsy";
const ATTRIBUTE_GROUP_PREFIX_CONTACT = "sellsy_contact";

export class MappingUtil {
  public readonly appSettings: PrivateSettings;
  public readonly logger: Logger;

  private customFieldDefs?: SellsyFieldDefinition[];

  constructor(options: any) {
    this.logger = options.logger;
    this.appSettings = options.hullAppSettings;
  }

  public mapToHullAttributes<TServiceData>(
    data: TServiceData,
    objectType: string,
    accountId?: string,
    customFieldDefs?: SellsyFieldDefinition[],
  ): { [key: string]: HullAttribute } {
    // Set the custom fields
    this.customFieldDefs = customFieldDefs;

    let result = {};

    switch (objectType) {
      case "client":
        result =
          (data as any).type === "corporation"
            ? this.mapClientToHullAccountAttributes(data as any)
            : this.mapClientToHullUserAttributes(data as any);
        break;
      case "contact":
        result = this.mapContactBaseToHullAttributes(data as any, accountId);
        break;
      case "prospect":
        result =
          (data as any).type === "corporation"
            ? this.mapProspectToHullAccountAttributes(data as any)
            : this.mapProspectToHullUserAttributes(data as any);
        break;
      default:
        throw new Error(`Unsupported type: ${objectType}.`);
    }

    return result;
  }

  public mapClientProspectToHullAccountIdentity<TServiceData>(
    data: TServiceData,
  ): IHullAccountClaims {
    const result = {};

    forEach(this.appSettings.identity_in_corporation, (mapping) => {
      if (mapping.hull && mapping.service) {
        const serviceVal = get(data, mapping.service, null);
        if (!isNil(serviceVal) && serviceVal !== "") {
          if (mapping.hull === "anonymous_id") {
            set(result, mapping.hull, `sellsy:${serviceVal}`);
          } else {
            set(result, mapping.hull, serviceVal);
          }
        }
      }
    });

    if (get(result, "anonymous_id", null) === null) {
      set(result, "anonymous_id", `sellsy:${(data as any).id}`);
    }

    return result;
  }

  public mapClientProspectToHullUserIdentity<TServiceData>(
    data: TServiceData,
  ): IHullUserClaims {
    const result = {};

    forEach(this.appSettings.identity_in_person, (mapping) => {
      if (mapping.hull && mapping.service) {
        const serviceVal = get(data, mapping.service, null);
        if (!isNil(serviceVal) && serviceVal !== "") {
          if (mapping.hull === "anonymous_id") {
            set(result, mapping.hull, `sellsy:${serviceVal}`);
          } else {
            set(result, mapping.hull, serviceVal);
          }
        }
      }
    });

    if (get(result, "anonymous_id", null) === null) {
      set(result, "anonymous_id", `sellsy:${(data as any).id}`);
    }

    return result;
  }

  public mapContactToHullUserIdentity<TServiceData>(
    data: TServiceData,
  ): IHullUserClaims {
    const result = {};

    forEach(this.appSettings.identity_in_contact, (mapping) => {
      if (mapping.hull && mapping.service) {
        const serviceVal = get(data, mapping.service, null);
        if (!isNil(serviceVal) && serviceVal !== "") {
          if (mapping.hull === "anonymous_id") {
            set(result, mapping.hull, `sellsy-contact:${serviceVal}`);
          } else {
            set(result, mapping.hull, serviceVal);
          }
        }
      }
    });

    if (get(result, "anonymous_id", null) === null) {
      set(result, "anonymous_id", `sellsy-contact:${(data as any).id}`);
    }

    return result;
  }

  private mapClientToHullAccountAttributes(
    data: SellsyClient,
  ): { [key: string]: HullAttribute } {
    const result = {};

    forEach(this.appSettings.mapping_in_client_account, (mapping) => {
      if (mapping.hull && mapping.service) {
        if (mapping.service.startsWith("$customfield") === true) {
          const customField = data.customfields.find(
            (cf) => cf.code === mapping.service?.replace("$customfield.", ""),
          );
          if (customField) {
            const fieldDefCf = this.customFieldDefs?.find(
              (fd) => fd.code === mapping.service?.replace("$customfield.", ""),
            );
            set(
              result,
              mapping.hull,
              this.castSellsyApiValueCustomToHullValue(customField, fieldDefCf),
            );
          }
        } else if (mapping.service === "$smartTags") {
          const smartTags: string[] = [];
          forIn(data.smartTags, (v, k) => {
            smartTags.push(v.word);
          });
          set(result, mapping.hull, smartTags);
        } else {
          const serviceVal = get(data, mapping.service, null);
          if (!isNil(serviceVal)) {
            const fieldDefDflt = SELLSY_DEFAULTFIELDS_CLIENT.find(
              (fd) => fd.code === mapping.service,
            );
            set(
              result,
              mapping.hull,
              this.castSellsyApiValueToHullValue(serviceVal, fieldDefDflt),
            );
          }
        }
      }
    });

    // Set the TLA name if not empty string
    if (data.fullName !== "") {
      set(result, "name", {
        value: data.fullName,
        operation: "setIfNull",
      });
    }

    // Set the Sellsy ID attribute
    set(result, "sellsy/id", {
      value: data.id,
      operation: "setIfNull",
    });

    return result;
  }

  private mapClientToHullUserAttributes(
    data: SellsyClient,
  ): { [key: string]: HullAttribute } {
    const result = {};
    console.log(
      ">>> Client/User Mappings",
      this.appSettings.mapping_in_client_person,
    );
    forEach(this.appSettings.mapping_in_client_person, (mapping) => {
      if (mapping.hull && mapping.service) {
        if (mapping.service.startsWith("$customfield") === true) {
          const customField = data.customfields.find(
            (cf) => cf.code === mapping.service?.replace("$customfield.", ""),
          );
          if (customField) {
            const fieldDefCf = this.customFieldDefs?.find(
              (fd) => fd.code === mapping.service?.replace("$customfield.", ""),
            );
            set(
              result,
              mapping.hull.replace("traits_", ""),
              this.castSellsyApiValueCustomToHullValue(customField, fieldDefCf),
            );
          }
        } else if (mapping.service === "$smartTags") {
          const smartTags: string[] = [];
          forIn(data.smartTags, (v, k) => {
            smartTags.push(v.word);
          });
          set(result, mapping.hull.replace("traits_", ""), smartTags);
        } else {
          const serviceVal = get(data, mapping.service, null);
          if (!isNil(serviceVal)) {
            const fieldDefDflt = SELLSY_DEFAULTFIELDS_CLIENT.find(
              (fd) => fd.code === mapping.service,
            );
            set(
              result,
              mapping.hull.replace("traits_", ""),
              this.castSellsyApiValueToHullValue(serviceVal, fieldDefDflt),
            );
          }
        }
      }
    });

    // Set the TLA first_name
    if (data.people_forename !== "") {
      set(result, "first_name", {
        value: data.people_forename,
        operation: "setIfNull",
      });
    }

    // Set the TLA lat_name
    if (data.people_name !== "") {
      set(result, "last_name", {
        value: data.people_name,
        operation: "setIfNull",
      });
    }

    // Set the Sellsy ID attribute
    set(result, "sellsy/id", {
      value: data.id,
      operation: "setIfNull",
    });

    return result;
  }

  private mapProspectToHullAccountAttributes(
    data: SellsyProspect,
  ): { [key: string]: HullAttribute } {
    const result = {};

    forEach(this.appSettings.mapping_in_prospect_account, (mapping) => {
      if (!isNil(mapping.hull) && !isNil(mapping.service)) {
        if (
          mapping.service.startsWith("$customfield") === true &&
          data.customfields
        ) {
          const customField = data.customfields.find(
            (cf) =>
              cf.code ===
              (mapping.service as string).replace("$customfield.", ""),
          );
          if (customField) {
            const fieldDefCf = this.customFieldDefs?.find(
              (fd) => fd.code === mapping.service?.replace("$customfield.", ""),
            );
            set(
              result,
              mapping.hull.replace("traits_", ""),
              this.castSellsyApiValueCustomToHullValue(customField, fieldDefCf),
            );
          }
        } else if (mapping.service === "$smartTags" && data.smartTags) {
          const smartTags: string[] = [];
          forIn(data.smartTags, (v, k) => {
            smartTags.push(v.word);
          });
          set(result, mapping.hull.replace("traits_", ""), smartTags);
        } else {
          const serviceVal = get(data, mapping.service, null);
          if (!isNil(serviceVal)) {
            const fieldDefDflt = SELLSY_DEFAULTFIELDS_CLIENT.find(
              (fd) => fd.code === mapping.service,
            );
            set(
              result,
              mapping.hull.replace("traits_", ""),
              this.castSellsyApiValueToHullValue(serviceVal, fieldDefDflt),
            );
          }
        }
      }
    });

    // Set the TLA name if not empty string
    if (data.fullName !== "") {
      set(result, "name", {
        value: data.fullName,
        operation: "setIfNull",
      });
    }

    // Set the Sellsy ID attribute
    set(result, "sellsy/id", {
      value: data.id,
      operation: "setIfNull",
    });

    return result;
  }

  private mapProspectToHullUserAttributes(
    data: SellsyProspect,
  ): { [key: string]: HullAttribute } {
    const result = {};

    forEach(this.appSettings.mapping_in_prospect_person, (mapping) => {
      if (!isNil(mapping.hull) && !isNil(mapping.service)) {
        if (mapping.service.startsWith("$customfield") === true) {
          const customField = data.customfields.find(
            (cf) => cf.code === mapping.service?.replace("$customfield.", ""),
          );
          if (customField) {
            const fieldDefCf = this.customFieldDefs?.find(
              (fd) => fd.code === mapping.service?.replace("$customfield.", ""),
            );
            set(
              result,
              mapping.hull.replace("traits_", ""),
              this.castSellsyApiValueCustomToHullValue(customField, fieldDefCf),
            );
          }
        } else if (mapping.service === "$smartTags") {
          const smartTags: string[] = [];
          forIn(data.smartTags, (v, k) => {
            smartTags.push((v as any).word);
          });
          set(result, mapping.hull.replace("traits_", ""), smartTags);
        } else {
          const serviceVal = get(data, mapping.service, null);
          if (!isNil(serviceVal)) {
            const fieldDefDflt = SELLSY_DEFAULTFIELDS_CLIENT.find(
              (fd) => fd.code === mapping.service,
            );
            set(
              result,
              mapping.hull.replace("traits_", ""),
              this.castSellsyApiValueToHullValue(serviceVal, fieldDefDflt),
            );
          }
        }
      }
    });

    // Set the TLA first_name
    if (data.people_forename !== "") {
      set(result, "first_name", {
        value: data.people_forename,
        operation: "setIfNull",
      });
    }

    // Set the TLA lat_name
    if (data.people_name !== "") {
      set(result, "last_name", {
        value: data.people_name,
        operation: "setIfNull",
      });
    }

    // Set the Sellsy ID attribute
    set(result, "sellsy/id", {
      value: data.id,
      operation: "setIfNull",
    });

    return result;
  }

  private mapContactBaseToHullAttributes(
    data: any,
    clientId?: string,
  ): { [key: string]: HullAttribute } {
    const result = {};

    forEach(this.appSettings.mapping_in_contact, (mapping) => {
      if (!isNil(mapping.hull) && !isNil(mapping.service)) {
        if (
          mapping.service.startsWith("$customfield") === true &&
          data.customfields
        ) {
          const customField = data.customfields.find(
            (cf: SellsyFieldDefinition) =>
              cf.code ===
              (mapping.service as string).replace("$customfield.", ""),
          );
          if (customField) {
            const fieldDefCf = this.customFieldDefs?.find(
              (fd) => fd.code === mapping.service?.replace("$customfield.", ""),
            );
            set(
              result,
              mapping.hull.replace("traits_", ""),
              this.castSellsyApiValueCustomToHullValue(customField, fieldDefCf),
            );
          }
        } else if (mapping.service === "$smartTags" && data.smartTags) {
          const smartTags: string[] = [];
          forIn(data.tags, (v, k) => {
            smartTags.push(v.word);
          });
          set(result, mapping.hull.replace("traits_", ""), smartTags);
        } else {
          const serviceVal = get(data, mapping.service, null);
          if (!isNil(serviceVal)) {
            const fieldDefDflt = SELLSY_DEFAULTFIELDS_CONTACT.find(
              (fd) => fd.code === mapping.service,
            );
            set(
              result,
              mapping.hull.replace("traits_", ""),
              this.castSellsyApiValueToHullValue(serviceVal, fieldDefDflt),
            );
          }
        }
      }
    });

    if (clientId) {
      set(result, "sellsy_contact/client_id", clientId);
    }

    if (data.forename !== "") {
      set(result, "first_name", {
        value: data.forename,
        operation: "setIfNull",
      });
    }

    if (data.name !== "") {
      set(result, "last_name", {
        value: data.name,
        operation: "setIfNull",
      });
    }

    // Set Sellsy Contact ID
    set(result, "sellsy_contact/id", {
      value: data.id,
      operation: "set", // use set to account for the linking operation we have to do
    });

    // Set the Sellsy Linked ID (this is the odd third ID from the Client.getList endpoint)
    if (data.linkedid && data.linkedid) {
      set(result, "sellsy_contact/linked_id", {
        value: data.linkedid,
        operation: "set", // use set to account for the linking operation we have to do
      });
    }

    return result;
  }

  private castSellsyApiValueToHullValue(
    value: any,
    fieldDef?: SellsyFieldDefinition,
  ): any {
    if (fieldDef === undefined) {
      return value;
    }

    let castedValue;

    switch (fieldDef.type) {
      case "simpletext":
      case "richtext":
      case "select":
      case "url":
      case "email":
      case "time":
      case "third":
      case "amount":
      case "unit":
      case "staff":
      case "item":
      case "people":
      case "radio":
        castedValue = value === "" ? null : value;
        break;
      case "date":
        if (typeof value === "string") {
          const castedSQLDate = DateTime.fromSQL(value);
          if (castedSQLDate.isValid === true) {
            castedValue = castedSQLDate.toISO();
          } else {
            // Casted SQL might fail because it's a unix timestamp formatted as string
            const castedUnixDate = DateTime.fromMillis(parseInt(value, 10));
            if (castedUnixDate.isValid === true) {
              castedValue = castedUnixDate.toISO();
            } else {
              castedValue = null; // Do not pass invalid dates to the platform!
            }
          }
        }
        break;
      case "boolean":
        castedValue = value === "Y" ? true : false;
        break;
      case "checkbox": // multiple choice
        if (typeof value === "string") {
          castedValue = value.split(",").map((i) => i.trim());
        } else {
          castedValue = value;
        }
        break;
      default:
        castedValue = null;
        break;
    }

    return castedValue;
  }

  private castSellsyApiValueCustomToHullValue(
    value: SellsyClientCustomField,
    fieldDef?: SellsyFieldDefinition,
  ): any {
    if (fieldDef === undefined) {
      return value.formatted_value;
    }

    let castedValue;
    switch (fieldDef.type) {
      case "amount":
      case "unit":
        castedValue = value.decimalval ? parseFloat(value.decimalval) : 0;
        break;
      case "checkbox":
        castedValue = value.formatted_value.split(",").map((i) => i.trim());
        break;
      case "boolean":
        castedValue = value.boolval === "Y" ? true : false;
        break;
      case "date":
        castedValue = value.timestampval
          ? DateTime.fromSeconds(parseInt(value.timestampval, 10)).toISO()
          : null;
        break;
      default:
        castedValue = value.formatted_value;
        break;
    }

    return castedValue;
  }
}
