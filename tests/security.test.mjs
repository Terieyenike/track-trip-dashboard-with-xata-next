import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  sameOrigin,
  appOrigin,
  safeNext,
  isPhotoPath,
  normalizeWorkspace,
  limitedBody,
} from "../lib/security.mjs";
import { parseTravelData, initial } from "../utils/travel-data.mjs";
// Each origin test defines its own configuration, independent of deployment env.
let deploymentOrigin;
beforeEach(() => {
  deploymentOrigin = process.env.APP_ORIGIN;
  delete process.env.APP_ORIGIN;
});
afterEach(() => {
  if (deploymentOrigin === undefined) delete process.env.APP_ORIGIN;
  else process.env.APP_ORIGIN = deploymentOrigin;
});
test("mutations reject cross-site and missing origins", () => {
  const request = (origin) =>
    new Request("https://trips.example/api/workspace", {
      headers: origin ? { origin } : {},
    });
  assert.equal(sameOrigin(request("https://trips.example")), true);
  assert.equal(sameOrigin(request("https://attacker.example")), false);
  assert.equal(sameOrigin(request()), false);
});
test("auth callback cannot redirect to arbitrary URLs", () => {
  for (const value of [
    "https://evil.example",
    "//evil.example",
    "/admin",
    "/dashboard?x=1",
    null,
  ])
    assert.equal(safeNext(value), "/dashboard");
  assert.equal(safeNext("/reset-password"), "/reset-password");
});
test("private photo paths must match the verified account", () => {
  const id = "74efc5ac-bd80-4c3b-ab71-a0d2bd24ffbb";
  const file = "a5389d64-446b-4c4a-bb49-784b5505d09f.png";
  assert.equal(isPhotoPath([id, file], id), true);
  assert.equal(isPhotoPath(["another-account", file], id), false);
  assert.equal(isPhotoPath([id, "../secret.png"], id), false);
  assert.equal(isPhotoPath([id, file, "extra"], id), false);
});
test("cloud payload drops client-supplied account identity and enforces limits", () => {
  assert.deepEqual(
    normalizeWorkspace({ owner_id: "someone-else", trips: [], notes: [] }),
    { trips: [], notes: [] },
  );
  assert.throws(() =>
    normalizeWorkspace({ trips: Array(501).fill({}), notes: [] }),
  );
});
test("workspace parser supports private photos and rejects external URLs", () => {
  const data = structuredClone(initial);
  data.trips[0].image =
    "/api/photos/74efc5ac-bd80-4c3b-ab71-a0d2bd24ffbb/a5389d64-446b-4c4a-bb49-784b5505d09f.png";
  assert.equal(
    parseTravelData(JSON.stringify(data)).trips[0].image,
    data.trips[0].image,
  );
  data.trips[0].image = "https://evil.example/track.png";
  assert.throws(() => parseTravelData(JSON.stringify(data)));
});

test("request size limits reject streamed bodies without trusting Content-Length", async () => {
  const make = () =>
    new Request("https://trips.example/api/auth", {
      method: "POST",
      body: "1234567890",
    });
  await assert.rejects(limitedBody(make(), 5), (error) => error.status === 413);
  assert.equal(
    new TextDecoder().decode(await limitedBody(make(), 10)),
    "1234567890",
  );
});

test("origin checks support Next's internal URL without trusting a forwarded host",()=>{
  const request = new Request('http://localhost:3000/api/auth', {headers:{host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000','x-forwarded-host':'attacker.example','x-forwarded-proto':'http'}});
  assert.equal(appOrigin(request),'http://127.0.0.1:3000');
  assert.equal(sameOrigin(request),true);
  request.headers.set('origin','https://attacker.example');
  assert.equal(sameOrigin(request),false);
});
test('configured public origin overrides spoofed Host headers',()=>{
  const previous=process.env.APP_ORIGIN;process.env.APP_ORIGIN='https://trips.example';
  try{
    const request=new Request('http://localhost:3000/api/auth',{headers:{host:'attacker.example',origin:'https://attacker.example'}});
    assert.equal(sameOrigin(request),false);
    request.headers.set('origin','https://trips.example');assert.equal(sameOrigin(request),true);
  }finally{if(previous===undefined)delete process.env.APP_ORIGIN;else process.env.APP_ORIGIN=previous;}
});
test('loopback aliases are accepted only in development on the configured port',()=>{
  const previousOrigin=process.env.APP_ORIGIN, previousMode=process.env.NODE_ENV;
  process.env.APP_ORIGIN='http://127.0.0.1:3000';process.env.NODE_ENV='development';
  try {
    const request=new Request('http://localhost:3000/api/auth',{headers:{host:'localhost:3000',origin:'http://localhost:3000'}});
    assert.equal(sameOrigin(request),true);
    request.headers.set('origin','http://localhost:3001');assert.equal(sameOrigin(request),false);
    request.headers.set('origin','http://attacker.example:3000');assert.equal(sameOrigin(request),false);
    request.headers.set('origin','http://localhost:3000');request.headers.set('host','attacker.example:3000');assert.equal(sameOrigin(request),false);
    request.headers.set('host','localhost:3000');process.env.NODE_ENV='production';assert.equal(sameOrigin(request),false);
  } finally {
    if(previousOrigin===undefined)delete process.env.APP_ORIGIN;else process.env.APP_ORIGIN=previousOrigin;
    if(previousMode===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=previousMode;
  }
});
test('bookmarks are bounded, deduplicated and contain only story identifiers',()=>{
 const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 assert.deepEqual(normalizeWorkspace({trips:[],notes:[],bookmarks:[id,id]}).bookmarks,[id]);
 assert.throws(()=>normalizeWorkspace({trips:[],notes:[],bookmarks:['javascript:bad']}));
});
