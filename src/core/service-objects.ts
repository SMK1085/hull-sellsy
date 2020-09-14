export type ApiMethod =
  | "delete"
  | "get"
  | "GET"
  | "DELETE"
  | "head"
  | "HEAD"
  | "options"
  | "OPTIONS"
  | "post"
  | "POST"
  | "put"
  | "PUT"
  | "patch"
  | "PATCH"
  | "link"
  | "LINK"
  | "unlink"
  | "UNLINK";

export interface ApiResultObject<TPayload, TData, TError> {
  endpoint: string;
  method: ApiMethod;
  payload: TPayload | undefined;
  data?: TData;
  success: boolean;
  error?: string | string[];
  errorDetails?: TError;
}

export type OutgoingOperationType = "insert" | "update" | "skip";
export type OutgoingOperationObjectType = "user" | "event" | "account";

export interface OutgoingOperationEnvelope<TMessage, TServiceObject> {
  message: TMessage;
  serviceObject?: TServiceObject;
  operation: OutgoingOperationType;
  objectType: OutgoingOperationObjectType;
  notes?: string[];
}

export interface OutgoingOperationEnvelopesFiltered<TMessage, TServiceObject> {
  inserts: OutgoingOperationEnvelope<TMessage, TServiceObject>[];
  updates: OutgoingOperationEnvelope<TMessage, TServiceObject>[];
  skips: OutgoingOperationEnvelope<TMessage, TServiceObject>[];
}

export interface SellsyOAuthCredentials {
  consumerToken: string;
  consumerSecret: string;
  userToken: string;
  userSecret: string;
}

export interface SellsyExecuteRequest {
  auth: SellsyOAuthCredentials;
  method: string;
  params: any;
}

export interface SellsyResponse<TResponseData> {
  response: TResponseData;
  error: string;
  status: string;
}

export interface SellsyResponseListData<TData> {
  infos: {
    nbperpage: number;
    nbpages: number;
    pagenum: number;
    nbtotal: string;
  };
  result: {
    [key: string]: TData;
  };
}

export interface SellsyPaginationRequest {
  nbperpage: number;
  pagenum: number;
}

export interface SellsyCustomFieldGroup {
  id: string;
  corpid: string;
  ownerid: string;
  status: string;
  name: string;
  code: string;
  openbydefault: string;
}

export interface SellsyCustomField {
  id: string;
  corpid: string;
  ownerid: string;
  status: string;
  type: string;
  name: string;
  code: string;
  showIn_list: string;
  showIn_filter: string;
  showIn_ecommerce: string;
  showOn_pdf: string;
  showOn_desc: string;
  useOn_document: string;
  useOn_people: string;
  useOn_client: string;
  useOn_prospect: string;
  useOn_supplier: string;
  useOn_item: string;
  useOn_service: string;
  useOn_ticket: string;
  useOn_task: string;
  useOn_purchase: string;
  useOn_opportunity: string;
  useOn_staff: string;
  useOn_project: string;
  useOn_book: string;
  moreInfoOnPdf_address: string;
  moreInfoOnPdf_mail: string;
  moreInfoOnPdf_tel: string;
  moreInfoOnPdf_mobile: string;
  cfid: string;
  isRequired: string;
  description: string;
  min: string;
  max: string;
  defaultValue: string;
  listType: string;
  listId: string;
  groupid: string;
  groupname: string;
  openbydefault: string;
  rank: string;
  formatted_type: string;
  prefsList: any[];
}

export interface SellsyClient {
  thirdid: string;
  capital: string;
  logo: string;
  joindate: string; // SQL date
  auxCode: string;
  accountingCode: string;
  stickyNote: string;
  ident: string;
  rateCategory: string;
  massmailingUnsubscribed: string;
  massmailingUnsubscribedSMS: string;
  phoningUnsubscribed: string;
  massmailingUnsubscribedMail: string;
  massmailingUnsubscribedCustom: string;
  lastactivity: string; // timestamp
  ownerid: string;
  type: string;
  maincontactid: string;
  relationType: string;
  actif: string;
  pic: string;
  people_forename: string;
  people_name: string;
  people_civil: string;
  dateTransformProspect: string; // SQL date
  score: any | null;
  mainContactName: string;
  name: string;
  tel: string;
  fax: string;
  email: string;
  mobile: string;
  apenaf: string;
  rcs: string;
  siret: string;
  siren: string;
  vat: string;
  mainaddressid: string;
  maindelivaddressid: string;
  web: string;
  corpType: string;
  addr_name: string;
  addr_part1: string;
  addr_part2: string;
  addr_zip: string;
  addr_town: string;
  addr_state: string;
  addr_lat: string;
  addr_lng: string;
  addr_countrycode: string;
  delivaddr_name: string;
  delivaddr_part1: string;
  delivaddr_part2: string;
  delivaddr_zip: string;
  delivaddr_town: string;
  delivaddr_state: string;
  delivaddr_lat: string;
  delivaddr_lng: string;
  delivaddr_countrycode: string;
  formated_joindate: string; // dd/mm/yyyy
  formated_transformprospectdate: string; // dd/mm/yyyy
  scoreFormatted: string;
  scoreClass: string;
  corpid: string;
  avatar: {
    type: string;
    value: string;
    class: number;
  };
  lastactivity_formatted: string; // dd/mm/yyyy
  addr_countryname: string;
  mainAddress: string;
  addr_geocode: string;
  delivaddr_countryname: string;
  delivAddress: string;
  delivaddr_geocode: string;
  fullName: string;
  contactId: string;
  contactDetails: string;
  formatted_tel: string;
  formatted_mobile: string;
  formatted_fax: string;
  owner: string;
  webUrl: string;
  customfields: SellsyClientCustomField[];
  contacts: {
    [key: string]: SellsyContactBase;
  };
  smartTags: {
    [key: string]: SellsySmartTagBase;
  };
  id: string;
}

export interface SellsyClientCustomField {
  id: string;
  status: string;
  corpid: string;
  cfid: string;
  groupid: string;
  type: string;
  linkedtype: string;
  linkedid: string;
  textval: string | null;
  boolval: string | null;
  timestampval: string | null;
  decimalval: string | null;
  numericval: string | null;
  stringval: string | null;
  code: string;
  formatted_value: string;
  currency?: string;
  unit?: string;
}

export interface SellsySmartTagBase {
  id: string;
  corpid: string;
  status: string;
  category: string;
  created: string;
  word: string;
  thirdid: string;
}

export interface SellsyContactBase {
  pic: string;
  name: string;
  forename: string;
  tel: string;
  email: string;
  mobile: string;
  civil: string;
  position: string;
  birthdate: string;
  thirdid: string;
  id: string;
  peopleid: string;
  fullName: string;
  corpid: string;
  formatted_tel: string;
  formatted_mobile: string;
  formatted_fax: string;
  formatted_birthdate: string;
  avatar: {
    type: string;
    value: string;
    class: number;
  };
}

export interface SellsyContact extends SellsyContactBase {
  customfields: SellsyClientCustomField[];
  smartTags?: {
    [key: string]: SellsySmartTagBase;
  };
}

export interface SellsyProspect {
  thirdid: string;
  capital: string;
  logo: string;
  joindate: string; // SQL Date
  auxCode: string;
  accountingCode: string;
  stickyNote: string;
  ident: string;
  rateCategory: string;
  massmailingUnsubscribed: string;
  massmailingUnsubscribedSMS: string;
  phoningUnsubscribed: string;
  massmailingUnsubscribedMail: string;
  massmailingUnsubscribedCustom: string;
  lastactivity: string | null;
  ownerid: string;
  type: string; // corporation
  maincontactid: string;
  relationType: string; // prospect
  actif: string;
  pic: string;
  people_forename: string | null;
  people_name: string | null;
  people_civil: string | null;
  score: string | number | null;
  mainContactName: string;
  name: string;
  tel: string;
  fax: string;
  email: string;
  mobile: string;
  apenaf: string;
  rcs: string;
  siret: string;
  siren: string;
  vat: string;
  mainaddressid: string;
  maindelivaddressid: string;
  web: string;
  corpType: string;
  addr_name: string;
  addr_part1: string;
  addr_part2: string;
  addr_zip: string;
  addr_town: string;
  addr_state: string;
  addr_lat: string;
  addr_lng: string;
  addr_countrycode: string;
  delivaddr_name: string | null;
  delivaddr_part1: string | null;
  delivaddr_part2: string | null;
  delivaddr_zip: string | null;
  delivaddr_town: string | null;
  delivaddr_state: string | null;
  delivaddr_lat: string | null;
  delivaddr_lng: string | null;
  delivaddr_countrycode: string | null;
  formated_joindate: string; // dd/mm/yyyy
  formated_transformprospectdate: string;
  scoreFormatted: string;
  scoreClass: string;
  corpid: string;
  avatar: {
    type: string;
    value: string;
    class: number;
  };
  lastactivity_formatted: string;
  addr_countryname: string;
  mainAddress: string;
  addr_geocode: string;
  fullName: string;
  contactId: string;
  contactDetails: string;
  formatted_tel: string;
  formatted_mobile: string;
  formatted_fax: string;
  owner: string;
  webUrl: string;
  customfields: SellsyClientCustomField[];
  contacts?: {
    [key: string]: SellsyContactBase;
  };
  smartTags?: {
    [key: string]: SellsySmartTagBase;
  };
  id: string;
}

export type SellsyFieldType =
  | "simpletext"
  | "richtext"
  | "numeric"
  | "amount"
  | "unit"
  | "radio"
  | "select"
  | "checkbox"
  | "date"
  | "time"
  | "email"
  | "url"
  | "boolean"
  | "third"
  | "item"
  | "people"
  | "staff";

export interface SellsyFieldDefinition {
  code: string;
  label: string;
  type: SellsyFieldType;
  readonly: boolean;
  isDefault: boolean;
  allowedValues?: any[];
}

export const SELLSY_DEFAULTFIELDS_CLIENT: SellsyFieldDefinition[] = [
  {
    code: "thirdid",
    label: "Third ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "capital",
    label: "Capital",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "logo",
    label: "Logo",
    type: "url",
    readonly: false,
    isDefault: true,
  },
  {
    code: "joindate",
    label: "Join Date",
    type: "date",
    readonly: true,
    isDefault: true,
  },
  {
    code: "auxCode",
    label: "Auxiliary accounting code",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "accountingCode",
    label: "Accounting Code",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "stickyNote",
    label: "Sticky Note",
    type: "richtext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "ident",
    label: "Customer reference",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "rateCategory",
    label: "Company rate category",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "massmailingUnsubscribed",
    label: "Unsubscribe to email campaigns",
    type: "boolean",
    readonly: false,
    isDefault: true,
  },
  {
    code: "massmailingUnsubscribedSMS",
    label: "Unsubscribe to SMS campaigns",
    type: "boolean",
    readonly: false,
    isDefault: true,
  },
  {
    code: "phoningUnsubscribed",
    label: "Unsubscribe to phone campaigns",
    type: "boolean",
    readonly: false,
    isDefault: true,
  },
  {
    code: "massmailingUnsubscribedMail",
    label: "Unsubscribe to postal campaigns",
    type: "boolean",
    readonly: false,
    isDefault: true,
  },
  {
    code: "massmailingUnsubscribedCustom",
    label: "Unsubscribe to personalized marketing campaigns",
    type: "boolean",
    readonly: false,
    isDefault: true,
  },
  {
    code: "lastactivity",
    label: "Last activity",
    type: "date",
    readonly: true,
    isDefault: true,
  },
  {
    code: "ownerid",
    label: "Owner ID",
    type: "staff",
    readonly: false,
    isDefault: true,
  },
  {
    code: "type",
    label: "Type",
    type: "radio",
    allowedValues: ["corporation", "person"],
    readonly: false,
    isDefault: true,
  },
  {
    code: "maincontactid",
    label: "Main Contact ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "relationType",
    label: "Relation Type",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "actif",
    label: "Active",
    type: "boolean",
    readonly: true,
    isDefault: true,
  },
  {
    code: "pic",
    label: "Picture",
    type: "url",
    readonly: true,
    isDefault: true,
  },
  {
    code: "people_forename",
    label: "Main Contact First Name",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "people_name",
    label: "Main Contact Last Name",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "people_civil",
    label: "Main Contact Civility",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "dateTransformProspect",
    label: "Transformation Prospect Date",
    type: "date",
    readonly: true,
    isDefault: true,
  },
  {
    code: "score",
    label: "Score",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "mainContactName",
    label: "Main Contact Name",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "name",
    label: "Name",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "tel",
    label: "Telephone",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "fax",
    label: "Telefax",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "email",
    label: "Email",
    type: "email",
    readonly: false,
    isDefault: true,
  },
  {
    code: "mobile",
    label: "Mobile",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "apenaf",
    label: "Company NAF code",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "rcs",
    label: "Company RCS (Fr)",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "siret",
    label: "Company SIRET",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "siren",
    label: "Corporation Siren",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "vat",
    label: "Company tax number",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "mainaddressid",
    label: "Main Address ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "maindelivaddressid",
    label: "Main Delivery Address ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "web",
    label: "Website",
    type: "url",
    readonly: false,
    isDefault: true,
  },
  {
    code: "corpType",
    label: "Corporation Type",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "addr_name",
    label: "Address Name",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "addr_part1",
    label: "Address Part 1",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "addr_part2",
    label: "Address Part 2",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "addr_zip",
    label: "Address Postal Code",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "addr_town",
    label: "Address City",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "addr_state",
    label: "Address State",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "addr_lat",
    label: "Address Latitude",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "addr_lng",
    label: "Address Longitude",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "addr_countrycode",
    label: "Address Country Code",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "delivaddr_name",
    label: "Delivery Address Name",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_part1",
    label: "Delivery Address Part 1",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_part2",
    label: "Delivery Address Part 2",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_zip",
    label: "Delivery Address Postal Code",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_town",
    label: "Delivery Address City",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_state",
    label: "Delivery Address State",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_lat",
    label: "Delivery Address Latitude",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_lng",
    label: "Delivery Address Longitude",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_countrycode",
    label: "Delivery Address Country Code",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "formated_joindate",
    label: "Formatted Join Date",
    type: "date",
    readonly: true,
    isDefault: true,
  },
  {
    code: "formated_transformprospectdate",
    label: "Formatted Transform Prospect Date",
    type: "date",
    readonly: true,
    isDefault: true,
  },
  {
    code: "scoreFormatted",
    label: "Formatted Score",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "scoreClass",
    label: "Score Class",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "corpid",
    label: "Corporation ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "lastactivity_formatted",
    label: "Formatted Last Activity",
    type: "date",
    readonly: true,
    isDefault: true,
  },
  {
    code: "addr_countryname",
    label: "Address Country Name",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "mainAddress",
    label: "Main Address",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "addr_geocode",
    label: "Address Geocode",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_countryname",
    label: "Delivery Address Country Name",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivAddress",
    label: "Delivery Address",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "fullName",
    label: "Full Name",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "contactId",
    label: "Contact ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "contactDetails",
    label: "Contact Details",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "formatted_tel",
    label: "Formatted Telephone",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "formatted_mobile",
    label: "Formatted Mobile",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "formatted_fax",
    label: "Formatted Telefaz",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "owner",
    label: "Owner",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "webUrl",
    label: "Web Url",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "id",
    label: "Sellsy ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
];

export const SELLSY_DEFAULTFIELDS_PROSPECT: SellsyFieldDefinition[] = [
  {
    code: "thirdid",
    label: "Third ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "capital",
    label: "Capital",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "logo",
    label: "Logo",
    type: "url",
    readonly: false,
    isDefault: true,
  },
  {
    code: "joindate",
    label: "Join Date",
    type: "date",
    readonly: true,
    isDefault: true,
  },
  {
    code: "auxCode",
    label: "Auxiliary accounting code",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "accountingCode",
    label: "Accounting Code",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "stickyNote",
    label: "Sticky Note",
    type: "richtext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "ident",
    label: "Customer reference",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "rateCategory",
    label: "Company rate category",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "massmailingUnsubscribed",
    label: "Unsubscribe to email campaigns",
    type: "boolean",
    readonly: false,
    isDefault: true,
  },
  {
    code: "massmailingUnsubscribedSMS",
    label: "Unsubscribe to SMS campaigns",
    type: "boolean",
    readonly: false,
    isDefault: true,
  },
  {
    code: "phoningUnsubscribed",
    label: "Unsubscribe to phone campaigns",
    type: "boolean",
    readonly: false,
    isDefault: true,
  },
  {
    code: "massmailingUnsubscribedMail",
    label: "Unsubscribe to postal campaigns",
    type: "boolean",
    readonly: false,
    isDefault: true,
  },
  {
    code: "massmailingUnsubscribedCustom",
    label: "Unsubscribe to personalized marketing campaigns",
    type: "boolean",
    readonly: false,
    isDefault: true,
  },
  {
    code: "lastactivity",
    label: "Last activity",
    type: "date",
    readonly: true,
    isDefault: true,
  },
  {
    code: "ownerid",
    label: "Owner ID",
    type: "staff",
    readonly: false,
    isDefault: true,
  },
  {
    code: "type",
    label: "Type",
    type: "radio",
    allowedValues: ["corporation", "person"],
    readonly: false,
    isDefault: true,
  },
  {
    code: "maincontactid",
    label: "Main Contact ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "relationType",
    label: "Relation Type",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "actif",
    label: "Active",
    type: "boolean",
    readonly: true,
    isDefault: true,
  },
  {
    code: "pic",
    label: "Picture",
    type: "url",
    readonly: true,
    isDefault: true,
  },
  {
    code: "people_forename",
    label: "Main Contact First Name",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "people_name",
    label: "Main Contact Last Name",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "people_civil",
    label: "Main Contact Civility",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "dateTransformProspect",
    label: "Transformation Prospect Date",
    type: "date",
    readonly: true,
    isDefault: true,
  },
  {
    code: "score",
    label: "Score",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "mainContactName",
    label: "Main Contact Name",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "name",
    label: "Name",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "tel",
    label: "Telephone",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "fax",
    label: "Telefax",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "email",
    label: "Email",
    type: "email",
    readonly: false,
    isDefault: true,
  },
  {
    code: "mobile",
    label: "Mobile",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "apenaf",
    label: "Company NAF code",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "rcs",
    label: "Company RCS (Fr)",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "siret",
    label: "Company SIRET",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "siren",
    label: "Corporation Siren",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "vat",
    label: "Company tax number",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "mainaddressid",
    label: "Main Address ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "maindelivaddressid",
    label: "Main Delivery Address ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "web",
    label: "Website",
    type: "url",
    readonly: false,
    isDefault: true,
  },
  {
    code: "corpType",
    label: "Corporation Type",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "addr_name",
    label: "Address Name",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "addr_part1",
    label: "Address Part 1",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "addr_part2",
    label: "Address Part 2",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "addr_zip",
    label: "Address Postal Code",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "addr_town",
    label: "Address City",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "addr_state",
    label: "Address State",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "addr_lat",
    label: "Address Latitude",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "addr_lng",
    label: "Address Longitude",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "addr_countrycode",
    label: "Address Country Code",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "delivaddr_name",
    label: "Delivery Address Name",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_part1",
    label: "Delivery Address Part 1",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_part2",
    label: "Delivery Address Part 2",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_zip",
    label: "Delivery Address Postal Code",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_town",
    label: "Delivery Address City",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_state",
    label: "Delivery Address State",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_lat",
    label: "Delivery Address Latitude",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_lng",
    label: "Delivery Address Longitude",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_countrycode",
    label: "Delivery Address Country Code",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "formated_joindate",
    label: "Formatted Join Date",
    type: "date",
    readonly: true,
    isDefault: true,
  },
  {
    code: "formated_transformprospectdate",
    label: "Formatted Transform Prospect Date",
    type: "date",
    readonly: true,
    isDefault: true,
  },
  {
    code: "scoreFormatted",
    label: "Formatted Score",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "scoreClass",
    label: "Score Class",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "corpid",
    label: "Corporation ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "lastactivity_formatted",
    label: "Formatted Last Activity",
    type: "date",
    readonly: true,
    isDefault: true,
  },
  {
    code: "addr_countryname",
    label: "Address Country Name",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "mainAddress",
    label: "Main Address",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "addr_geocode",
    label: "Address Geocode",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivaddr_countryname",
    label: "Delivery Address Country Name",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "delivAddress",
    label: "Delivery Address",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "fullName",
    label: "Full Name",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "contactId",
    label: "Contact ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "contactDetails",
    label: "Contact Details",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "formatted_tel",
    label: "Formatted Telephone",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "formatted_mobile",
    label: "Formatted Mobile",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "formatted_fax",
    label: "Formatted Telefaz",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "owner",
    label: "Owner",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "webUrl",
    label: "Web Url",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "id",
    label: "Sellsy ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
];

export const SELLSY_DEFAULTFIELDS_CONTACT: SellsyFieldDefinition[] = [
  {
    code: "pic",
    label: "Picture",
    type: "url",
    readonly: true,
    isDefault: true,
  },
  {
    code: "name",
    label: "Last Name",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "forename",
    label: "First Name",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "tel",
    label: "Telephone",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "email",
    label: "Email",
    type: "email",
    readonly: false,
    isDefault: true,
  },
  {
    code: "mobile",
    label: "Mobile",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "civil",
    label: "Civility",
    type: "select",
    readonly: false,
    isDefault: true,
    allowedValues: ["man", "woman", "lady"],
  },
  {
    code: "position",
    label: "Position",
    type: "simpletext",
    readonly: false,
    isDefault: true,
  },
  {
    code: "birthdate",
    label: "Date of Birth",
    type: "date",
    readonly: false,
    isDefault: true,
  },
  {
    code: "thirdid",
    label: "Third ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "id",
    label: "Sellsy ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "peopleid",
    label: "People ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "fullName",
    label: "Full Name",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "corpid",
    label: "Corporation ID",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "formatted_tel",
    label: "Formatted Telephone",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "formatted_mobile",
    label: "Mobile",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "formatted_fax",
    label: "Formatted Telefax",
    type: "simpletext",
    readonly: true,
    isDefault: true,
  },
  {
    code: "formatted_birthdate",
    label: "Formatted Date of Birth",
    type: "date",
    readonly: true,
    isDefault: true,
  },
];

export interface SellsyWebhookRequest {
  notif: {
    eventType: string;
    timestamp: string;
    event: string;
    relatedid: string;
    relatedtype: string;
    thirdtype: string;
    ownerid: string;
    ownertype: string;
    corpid: string;
  };
}
