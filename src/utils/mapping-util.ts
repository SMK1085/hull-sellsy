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
  SellsyClientProspectDetail,
  SellsyContact,
  SellsyContactDetailData,
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
    // console.log(data);
    forEach(this.appSettings.mapping_in_contact, (mapping) => {
      if (!isNil(mapping.hull) && !isNil(mapping.service)) {
        if (
          mapping.service.startsWith("$customfield") === true &&
          data.customfields
        ) {
          let customField;

          forIn(data.customfields, (v, k) => {
            if (v.code === mapping.service?.replace("$customfield.", "")) {
              customField = v;
              return false;
            }
          });

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

  public static mapClientDetailToClient(
    detailData: SellsyClientProspectDetail,
  ): SellsyClient {
    const primaryAddress =
      detailData.address.length === 0
        ? undefined
        : detailData.address.find((a) => a.isMain === "Y");
    const deliveryAddress =
      detailData.address.length === 0
        ? undefined
        : detailData.address.find((a) => a.isMainDeliv === "Y");
    let mainContact: SellsyContact | undefined;
    if (detailData.contacts) {
      forIn(detailData.contacts, (v, k) => {
        if (v.isMain === "Y") {
          mainContact = v;
        }
      });
    }
    const customFieldsFlat: SellsyClientCustomField[] = [];
    if (detailData.customFields) {
      forIn(detailData.customFields, (v, k) => {
        customFieldsFlat.push(...v.list);
      });
    }
    const result: SellsyClient = {
      accountingCode: detailData.client.accountingCode,
      actif: detailData.client.actif,
      addr_countrycode: primaryAddress ? primaryAddress.countrycode : "",
      addr_countryname: primaryAddress ? primaryAddress.countryname : "",
      addr_geocode: "",
      addr_lat: primaryAddress ? primaryAddress.lat : "",
      addr_lng: primaryAddress ? primaryAddress.lng : "",
      addr_name: primaryAddress ? primaryAddress.name : "",
      addr_part1: primaryAddress ? primaryAddress.part1 : "",
      addr_part2: primaryAddress ? primaryAddress.part2 : "",
      addr_state: primaryAddress ? primaryAddress.state : "",
      addr_town: primaryAddress ? primaryAddress.town : "",
      addr_zip: primaryAddress ? primaryAddress.zip : "",
      apenaf: detailData.corporation ? detailData.corporation.apenaf : "",
      auxCode: detailData.client.auxCode,
      avatar: detailData.avatar,
      capital: detailData.corporation ? detailData.corporation.capital : "",
      contacts: detailData.contacts ? detailData.contacts : {},
      corpType: detailData.corporation ? detailData.corporation.type : "",
      corpid: detailData.client.corpid,
      customfields: customFieldsFlat,
      contactId: detailData.contact ? detailData.contact.id : "",
      dateTransformProspect: detailData.client.transformationDate
        ? detailData.client.transformationDate
        : "",
      delivAddress: deliveryAddress ? deliveryAddress.toHTML : "",
      delivaddr_countrycode: deliveryAddress ? deliveryAddress.countrycode : "",
      delivaddr_countryname: deliveryAddress ? deliveryAddress.countryname : "",
      delivaddr_geocode: "",
      delivaddr_lat: deliveryAddress ? deliveryAddress.lat : "",
      delivaddr_lng: deliveryAddress ? deliveryAddress.lng : "",
      delivaddr_name: deliveryAddress ? deliveryAddress.name : "",
      delivaddr_part1: deliveryAddress ? deliveryAddress.part1 : "",
      delivaddr_part2: deliveryAddress ? deliveryAddress.part2 : "",
      delivaddr_state: deliveryAddress ? deliveryAddress.state : "",
      delivaddr_town: deliveryAddress ? deliveryAddress.town : "",
      delivaddr_zip: deliveryAddress ? deliveryAddress.zip : "",
      email: get(
        detailData,
        "corporation.email",
        get(detailData, "contact.email", ""),
      ),
      fax: get(
        detailData,
        "corporation.fax",
        get(detailData, "contact.fax", ""),
      ),
      contactDetails: "",
      formated_joindate: "",
      formated_transformprospectdate: "",
      formatted_fax: "",
      formatted_mobile: "",
      formatted_tel: "",
      fullName: detailData.client.name,
      id: detailData.client.id,
      ident: "",
      joindate: detailData.client.joindate,
      lastactivity: detailData.client.lastactivity ?? "",
      lastactivity_formatted: "",
      logo: detailData.corporation ? detailData.corporation.logo : "",
      mainAddress: primaryAddress ? primaryAddress.toHTML : "",
      mainaddressid: primaryAddress ? primaryAddress.id : "",
      mainContactName: mainContact ? mainContact.name : "",
      maincontactid: mainContact ? mainContact.id : "",
      maindelivaddressid: deliveryAddress ? deliveryAddress.id : "",
      massmailingUnsubscribed: detailData.client.massmailingUnsubscribed,
      massmailingUnsubscribedCustom:
        detailData.client.massmailingUnsubscribedCustom,
      massmailingUnsubscribedMail:
        detailData.client.massmailingUnsubscribedMail,
      massmailingUnsubscribedSMS: detailData.client.massmailingUnsubscribedSMS,
      mobile: get(
        detailData,
        "corporation.mobile",
        get(detailData, "contact.mobile", ""),
      ),
      name: detailData.client.name,
      owner: "",
      ownerid: detailData.client.ownerid,
      people_civil: detailData.contact ? detailData.contact.civil : "",
      people_forename: detailData.contact ? detailData.contact.forename : "",
      people_name: detailData.contact ? detailData.contact.name : "",
      phoningUnsubscribed: detailData.client.phoningUnsubscribed,
      pic: "",
      rateCategory: detailData.client.rateCategory,
      rcs: detailData.corporation ? detailData.corporation.rcs : "",
      relationType: detailData.client.relationType,
      score: detailData.score.value,
      scoreClass: "",
      scoreFormatted: detailData.score.formatted,
      siren: detailData.corporation ? detailData.corporation.siren : "",
      siret: detailData.corporation ? detailData.corporation.siret : "",
      smartTags: detailData.smartTags ? detailData.smartTags : {},
      stickyNote: detailData.client.stickyNote,
      tel: get(
        detailData,
        "corporation.tel",
        get(detailData, "contact.tel", ""),
      ),
      thirdid: detailData.client.detailsid,
      type: detailData.client.type,
      vat: detailData.corporation ? detailData.corporation.vat : "",
      web: get(
        detailData,
        "corporation.web",
        get(detailData, "contact.web", ""),
      ),
      webUrl: get(
        detailData,
        "corporation.web",
        get(detailData, "contact.web", ""),
      ),
    };
    return result;
  }

  public static mapContactDetailToContact(
    detailData: SellsyContactDetailData,
  ): SellsyContact {
    const customFieldsFlat: SellsyClientCustomField[] = [];
    if (detailData.customFields) {
      forIn(detailData.customFields, (v, k) => {
        customFieldsFlat.push(...v.list);
      });
    }
    const result: SellsyContact = {
      ...detailData,
      customfields: customFieldsFlat,
      isMain: "",
      thirdid: detailData.id,
      peopleid: detailData.id,
    };

    return result;
  }
}
