<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kibana-plugin-server](./kibana-plugin-server.md) &gt; [KibanaRequest](./kibana-plugin-server.kibanarequest.md) &gt; [from](./kibana-plugin-server.kibanarequest.from.md)

## KibanaRequest.from() method

Factory for creating requests. Validates the request before creating an instance of a KibanaRequest.

<b>Signature:</b>

```typescript
static from<P extends ObjectType, Q extends ObjectType, B extends ObjectType>(req: Request, routeSchemas?: RouteSchemas<P, Q, B>): KibanaRequest<P["type"], Q["type"], B["type"]>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  req | <code>Request</code> |  |
|  routeSchemas | <code>RouteSchemas&lt;P, Q, B&gt;</code> |  |

<b>Returns:</b>

`KibanaRequest<P["type"], Q["type"], B["type"]>`

