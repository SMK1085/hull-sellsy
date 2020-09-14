import { Logger } from "winston";
import IHullSegment from "../types/hull-segment";
import IHullAccountUpdateMessage from "../types/account-update-message";
import {
  OutgoingOperationEnvelopesFiltered,
  SellsyClient,
  SellsyProspect,
  SellsyContactBase,
} from "../core/service-objects";
import { get, intersection } from "lodash";
import { VALIDATION_SKIP_HULLOBJECT_NOTINANYSEGMENT } from "../core/messages";
import { PrivateSettings } from "../core/connector";
import IHullUserUpdateMessage from "../types/user-update-message";

export class FilterUtil {
  public readonly privateSettings: PrivateSettings;
  public readonly logger: Logger;

  constructor(options: any) {
    this.privateSettings = options.hullAppSettings;
    this.logger = options.logger;
  }

  public filterUserMessagesInitial(
    messages: IHullUserUpdateMessage[],
    isBatch: boolean = false,
  ): OutgoingOperationEnvelopesFiltered<
    IHullUserUpdateMessage,
    SellsyClient | SellsyProspect | SellsyContactBase
  > {
    const result: OutgoingOperationEnvelopesFiltered<
      IHullUserUpdateMessage,
      SellsyClient | SellsyProspect | SellsyContactBase
    > = {
      inserts: [],
      updates: [],
      skips: [],
    };

    messages.forEach((msg) => {
      if (
        !isBatch &&
        !FilterUtil.isInAnySegment(
          msg.segments,
          this.privateSettings.user_client_synchronized_segments || [],
        ) &&
        !FilterUtil.isInAnySegment(
          msg.segments,
          this.privateSettings.user_prospect_synchronized_segments || [],
        ) &&
        !FilterUtil.isInAnySegment(
          msg.segments,
          this.privateSettings.user_contact_synchronized_segments || [],
        )
      ) {
        result.skips.push({
          message: msg,
          operation: "skip",
          notes: [VALIDATION_SKIP_HULLOBJECT_NOTINANYSEGMENT("user")],
          objectType: "user",
        });
      } else {
        result.inserts.push({
          message: msg,
          operation: "insert",
          objectType: "user",
        });
      }
    });

    return result;
  }

  public filterAccountMessagesInitial(
    messages: IHullAccountUpdateMessage[],
    isBatch: boolean = false,
  ): OutgoingOperationEnvelopesFiltered<
    IHullAccountUpdateMessage,
    SellsyClient | SellsyProspect
  > {
    const result: OutgoingOperationEnvelopesFiltered<
      IHullAccountUpdateMessage,
      SellsyClient | SellsyProspect
    > = {
      inserts: [],
      updates: [],
      skips: [],
    };

    messages.forEach((msg) => {
      if (
        !isBatch &&
        !FilterUtil.isInAnySegment(
          msg.account_segments,
          this.privateSettings.account_client_synchronized_segments || [],
        ) &&
        !FilterUtil.isInAnySegment(
          msg.account_segments,
          this.privateSettings.account_prospect_synchronized_segments || [],
        )
      ) {
        result.skips.push({
          message: msg,
          operation: "skip",
          notes: [VALIDATION_SKIP_HULLOBJECT_NOTINANYSEGMENT("account")],
          objectType: "account",
        });
      } else {
        if (get(msg.account, "sellsy/id", null) === null) {
          result.inserts.push({
            message: msg,
            operation: "insert",
            objectType: "account",
          });
        } else {
          result.updates.push({
            message: msg,
            operation: "update",
            objectType: "account",
          });
        }
      }
    });

    return result;
  }

  private static isInAnySegment(
    actualSegments: IHullSegment[],
    whitelistedSegments: string[],
  ): boolean {
    const actualIds = actualSegments.map((s) => s.id);
    if (intersection(actualIds, whitelistedSegments).length === 0) {
      return false;
    }

    return true;
  }
}
