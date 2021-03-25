import {
  Middleware,
  HttpMethod,
  HttpHeaders,
  ContentType,
  createContext,
  RequestConsumer,
  Result,
  ContentTypeUtils,
} from '@tumau/core';
import { JsonParserConsumer } from '@tumau/json';
// import { parse } from 'graphql';

export const GraphQLParserContext = createContext<null | any>({
  name: 'GraphQLParser',
});
export const GraphQLParserConsumer = GraphQLParserContext.Consumer;

export function GraphQLParser(): Middleware {
  return async (ctx, next): Promise<Result> => {
    const request = ctx.getOrFail(RequestConsumer);
    const noBodyCtx = ctx.with(GraphQLParserContext.Provider(null));

    if (
      request.method === HttpMethod.GET ||
      request.method === HttpMethod.DELETE ||
      request.method === HttpMethod.OPTIONS
    ) {
      return next(noBodyCtx);
    }

    const json = ctx.get(JsonParserConsumer);
    if (json) {
      return next(ctx.with(GraphQLParserContext.Provider(json)));
    }

    const headers = request.headers;
    const contentType = headers[HttpHeaders.ContentType];

    if (!contentType) {
      return next(noBodyCtx);
    }

    const parsed = ContentTypeUtils.parse(contentType);
    if (parsed.type !== ContentType.GraphQL) {
      return next(noBodyCtx);
    }

    // TODO
    // const str = await requestToString(req, limit);

    // if (!str) {
    //   return {};
    // }

    return next(ctx);
  };
}
