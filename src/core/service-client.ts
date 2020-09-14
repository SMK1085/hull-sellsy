import { PrivateSettings } from "./connector";
import { Logger } from "winston";
import {
  ApiResultObject,
  ApiMethod,
  SellsyPaginationRequest,
  SellsyResponse,
  SellsyResponseListData,
  SellsyClient,
  SellsyProspect,
  SellsyCustomFieldGroup,
  SellsyCustomField,
  SellsyContact,
} from "./service-objects";
import { ApiUtil } from "../utils/api-util";
import { OAuth } from "oauth";

const DEFAULT_ENDPOINT = "https://apifeed.sellsy.com/0";

export class ServiceClient {
  public readonly appSettings: PrivateSettings;
  public readonly logger: Logger;
  public readonly oauthClient: OAuth;

  constructor(options: any) {
    this.appSettings = options.hullAppSettings;
    this.logger = options.logger;

    this.oauthClient = new OAuth(
      `${DEFAULT_ENDPOINT}/request_token`,
      `${DEFAULT_ENDPOINT}/access_token`,
      this.appSettings.auth_consumer_token as string,
      this.appSettings.auth_consumer_secret as string,
      "1.0",
      null,
      "PLAINTEXT",
    );
  }

  public async getClients(
    pagination: SellsyPaginationRequest = { nbperpage: 50, pagenum: 1 },
  ): Promise<
    ApiResultObject<
      any,
      SellsyResponse<SellsyResponseListData<SellsyClient>>,
      Error
    >
  > {
    const method = "Client.getList";
    const params = {
      pagination,
    };
    const postData = {
      request: 1,
      io_mode: "json",
      do_in: JSON.stringify({
        method,
        params,
      }),
    };

    try {
      const result = await this.execute<
        SellsyResponse<SellsyResponseListData<SellsyClient>>
      >(method, params);
      if (result.status !== "success") {
        return ApiUtil.handleApiResultError(
          `${DEFAULT_ENDPOINT}/`,
          "post",
          postData,
          new Error(result.error),
        );
      }

      return ApiUtil.handleApiResultSuccess(
        `${DEFAULT_ENDPOINT}/`,
        "post",
        postData,
        result,
      );
    } catch (error) {
      return ApiUtil.handleApiResultError(
        `${DEFAULT_ENDPOINT}/`,
        "post",
        postData,
        error,
      );
    }
  }

  public async getProspects(
    pagination: SellsyPaginationRequest = { nbperpage: 50, pagenum: 1 },
  ): Promise<
    ApiResultObject<
      any,
      SellsyResponse<SellsyResponseListData<SellsyProspect>>,
      Error
    >
  > {
    const method = "Prospects.getList";
    const params = {
      pagination,
    };
    const postData = {
      request: 1,
      io_mode: "json",
      do_in: JSON.stringify({
        method,
        params,
      }),
    };

    try {
      const result = await this.execute<
        SellsyResponse<SellsyResponseListData<SellsyProspect>>
      >(method, params);
      if (result.status !== "success") {
        return ApiUtil.handleApiResultError(
          `${DEFAULT_ENDPOINT}/`,
          "post",
          postData,
          new Error(result.error),
        );
      }

      return ApiUtil.handleApiResultSuccess(
        `${DEFAULT_ENDPOINT}/`,
        "post",
        postData,
        result,
      );
    } catch (error) {
      return ApiUtil.handleApiResultError(
        `${DEFAULT_ENDPOINT}/`,
        "post",
        postData,
        error,
      );
    }
  }

  public async getContacts(
    pagination: SellsyPaginationRequest = { nbperpage: 50, pagenum: 1 },
  ): Promise<
    ApiResultObject<
      any,
      SellsyResponse<SellsyResponseListData<SellsyContact>>,
      Error
    >
  > {
    const method = "Peoples.getList";
    const params = {
      pagination,
    };
    const postData = {
      request: 1,
      io_mode: "json",
      do_in: JSON.stringify({
        method,
        params,
      }),
    };

    try {
      const result = await this.execute<
        SellsyResponse<SellsyResponseListData<SellsyContact>>
      >(method, params);
      if (result.status !== "success") {
        return ApiUtil.handleApiResultError(
          `${DEFAULT_ENDPOINT}/`,
          "post",
          postData,
          new Error(result.error),
        );
      }

      return ApiUtil.handleApiResultSuccess(
        `${DEFAULT_ENDPOINT}/`,
        "post",
        postData,
        result,
      );
    } catch (error) {
      return ApiUtil.handleApiResultError(
        `${DEFAULT_ENDPOINT}/`,
        "post",
        postData,
        error,
      );
    }
  }

  public async getGroups(
    pagination: SellsyPaginationRequest = { nbperpage: 50, pagenum: 1 },
  ): Promise<
    ApiResultObject<
      any,
      SellsyResponse<SellsyResponseListData<SellsyCustomFieldGroup>>,
      Error
    >
  > {
    const method = "CustomFields.getGroupsList";
    const params = {
      pagination,
    };
    const postData = {
      request: 1,
      io_mode: "json",
      do_in: JSON.stringify({
        method,
        params,
      }),
    };

    try {
      const result = await this.execute<
        SellsyResponse<SellsyResponseListData<SellsyCustomFieldGroup>>
      >(method, params);
      if (result.status !== "success") {
        return ApiUtil.handleApiResultError(
          `${DEFAULT_ENDPOINT}/`,
          "post",
          postData,
          new Error(result.error),
        );
      }

      return ApiUtil.handleApiResultSuccess(
        `${DEFAULT_ENDPOINT}/`,
        "post",
        postData,
        result,
      );
    } catch (error) {
      return ApiUtil.handleApiResultError(
        `${DEFAULT_ENDPOINT}/`,
        "post",
        postData,
        error,
      );
    }
  }

  public async getCustomFields(
    pagination: SellsyPaginationRequest = { nbperpage: 50, pagenum: 1 },
  ): Promise<
    ApiResultObject<
      any,
      SellsyResponse<SellsyResponseListData<SellsyCustomField>>,
      Error
    >
  > {
    const method = "CustomFields.getList";
    const params = {
      pagination,
    };
    const postData = {
      request: 1,
      io_mode: "json",
      do_in: JSON.stringify({
        method,
        params,
      }),
    };

    try {
      const result = await this.execute<
        SellsyResponse<SellsyResponseListData<SellsyCustomField>>
      >(method, params);
      if (result.status !== "success") {
        return ApiUtil.handleApiResultError(
          `${DEFAULT_ENDPOINT}/`,
          "post",
          postData,
          new Error(result.error),
        );
      }

      return ApiUtil.handleApiResultSuccess(
        `${DEFAULT_ENDPOINT}/`,
        "post",
        postData,
        result,
      );
    } catch (error) {
      return ApiUtil.handleApiResultError(
        `${DEFAULT_ENDPOINT}/`,
        "post",
        postData,
        error,
      );
    }
  }

  private async execute<TData>(method: string, params: any): Promise<TData> {
    const postData = {
      request: 1,
      io_mode: "json",
      do_in: JSON.stringify({
        method,
        params,
      }),
    };

    return new Promise((resolve, reject) => {
      this.oauthClient.post(
        `${DEFAULT_ENDPOINT}/`,
        this.appSettings.auth_user_token as string,
        this.appSettings.auth_user_secret as string,
        postData,
        undefined,
        (e, data, res2) => {
          if (e) {
            console.log("oauth.error", e);
            console.log("Sellsy.api OAUTH ERROR", method, params);
            reject(e);
          }

          if ((data as any).error) {
            console.log("oauth.data.error", (data as any).error);
            console.log("Sellsy.api ERROR", method, params);
            reject((data as any).error);
          }
          //console.log('Sellsy.api', method, params, data);
          resolve(JSON.parse(data as any));
        },
      );
    });
  }
}
