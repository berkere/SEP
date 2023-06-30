import {isCodyError, nodeNameToPascalCase, parseJsonMetadata} from "@proophboard/cody-utils";
import {CodyResponse, CodyResponseType, Node, NodeType} from "@proophboard/cody-types";
import {findParentByType} from "./node-tree";
import {names} from "@event-engine/messaging/helpers";
import {Context} from "../context";

export const detectService = (node: Node, ctx: Context): string | CodyResponse => {
  const meta = node.getMetadata() ? parseJsonMetadata<{service?: string}>(node) : {};

  if(isCodyError(meta)) {
    return meta;
  }

  if(meta.service && typeof meta.service === 'string') {
    return meta.service;
  }

  const feature = findParentByType(node, NodeType.feature);

  if(feature) {
    const featureMeta = parseJsonMetadata<{service?: string}>(feature);

    if(!isCodyError(featureMeta)) {
      if(featureMeta.service) {
        return names(featureMeta.service).className;
      }
    }
  }

  const bc = findParentByType(node, NodeType.boundedContext);

  if(bc) {
    return names(nodeNameToPascalCase(bc)).className;
  }

  return names(ctx.boardName).className;
}
