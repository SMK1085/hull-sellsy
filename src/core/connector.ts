import { MappingEntry } from "../types/private-settings";

export interface PrivateSettings {
  auth_consumer_token?: string | null;
  auth_consumer_secret?: string | null;
  auth_user_token?: string | null;
  auth_user_secret?: string | null;
  mapping_in_prospect_account: MappingEntry[];
  mapping_in_prospect_person: MappingEntry[];
  mapping_in_client_account: MappingEntry[];
  mapping_in_client_person: MappingEntry[];
  mapping_in_contact: MappingEntry[];
  mapping_out_prospect_account: MappingEntry[];
  mapping_out_prospect_person: MappingEntry[];
  mapping_out_client_account: MappingEntry[];
  mapping_out_client_person: MappingEntry[];
  mapping_out_contact: MappingEntry[];
  identity_in_corporation: IdentityMappingEntry[];
  identity_in_person: IdentityMappingEntry[];
  identity_in_contact: IdentityMappingEntry[];
  account_prospect_synchronized_segments: string[];
  account_client_synchronized_segments: string[];
  user_prospect_synchronized_segments: string[];
  user_client_synchronized_segments: string[];
  user_contact_synchronized_segments: string[];
}

export interface IdentityMappingEntry {
  hull?: "external_id" | "domain" | "email" | "anonymous_id" | null;
  service?: string | null;
}

export interface LogPayload {
  channel: "operational" | "metric" | "error";
  component: string;
  code: string;
  message?: string | null;
  metricKey?: string | null;
  metricValue?: number | null;
  errorDetails?: any | null;
  errorMessage?: string | null;
  appId: string;
  tenantId: string;
  correlationKey?: string;
}
