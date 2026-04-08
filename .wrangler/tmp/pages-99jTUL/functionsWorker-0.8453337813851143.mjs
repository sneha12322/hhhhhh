var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../.wrangler/tmp/bundle-DLCn7T/checked-fetch.js
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
var urls;
var init_checked_fetch = __esm({
  "../.wrangler/tmp/bundle-DLCn7T/checked-fetch.js"() {
    urls = /* @__PURE__ */ new Set();
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// ../node_modules/jose/dist/browser/runtime/webcrypto.js
var webcrypto_default, isCryptoKey;
var init_webcrypto = __esm({
  "../node_modules/jose/dist/browser/runtime/webcrypto.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    webcrypto_default = crypto;
    isCryptoKey = /* @__PURE__ */ __name((key) => key instanceof CryptoKey, "isCryptoKey");
  }
});

// ../node_modules/jose/dist/browser/lib/buffer_utils.js
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0);
  const buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers) {
    buf.set(buffer, i);
    i += buffer.length;
  }
  return buf;
}
var encoder, decoder, MAX_INT32;
var init_buffer_utils = __esm({
  "../node_modules/jose/dist/browser/lib/buffer_utils.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    encoder = new TextEncoder();
    decoder = new TextDecoder();
    MAX_INT32 = 2 ** 32;
    __name(concat, "concat");
  }
});

// ../node_modules/jose/dist/browser/runtime/base64url.js
var encodeBase64, encode, decodeBase64, decode;
var init_base64url = __esm({
  "../node_modules/jose/dist/browser/runtime/base64url.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_buffer_utils();
    encodeBase64 = /* @__PURE__ */ __name((input) => {
      let unencoded = input;
      if (typeof unencoded === "string") {
        unencoded = encoder.encode(unencoded);
      }
      const CHUNK_SIZE = 32768;
      const arr = [];
      for (let i = 0; i < unencoded.length; i += CHUNK_SIZE) {
        arr.push(String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)));
      }
      return btoa(arr.join(""));
    }, "encodeBase64");
    encode = /* @__PURE__ */ __name((input) => {
      return encodeBase64(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    }, "encode");
    decodeBase64 = /* @__PURE__ */ __name((encoded) => {
      const binary = atob(encoded);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }, "decodeBase64");
    decode = /* @__PURE__ */ __name((input) => {
      let encoded = input;
      if (encoded instanceof Uint8Array) {
        encoded = decoder.decode(encoded);
      }
      encoded = encoded.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
      try {
        return decodeBase64(encoded);
      } catch {
        throw new TypeError("The input to be decoded is not correctly encoded.");
      }
    }, "decode");
  }
});

// ../node_modules/jose/dist/browser/util/errors.js
var JOSEError, JWTClaimValidationFailed, JWTExpired, JOSEAlgNotAllowed, JOSENotSupported, JWEDecryptionFailed, JWEInvalid, JWSInvalid, JWTInvalid, JWKInvalid, JWKSInvalid, JWKSNoMatchingKey, JWKSMultipleMatchingKeys, JWKSTimeout, JWSSignatureVerificationFailed;
var init_errors = __esm({
  "../node_modules/jose/dist/browser/util/errors.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    JOSEError = class extends Error {
      static {
        __name(this, "JOSEError");
      }
      constructor(message2, options) {
        super(message2, options);
        this.code = "ERR_JOSE_GENERIC";
        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);
      }
    };
    JOSEError.code = "ERR_JOSE_GENERIC";
    JWTClaimValidationFailed = class extends JOSEError {
      static {
        __name(this, "JWTClaimValidationFailed");
      }
      constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
        super(message2, { cause: { claim, reason, payload } });
        this.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
      }
    };
    JWTClaimValidationFailed.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
    JWTExpired = class extends JOSEError {
      static {
        __name(this, "JWTExpired");
      }
      constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
        super(message2, { cause: { claim, reason, payload } });
        this.code = "ERR_JWT_EXPIRED";
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
      }
    };
    JWTExpired.code = "ERR_JWT_EXPIRED";
    JOSEAlgNotAllowed = class extends JOSEError {
      static {
        __name(this, "JOSEAlgNotAllowed");
      }
      constructor() {
        super(...arguments);
        this.code = "ERR_JOSE_ALG_NOT_ALLOWED";
      }
    };
    JOSEAlgNotAllowed.code = "ERR_JOSE_ALG_NOT_ALLOWED";
    JOSENotSupported = class extends JOSEError {
      static {
        __name(this, "JOSENotSupported");
      }
      constructor() {
        super(...arguments);
        this.code = "ERR_JOSE_NOT_SUPPORTED";
      }
    };
    JOSENotSupported.code = "ERR_JOSE_NOT_SUPPORTED";
    JWEDecryptionFailed = class extends JOSEError {
      static {
        __name(this, "JWEDecryptionFailed");
      }
      constructor(message2 = "decryption operation failed", options) {
        super(message2, options);
        this.code = "ERR_JWE_DECRYPTION_FAILED";
      }
    };
    JWEDecryptionFailed.code = "ERR_JWE_DECRYPTION_FAILED";
    JWEInvalid = class extends JOSEError {
      static {
        __name(this, "JWEInvalid");
      }
      constructor() {
        super(...arguments);
        this.code = "ERR_JWE_INVALID";
      }
    };
    JWEInvalid.code = "ERR_JWE_INVALID";
    JWSInvalid = class extends JOSEError {
      static {
        __name(this, "JWSInvalid");
      }
      constructor() {
        super(...arguments);
        this.code = "ERR_JWS_INVALID";
      }
    };
    JWSInvalid.code = "ERR_JWS_INVALID";
    JWTInvalid = class extends JOSEError {
      static {
        __name(this, "JWTInvalid");
      }
      constructor() {
        super(...arguments);
        this.code = "ERR_JWT_INVALID";
      }
    };
    JWTInvalid.code = "ERR_JWT_INVALID";
    JWKInvalid = class extends JOSEError {
      static {
        __name(this, "JWKInvalid");
      }
      constructor() {
        super(...arguments);
        this.code = "ERR_JWK_INVALID";
      }
    };
    JWKInvalid.code = "ERR_JWK_INVALID";
    JWKSInvalid = class extends JOSEError {
      static {
        __name(this, "JWKSInvalid");
      }
      constructor() {
        super(...arguments);
        this.code = "ERR_JWKS_INVALID";
      }
    };
    JWKSInvalid.code = "ERR_JWKS_INVALID";
    JWKSNoMatchingKey = class extends JOSEError {
      static {
        __name(this, "JWKSNoMatchingKey");
      }
      constructor(message2 = "no applicable key found in the JSON Web Key Set", options) {
        super(message2, options);
        this.code = "ERR_JWKS_NO_MATCHING_KEY";
      }
    };
    JWKSNoMatchingKey.code = "ERR_JWKS_NO_MATCHING_KEY";
    JWKSMultipleMatchingKeys = class extends JOSEError {
      static {
        __name(this, "JWKSMultipleMatchingKeys");
      }
      constructor(message2 = "multiple matching keys found in the JSON Web Key Set", options) {
        super(message2, options);
        this.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
      }
    };
    JWKSMultipleMatchingKeys.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
    JWKSTimeout = class extends JOSEError {
      static {
        __name(this, "JWKSTimeout");
      }
      constructor(message2 = "request timed out", options) {
        super(message2, options);
        this.code = "ERR_JWKS_TIMEOUT";
      }
    };
    JWKSTimeout.code = "ERR_JWKS_TIMEOUT";
    JWSSignatureVerificationFailed = class extends JOSEError {
      static {
        __name(this, "JWSSignatureVerificationFailed");
      }
      constructor(message2 = "signature verification failed", options) {
        super(message2, options);
        this.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
      }
    };
    JWSSignatureVerificationFailed.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  }
});

// ../node_modules/jose/dist/browser/lib/crypto_key.js
function unusable(name, prop = "algorithm.name") {
  return new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
}
function isAlgorithm(algorithm, name) {
  return algorithm.name === name;
}
function getHashLength(hash) {
  return parseInt(hash.name.slice(4), 10);
}
function getNamedCurve(alg) {
  switch (alg) {
    case "ES256":
      return "P-256";
    case "ES384":
      return "P-384";
    case "ES512":
      return "P-521";
    default:
      throw new Error("unreachable");
  }
}
function checkUsage(key, usages) {
  if (usages.length && !usages.some((expected) => key.usages.includes(expected))) {
    let msg = "CryptoKey does not support this operation, its usages must include ";
    if (usages.length > 2) {
      const last = usages.pop();
      msg += `one of ${usages.join(", ")}, or ${last}.`;
    } else if (usages.length === 2) {
      msg += `one of ${usages[0]} or ${usages[1]}.`;
    } else {
      msg += `${usages[0]}.`;
    }
    throw new TypeError(msg);
  }
}
function checkSigCryptoKey(key, alg, ...usages) {
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512": {
      if (!isAlgorithm(key.algorithm, "HMAC"))
        throw unusable("HMAC");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "RS256":
    case "RS384":
    case "RS512": {
      if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5"))
        throw unusable("RSASSA-PKCS1-v1_5");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "PS256":
    case "PS384":
    case "PS512": {
      if (!isAlgorithm(key.algorithm, "RSA-PSS"))
        throw unusable("RSA-PSS");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "EdDSA": {
      if (key.algorithm.name !== "Ed25519" && key.algorithm.name !== "Ed448") {
        throw unusable("Ed25519 or Ed448");
      }
      break;
    }
    case "Ed25519": {
      if (!isAlgorithm(key.algorithm, "Ed25519"))
        throw unusable("Ed25519");
      break;
    }
    case "ES256":
    case "ES384":
    case "ES512": {
      if (!isAlgorithm(key.algorithm, "ECDSA"))
        throw unusable("ECDSA");
      const expected = getNamedCurve(alg);
      const actual = key.algorithm.namedCurve;
      if (actual !== expected)
        throw unusable(expected, "algorithm.namedCurve");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  checkUsage(key, usages);
}
var init_crypto_key = __esm({
  "../node_modules/jose/dist/browser/lib/crypto_key.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    __name(unusable, "unusable");
    __name(isAlgorithm, "isAlgorithm");
    __name(getHashLength, "getHashLength");
    __name(getNamedCurve, "getNamedCurve");
    __name(checkUsage, "checkUsage");
    __name(checkSigCryptoKey, "checkSigCryptoKey");
  }
});

// ../node_modules/jose/dist/browser/lib/invalid_key_input.js
function message(msg, actual, ...types2) {
  types2 = types2.filter(Boolean);
  if (types2.length > 2) {
    const last = types2.pop();
    msg += `one of type ${types2.join(", ")}, or ${last}.`;
  } else if (types2.length === 2) {
    msg += `one of type ${types2[0]} or ${types2[1]}.`;
  } else {
    msg += `of type ${types2[0]}.`;
  }
  if (actual == null) {
    msg += ` Received ${actual}`;
  } else if (typeof actual === "function" && actual.name) {
    msg += ` Received function ${actual.name}`;
  } else if (typeof actual === "object" && actual != null) {
    if (actual.constructor?.name) {
      msg += ` Received an instance of ${actual.constructor.name}`;
    }
  }
  return msg;
}
function withAlg(alg, actual, ...types2) {
  return message(`Key for the ${alg} algorithm must be `, actual, ...types2);
}
var invalid_key_input_default;
var init_invalid_key_input = __esm({
  "../node_modules/jose/dist/browser/lib/invalid_key_input.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    __name(message, "message");
    invalid_key_input_default = /* @__PURE__ */ __name((actual, ...types2) => {
      return message("Key must be ", actual, ...types2);
    }, "default");
    __name(withAlg, "withAlg");
  }
});

// ../node_modules/jose/dist/browser/runtime/is_key_like.js
var is_key_like_default, types;
var init_is_key_like = __esm({
  "../node_modules/jose/dist/browser/runtime/is_key_like.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_webcrypto();
    is_key_like_default = /* @__PURE__ */ __name((key) => {
      if (isCryptoKey(key)) {
        return true;
      }
      return key?.[Symbol.toStringTag] === "KeyObject";
    }, "default");
    types = ["CryptoKey"];
  }
});

// ../node_modules/jose/dist/browser/lib/is_disjoint.js
var isDisjoint, is_disjoint_default;
var init_is_disjoint = __esm({
  "../node_modules/jose/dist/browser/lib/is_disjoint.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    isDisjoint = /* @__PURE__ */ __name((...headers) => {
      const sources = headers.filter(Boolean);
      if (sources.length === 0 || sources.length === 1) {
        return true;
      }
      let acc;
      for (const header of sources) {
        const parameters = Object.keys(header);
        if (!acc || acc.size === 0) {
          acc = new Set(parameters);
          continue;
        }
        for (const parameter of parameters) {
          if (acc.has(parameter)) {
            return false;
          }
          acc.add(parameter);
        }
      }
      return true;
    }, "isDisjoint");
    is_disjoint_default = isDisjoint;
  }
});

// ../node_modules/jose/dist/browser/lib/is_object.js
function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}
function isObject(input) {
  if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") {
    return false;
  }
  if (Object.getPrototypeOf(input) === null) {
    return true;
  }
  let proto = input;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(input) === proto;
}
var init_is_object = __esm({
  "../node_modules/jose/dist/browser/lib/is_object.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    __name(isObjectLike, "isObjectLike");
    __name(isObject, "isObject");
  }
});

// ../node_modules/jose/dist/browser/runtime/check_key_length.js
var check_key_length_default;
var init_check_key_length = __esm({
  "../node_modules/jose/dist/browser/runtime/check_key_length.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    check_key_length_default = /* @__PURE__ */ __name((alg, key) => {
      if (alg.startsWith("RS") || alg.startsWith("PS")) {
        const { modulusLength } = key.algorithm;
        if (typeof modulusLength !== "number" || modulusLength < 2048) {
          throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
        }
      }
    }, "default");
  }
});

// ../node_modules/jose/dist/browser/lib/is_jwk.js
function isJWK(key) {
  return isObject(key) && typeof key.kty === "string";
}
function isPrivateJWK(key) {
  return key.kty !== "oct" && typeof key.d === "string";
}
function isPublicJWK(key) {
  return key.kty !== "oct" && typeof key.d === "undefined";
}
function isSecretJWK(key) {
  return isJWK(key) && key.kty === "oct" && typeof key.k === "string";
}
var init_is_jwk = __esm({
  "../node_modules/jose/dist/browser/lib/is_jwk.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_is_object();
    __name(isJWK, "isJWK");
    __name(isPrivateJWK, "isPrivateJWK");
    __name(isPublicJWK, "isPublicJWK");
    __name(isSecretJWK, "isSecretJWK");
  }
});

// ../node_modules/jose/dist/browser/runtime/jwk_to_key.js
function subtleMapping(jwk) {
  let algorithm;
  let keyUsages;
  switch (jwk.kty) {
    case "RSA": {
      switch (jwk.alg) {
        case "PS256":
        case "PS384":
        case "PS512":
          algorithm = { name: "RSA-PSS", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RS256":
        case "RS384":
        case "RS512":
          algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RSA-OAEP":
        case "RSA-OAEP-256":
        case "RSA-OAEP-384":
        case "RSA-OAEP-512":
          algorithm = {
            name: "RSA-OAEP",
            hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`
          };
          keyUsages = jwk.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "EC": {
      switch (jwk.alg) {
        case "ES256":
          algorithm = { name: "ECDSA", namedCurve: "P-256" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES384":
          algorithm = { name: "ECDSA", namedCurve: "P-384" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES512":
          algorithm = { name: "ECDSA", namedCurve: "P-521" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: "ECDH", namedCurve: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "OKP": {
      switch (jwk.alg) {
        case "Ed25519":
          algorithm = { name: "Ed25519" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "EdDSA":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    default:
      throw new JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
  }
  return { algorithm, keyUsages };
}
var parse, jwk_to_key_default;
var init_jwk_to_key = __esm({
  "../node_modules/jose/dist/browser/runtime/jwk_to_key.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_webcrypto();
    init_errors();
    __name(subtleMapping, "subtleMapping");
    parse = /* @__PURE__ */ __name(async (jwk) => {
      if (!jwk.alg) {
        throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
      }
      const { algorithm, keyUsages } = subtleMapping(jwk);
      const rest = [
        algorithm,
        jwk.ext ?? false,
        jwk.key_ops ?? keyUsages
      ];
      const keyData = { ...jwk };
      delete keyData.alg;
      delete keyData.use;
      return webcrypto_default.subtle.importKey("jwk", keyData, ...rest);
    }, "parse");
    jwk_to_key_default = parse;
  }
});

// ../node_modules/jose/dist/browser/runtime/normalize_key.js
var exportKeyValue, privCache, pubCache, isKeyObject, importAndCache, normalizePublicKey, normalizePrivateKey, normalize_key_default;
var init_normalize_key = __esm({
  "../node_modules/jose/dist/browser/runtime/normalize_key.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_is_jwk();
    init_base64url();
    init_jwk_to_key();
    exportKeyValue = /* @__PURE__ */ __name((k) => decode(k), "exportKeyValue");
    isKeyObject = /* @__PURE__ */ __name((key) => {
      return key?.[Symbol.toStringTag] === "KeyObject";
    }, "isKeyObject");
    importAndCache = /* @__PURE__ */ __name(async (cache, key, jwk, alg, freeze = false) => {
      let cached = cache.get(key);
      if (cached?.[alg]) {
        return cached[alg];
      }
      const cryptoKey = await jwk_to_key_default({ ...jwk, alg });
      if (freeze)
        Object.freeze(key);
      if (!cached) {
        cache.set(key, { [alg]: cryptoKey });
      } else {
        cached[alg] = cryptoKey;
      }
      return cryptoKey;
    }, "importAndCache");
    normalizePublicKey = /* @__PURE__ */ __name((key, alg) => {
      if (isKeyObject(key)) {
        let jwk = key.export({ format: "jwk" });
        delete jwk.d;
        delete jwk.dp;
        delete jwk.dq;
        delete jwk.p;
        delete jwk.q;
        delete jwk.qi;
        if (jwk.k) {
          return exportKeyValue(jwk.k);
        }
        pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
        return importAndCache(pubCache, key, jwk, alg);
      }
      if (isJWK(key)) {
        if (key.k)
          return decode(key.k);
        pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
        const cryptoKey = importAndCache(pubCache, key, key, alg, true);
        return cryptoKey;
      }
      return key;
    }, "normalizePublicKey");
    normalizePrivateKey = /* @__PURE__ */ __name((key, alg) => {
      if (isKeyObject(key)) {
        let jwk = key.export({ format: "jwk" });
        if (jwk.k) {
          return exportKeyValue(jwk.k);
        }
        privCache || (privCache = /* @__PURE__ */ new WeakMap());
        return importAndCache(privCache, key, jwk, alg);
      }
      if (isJWK(key)) {
        if (key.k)
          return decode(key.k);
        privCache || (privCache = /* @__PURE__ */ new WeakMap());
        const cryptoKey = importAndCache(privCache, key, key, alg, true);
        return cryptoKey;
      }
      return key;
    }, "normalizePrivateKey");
    normalize_key_default = { normalizePublicKey, normalizePrivateKey };
  }
});

// ../node_modules/jose/dist/browser/key/import.js
async function importJWK(jwk, alg) {
  if (!isObject(jwk)) {
    throw new TypeError("JWK must be an object");
  }
  alg || (alg = jwk.alg);
  switch (jwk.kty) {
    case "oct":
      if (typeof jwk.k !== "string" || !jwk.k) {
        throw new TypeError('missing "k" (Key Value) Parameter value');
      }
      return decode(jwk.k);
    case "RSA":
      if ("oth" in jwk && jwk.oth !== void 0) {
        throw new JOSENotSupported('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
      }
    case "EC":
    case "OKP":
      return jwk_to_key_default({ ...jwk, alg });
    default:
      throw new JOSENotSupported('Unsupported "kty" (Key Type) Parameter value');
  }
}
var init_import = __esm({
  "../node_modules/jose/dist/browser/key/import.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_base64url();
    init_jwk_to_key();
    init_errors();
    init_is_object();
    __name(importJWK, "importJWK");
  }
});

// ../node_modules/jose/dist/browser/lib/check_key_type.js
function checkKeyType(allowJwk, alg, key, usage) {
  const symmetric = alg.startsWith("HS") || alg === "dir" || alg.startsWith("PBES2") || /^A\d{3}(?:GCM)?KW$/.test(alg);
  if (symmetric) {
    symmetricTypeCheck(alg, key, usage, allowJwk);
  } else {
    asymmetricTypeCheck(alg, key, usage, allowJwk);
  }
}
var tag, jwkMatchesOp, symmetricTypeCheck, asymmetricTypeCheck, check_key_type_default, checkKeyTypeWithJwk;
var init_check_key_type = __esm({
  "../node_modules/jose/dist/browser/lib/check_key_type.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_invalid_key_input();
    init_is_key_like();
    init_is_jwk();
    tag = /* @__PURE__ */ __name((key) => key?.[Symbol.toStringTag], "tag");
    jwkMatchesOp = /* @__PURE__ */ __name((alg, key, usage) => {
      if (key.use !== void 0 && key.use !== "sig") {
        throw new TypeError("Invalid key for this operation, when present its use must be sig");
      }
      if (key.key_ops !== void 0 && key.key_ops.includes?.(usage) !== true) {
        throw new TypeError(`Invalid key for this operation, when present its key_ops must include ${usage}`);
      }
      if (key.alg !== void 0 && key.alg !== alg) {
        throw new TypeError(`Invalid key for this operation, when present its alg must be ${alg}`);
      }
      return true;
    }, "jwkMatchesOp");
    symmetricTypeCheck = /* @__PURE__ */ __name((alg, key, usage, allowJwk) => {
      if (key instanceof Uint8Array)
        return;
      if (allowJwk && isJWK(key)) {
        if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
      }
      if (!is_key_like_default(key)) {
        throw new TypeError(withAlg(alg, key, ...types, "Uint8Array", allowJwk ? "JSON Web Key" : null));
      }
      if (key.type !== "secret") {
        throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
      }
    }, "symmetricTypeCheck");
    asymmetricTypeCheck = /* @__PURE__ */ __name((alg, key, usage, allowJwk) => {
      if (allowJwk && isJWK(key)) {
        switch (usage) {
          case "sign":
            if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage))
              return;
            throw new TypeError(`JSON Web Key for this operation be a private JWK`);
          case "verify":
            if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage))
              return;
            throw new TypeError(`JSON Web Key for this operation be a public JWK`);
        }
      }
      if (!is_key_like_default(key)) {
        throw new TypeError(withAlg(alg, key, ...types, allowJwk ? "JSON Web Key" : null));
      }
      if (key.type === "secret") {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
      }
      if (usage === "sign" && key.type === "public") {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
      }
      if (usage === "decrypt" && key.type === "public") {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
      }
      if (key.algorithm && usage === "verify" && key.type === "private") {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
      }
      if (key.algorithm && usage === "encrypt" && key.type === "private") {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
      }
    }, "asymmetricTypeCheck");
    __name(checkKeyType, "checkKeyType");
    check_key_type_default = checkKeyType.bind(void 0, false);
    checkKeyTypeWithJwk = checkKeyType.bind(void 0, true);
  }
});

// ../node_modules/jose/dist/browser/lib/validate_crit.js
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  }
  if (!protectedHeader || protectedHeader.crit === void 0) {
    return /* @__PURE__ */ new Set();
  }
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) {
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  }
  let recognized;
  if (recognizedOption !== void 0) {
    recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
  } else {
    recognized = recognizedDefault;
  }
  for (const parameter of protectedHeader.crit) {
    if (!recognized.has(parameter)) {
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    }
    if (joseHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    }
    if (recognized.get(parameter) && protectedHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
    }
  }
  return new Set(protectedHeader.crit);
}
var validate_crit_default;
var init_validate_crit = __esm({
  "../node_modules/jose/dist/browser/lib/validate_crit.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_errors();
    __name(validateCrit, "validateCrit");
    validate_crit_default = validateCrit;
  }
});

// ../node_modules/jose/dist/browser/lib/validate_algorithms.js
var validateAlgorithms, validate_algorithms_default;
var init_validate_algorithms = __esm({
  "../node_modules/jose/dist/browser/lib/validate_algorithms.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    validateAlgorithms = /* @__PURE__ */ __name((option, algorithms) => {
      if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== "string"))) {
        throw new TypeError(`"${option}" option must be an array of strings`);
      }
      if (!algorithms) {
        return void 0;
      }
      return new Set(algorithms);
    }, "validateAlgorithms");
    validate_algorithms_default = validateAlgorithms;
  }
});

// ../node_modules/jose/dist/browser/runtime/subtle_dsa.js
function subtleDsa(alg, algorithm) {
  const hash = `SHA-${alg.slice(-3)}`;
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512":
      return { hash, name: "HMAC" };
    case "PS256":
    case "PS384":
    case "PS512":
      return { hash, name: "RSA-PSS", saltLength: alg.slice(-3) >> 3 };
    case "RS256":
    case "RS384":
    case "RS512":
      return { hash, name: "RSASSA-PKCS1-v1_5" };
    case "ES256":
    case "ES384":
    case "ES512":
      return { hash, name: "ECDSA", namedCurve: algorithm.namedCurve };
    case "Ed25519":
      return { name: "Ed25519" };
    case "EdDSA":
      return { name: algorithm.name };
    default:
      throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  }
}
var init_subtle_dsa = __esm({
  "../node_modules/jose/dist/browser/runtime/subtle_dsa.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_errors();
    __name(subtleDsa, "subtleDsa");
  }
});

// ../node_modules/jose/dist/browser/runtime/get_sign_verify_key.js
async function getCryptoKey(alg, key, usage) {
  if (usage === "sign") {
    key = await normalize_key_default.normalizePrivateKey(key, alg);
  }
  if (usage === "verify") {
    key = await normalize_key_default.normalizePublicKey(key, alg);
  }
  if (isCryptoKey(key)) {
    checkSigCryptoKey(key, alg, usage);
    return key;
  }
  if (key instanceof Uint8Array) {
    if (!alg.startsWith("HS")) {
      throw new TypeError(invalid_key_input_default(key, ...types));
    }
    return webcrypto_default.subtle.importKey("raw", key, { hash: `SHA-${alg.slice(-3)}`, name: "HMAC" }, false, [usage]);
  }
  throw new TypeError(invalid_key_input_default(key, ...types, "Uint8Array", "JSON Web Key"));
}
var init_get_sign_verify_key = __esm({
  "../node_modules/jose/dist/browser/runtime/get_sign_verify_key.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_webcrypto();
    init_crypto_key();
    init_invalid_key_input();
    init_is_key_like();
    init_normalize_key();
    __name(getCryptoKey, "getCryptoKey");
  }
});

// ../node_modules/jose/dist/browser/runtime/verify.js
var verify, verify_default;
var init_verify = __esm({
  "../node_modules/jose/dist/browser/runtime/verify.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_subtle_dsa();
    init_webcrypto();
    init_check_key_length();
    init_get_sign_verify_key();
    verify = /* @__PURE__ */ __name(async (alg, key, signature, data) => {
      const cryptoKey = await getCryptoKey(alg, key, "verify");
      check_key_length_default(alg, cryptoKey);
      const algorithm = subtleDsa(alg, cryptoKey.algorithm);
      try {
        return await webcrypto_default.subtle.verify(algorithm, cryptoKey, signature, data);
      } catch {
        return false;
      }
    }, "verify");
    verify_default = verify;
  }
});

// ../node_modules/jose/dist/browser/jws/flattened/verify.js
async function flattenedVerify(jws, key, options) {
  if (!isObject(jws)) {
    throw new JWSInvalid("Flattened JWS must be an object");
  }
  if (jws.protected === void 0 && jws.header === void 0) {
    throw new JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
  }
  if (jws.protected !== void 0 && typeof jws.protected !== "string") {
    throw new JWSInvalid("JWS Protected Header incorrect type");
  }
  if (jws.payload === void 0) {
    throw new JWSInvalid("JWS Payload missing");
  }
  if (typeof jws.signature !== "string") {
    throw new JWSInvalid("JWS Signature missing or incorrect type");
  }
  if (jws.header !== void 0 && !isObject(jws.header)) {
    throw new JWSInvalid("JWS Unprotected Header incorrect type");
  }
  let parsedProt = {};
  if (jws.protected) {
    try {
      const protectedHeader = decode(jws.protected);
      parsedProt = JSON.parse(decoder.decode(protectedHeader));
    } catch {
      throw new JWSInvalid("JWS Protected Header is invalid");
    }
  }
  if (!is_disjoint_default(parsedProt, jws.header)) {
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  }
  const joseHeader = {
    ...parsedProt,
    ...jws.header
  };
  const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, parsedProt, joseHeader);
  let b64 = true;
  if (extensions.has("b64")) {
    b64 = parsedProt.b64;
    if (typeof b64 !== "boolean") {
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    }
  }
  const { alg } = joseHeader;
  if (typeof alg !== "string" || !alg) {
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  }
  const algorithms = options && validate_algorithms_default("algorithms", options.algorithms);
  if (algorithms && !algorithms.has(alg)) {
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  }
  if (b64) {
    if (typeof jws.payload !== "string") {
      throw new JWSInvalid("JWS Payload must be a string");
    }
  } else if (typeof jws.payload !== "string" && !(jws.payload instanceof Uint8Array)) {
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  }
  let resolvedKey = false;
  if (typeof key === "function") {
    key = await key(parsedProt, jws);
    resolvedKey = true;
    checkKeyTypeWithJwk(alg, key, "verify");
    if (isJWK(key)) {
      key = await importJWK(key, alg);
    }
  } else {
    checkKeyTypeWithJwk(alg, key, "verify");
  }
  const data = concat(encoder.encode(jws.protected ?? ""), encoder.encode("."), typeof jws.payload === "string" ? encoder.encode(jws.payload) : jws.payload);
  let signature;
  try {
    signature = decode(jws.signature);
  } catch {
    throw new JWSInvalid("Failed to base64url decode the signature");
  }
  const verified = await verify_default(alg, key, signature, data);
  if (!verified) {
    throw new JWSSignatureVerificationFailed();
  }
  let payload;
  if (b64) {
    try {
      payload = decode(jws.payload);
    } catch {
      throw new JWSInvalid("Failed to base64url decode the payload");
    }
  } else if (typeof jws.payload === "string") {
    payload = encoder.encode(jws.payload);
  } else {
    payload = jws.payload;
  }
  const result = { payload };
  if (jws.protected !== void 0) {
    result.protectedHeader = parsedProt;
  }
  if (jws.header !== void 0) {
    result.unprotectedHeader = jws.header;
  }
  if (resolvedKey) {
    return { ...result, key };
  }
  return result;
}
var init_verify2 = __esm({
  "../node_modules/jose/dist/browser/jws/flattened/verify.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_base64url();
    init_verify();
    init_errors();
    init_buffer_utils();
    init_is_disjoint();
    init_is_object();
    init_check_key_type();
    init_validate_crit();
    init_validate_algorithms();
    init_is_jwk();
    init_import();
    __name(flattenedVerify, "flattenedVerify");
  }
});

// ../node_modules/jose/dist/browser/jws/compact/verify.js
async function compactVerify(jws, key, options) {
  if (jws instanceof Uint8Array) {
    jws = decoder.decode(jws);
  }
  if (typeof jws !== "string") {
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  }
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3) {
    throw new JWSInvalid("Invalid Compact JWS");
  }
  const verified = await flattenedVerify({ payload, protected: protectedHeader, signature }, key, options);
  const result = { payload: verified.payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
var init_verify3 = __esm({
  "../node_modules/jose/dist/browser/jws/compact/verify.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_verify2();
    init_errors();
    init_buffer_utils();
    __name(compactVerify, "compactVerify");
  }
});

// ../node_modules/jose/dist/browser/lib/epoch.js
var epoch_default;
var init_epoch = __esm({
  "../node_modules/jose/dist/browser/lib/epoch.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    epoch_default = /* @__PURE__ */ __name((date) => Math.floor(date.getTime() / 1e3), "default");
  }
});

// ../node_modules/jose/dist/browser/lib/secs.js
var minute, hour, day, week, year, REGEX, secs_default;
var init_secs = __esm({
  "../node_modules/jose/dist/browser/lib/secs.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    minute = 60;
    hour = minute * 60;
    day = hour * 24;
    week = day * 7;
    year = day * 365.25;
    REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
    secs_default = /* @__PURE__ */ __name((str) => {
      const matched = REGEX.exec(str);
      if (!matched || matched[4] && matched[1]) {
        throw new TypeError("Invalid time period format");
      }
      const value = parseFloat(matched[2]);
      const unit = matched[3].toLowerCase();
      let numericDate;
      switch (unit) {
        case "sec":
        case "secs":
        case "second":
        case "seconds":
        case "s":
          numericDate = Math.round(value);
          break;
        case "minute":
        case "minutes":
        case "min":
        case "mins":
        case "m":
          numericDate = Math.round(value * minute);
          break;
        case "hour":
        case "hours":
        case "hr":
        case "hrs":
        case "h":
          numericDate = Math.round(value * hour);
          break;
        case "day":
        case "days":
        case "d":
          numericDate = Math.round(value * day);
          break;
        case "week":
        case "weeks":
        case "w":
          numericDate = Math.round(value * week);
          break;
        default:
          numericDate = Math.round(value * year);
          break;
      }
      if (matched[1] === "-" || matched[4] === "ago") {
        return -numericDate;
      }
      return numericDate;
    }, "default");
  }
});

// ../node_modules/jose/dist/browser/lib/jwt_claims_set.js
var normalizeTyp, checkAudiencePresence, jwt_claims_set_default;
var init_jwt_claims_set = __esm({
  "../node_modules/jose/dist/browser/lib/jwt_claims_set.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_errors();
    init_buffer_utils();
    init_epoch();
    init_secs();
    init_is_object();
    normalizeTyp = /* @__PURE__ */ __name((value) => value.toLowerCase().replace(/^application\//, ""), "normalizeTyp");
    checkAudiencePresence = /* @__PURE__ */ __name((audPayload, audOption) => {
      if (typeof audPayload === "string") {
        return audOption.includes(audPayload);
      }
      if (Array.isArray(audPayload)) {
        return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
      }
      return false;
    }, "checkAudiencePresence");
    jwt_claims_set_default = /* @__PURE__ */ __name((protectedHeader, encodedPayload, options = {}) => {
      let payload;
      try {
        payload = JSON.parse(decoder.decode(encodedPayload));
      } catch {
      }
      if (!isObject(payload)) {
        throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
      }
      const { typ } = options;
      if (typ && (typeof protectedHeader.typ !== "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
        throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, "typ", "check_failed");
      }
      const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
      const presenceCheck = [...requiredClaims];
      if (maxTokenAge !== void 0)
        presenceCheck.push("iat");
      if (audience !== void 0)
        presenceCheck.push("aud");
      if (subject !== void 0)
        presenceCheck.push("sub");
      if (issuer !== void 0)
        presenceCheck.push("iss");
      for (const claim of new Set(presenceCheck.reverse())) {
        if (!(claim in payload)) {
          throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, "missing");
        }
      }
      if (issuer && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
        throw new JWTClaimValidationFailed('unexpected "iss" claim value', payload, "iss", "check_failed");
      }
      if (subject && payload.sub !== subject) {
        throw new JWTClaimValidationFailed('unexpected "sub" claim value', payload, "sub", "check_failed");
      }
      if (audience && !checkAudiencePresence(payload.aud, typeof audience === "string" ? [audience] : audience)) {
        throw new JWTClaimValidationFailed('unexpected "aud" claim value', payload, "aud", "check_failed");
      }
      let tolerance;
      switch (typeof options.clockTolerance) {
        case "string":
          tolerance = secs_default(options.clockTolerance);
          break;
        case "number":
          tolerance = options.clockTolerance;
          break;
        case "undefined":
          tolerance = 0;
          break;
        default:
          throw new TypeError("Invalid clockTolerance option type");
      }
      const { currentDate } = options;
      const now = epoch_default(currentDate || /* @__PURE__ */ new Date());
      if ((payload.iat !== void 0 || maxTokenAge) && typeof payload.iat !== "number") {
        throw new JWTClaimValidationFailed('"iat" claim must be a number', payload, "iat", "invalid");
      }
      if (payload.nbf !== void 0) {
        if (typeof payload.nbf !== "number") {
          throw new JWTClaimValidationFailed('"nbf" claim must be a number', payload, "nbf", "invalid");
        }
        if (payload.nbf > now + tolerance) {
          throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, "nbf", "check_failed");
        }
      }
      if (payload.exp !== void 0) {
        if (typeof payload.exp !== "number") {
          throw new JWTClaimValidationFailed('"exp" claim must be a number', payload, "exp", "invalid");
        }
        if (payload.exp <= now - tolerance) {
          throw new JWTExpired('"exp" claim timestamp check failed', payload, "exp", "check_failed");
        }
      }
      if (maxTokenAge) {
        const age = now - payload.iat;
        const max = typeof maxTokenAge === "number" ? maxTokenAge : secs_default(maxTokenAge);
        if (age - tolerance > max) {
          throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, "iat", "check_failed");
        }
        if (age < 0 - tolerance) {
          throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, "iat", "check_failed");
        }
      }
      return payload;
    }, "default");
  }
});

// ../node_modules/jose/dist/browser/jwt/verify.js
async function jwtVerify(jwt, key, options) {
  const verified = await compactVerify(jwt, key, options);
  if (verified.protectedHeader.crit?.includes("b64") && verified.protectedHeader.b64 === false) {
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  }
  const payload = jwt_claims_set_default(verified.protectedHeader, verified.payload, options);
  const result = { payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
var init_verify4 = __esm({
  "../node_modules/jose/dist/browser/jwt/verify.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_verify3();
    init_jwt_claims_set();
    init_errors();
    __name(jwtVerify, "jwtVerify");
  }
});

// ../node_modules/jose/dist/browser/runtime/sign.js
var sign, sign_default;
var init_sign = __esm({
  "../node_modules/jose/dist/browser/runtime/sign.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_subtle_dsa();
    init_webcrypto();
    init_check_key_length();
    init_get_sign_verify_key();
    sign = /* @__PURE__ */ __name(async (alg, key, data) => {
      const cryptoKey = await getCryptoKey(alg, key, "sign");
      check_key_length_default(alg, cryptoKey);
      const signature = await webcrypto_default.subtle.sign(subtleDsa(alg, cryptoKey.algorithm), cryptoKey, data);
      return new Uint8Array(signature);
    }, "sign");
    sign_default = sign;
  }
});

// ../node_modules/jose/dist/browser/jws/flattened/sign.js
var FlattenedSign;
var init_sign2 = __esm({
  "../node_modules/jose/dist/browser/jws/flattened/sign.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_base64url();
    init_sign();
    init_is_disjoint();
    init_errors();
    init_buffer_utils();
    init_check_key_type();
    init_validate_crit();
    FlattenedSign = class {
      static {
        __name(this, "FlattenedSign");
      }
      constructor(payload) {
        if (!(payload instanceof Uint8Array)) {
          throw new TypeError("payload must be an instance of Uint8Array");
        }
        this._payload = payload;
      }
      setProtectedHeader(protectedHeader) {
        if (this._protectedHeader) {
          throw new TypeError("setProtectedHeader can only be called once");
        }
        this._protectedHeader = protectedHeader;
        return this;
      }
      setUnprotectedHeader(unprotectedHeader) {
        if (this._unprotectedHeader) {
          throw new TypeError("setUnprotectedHeader can only be called once");
        }
        this._unprotectedHeader = unprotectedHeader;
        return this;
      }
      async sign(key, options) {
        if (!this._protectedHeader && !this._unprotectedHeader) {
          throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
        }
        if (!is_disjoint_default(this._protectedHeader, this._unprotectedHeader)) {
          throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
        }
        const joseHeader = {
          ...this._protectedHeader,
          ...this._unprotectedHeader
        };
        const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, this._protectedHeader, joseHeader);
        let b64 = true;
        if (extensions.has("b64")) {
          b64 = this._protectedHeader.b64;
          if (typeof b64 !== "boolean") {
            throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
          }
        }
        const { alg } = joseHeader;
        if (typeof alg !== "string" || !alg) {
          throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
        }
        checkKeyTypeWithJwk(alg, key, "sign");
        let payload = this._payload;
        if (b64) {
          payload = encoder.encode(encode(payload));
        }
        let protectedHeader;
        if (this._protectedHeader) {
          protectedHeader = encoder.encode(encode(JSON.stringify(this._protectedHeader)));
        } else {
          protectedHeader = encoder.encode("");
        }
        const data = concat(protectedHeader, encoder.encode("."), payload);
        const signature = await sign_default(alg, key, data);
        const jws = {
          signature: encode(signature),
          payload: ""
        };
        if (b64) {
          jws.payload = decoder.decode(payload);
        }
        if (this._unprotectedHeader) {
          jws.header = this._unprotectedHeader;
        }
        if (this._protectedHeader) {
          jws.protected = decoder.decode(protectedHeader);
        }
        return jws;
      }
    };
  }
});

// ../node_modules/jose/dist/browser/jws/compact/sign.js
var CompactSign;
var init_sign3 = __esm({
  "../node_modules/jose/dist/browser/jws/compact/sign.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_sign2();
    CompactSign = class {
      static {
        __name(this, "CompactSign");
      }
      constructor(payload) {
        this._flattened = new FlattenedSign(payload);
      }
      setProtectedHeader(protectedHeader) {
        this._flattened.setProtectedHeader(protectedHeader);
        return this;
      }
      async sign(key, options) {
        const jws = await this._flattened.sign(key, options);
        if (jws.payload === void 0) {
          throw new TypeError("use the flattened module for creating JWS with b64: false");
        }
        return `${jws.protected}.${jws.payload}.${jws.signature}`;
      }
    };
  }
});

// ../node_modules/jose/dist/browser/jwt/produce.js
function validateInput(label, input) {
  if (!Number.isFinite(input)) {
    throw new TypeError(`Invalid ${label} input`);
  }
  return input;
}
var ProduceJWT;
var init_produce = __esm({
  "../node_modules/jose/dist/browser/jwt/produce.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_epoch();
    init_is_object();
    init_secs();
    __name(validateInput, "validateInput");
    ProduceJWT = class {
      static {
        __name(this, "ProduceJWT");
      }
      constructor(payload = {}) {
        if (!isObject(payload)) {
          throw new TypeError("JWT Claims Set MUST be an object");
        }
        this._payload = payload;
      }
      setIssuer(issuer) {
        this._payload = { ...this._payload, iss: issuer };
        return this;
      }
      setSubject(subject) {
        this._payload = { ...this._payload, sub: subject };
        return this;
      }
      setAudience(audience) {
        this._payload = { ...this._payload, aud: audience };
        return this;
      }
      setJti(jwtId) {
        this._payload = { ...this._payload, jti: jwtId };
        return this;
      }
      setNotBefore(input) {
        if (typeof input === "number") {
          this._payload = { ...this._payload, nbf: validateInput("setNotBefore", input) };
        } else if (input instanceof Date) {
          this._payload = { ...this._payload, nbf: validateInput("setNotBefore", epoch_default(input)) };
        } else {
          this._payload = { ...this._payload, nbf: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
        }
        return this;
      }
      setExpirationTime(input) {
        if (typeof input === "number") {
          this._payload = { ...this._payload, exp: validateInput("setExpirationTime", input) };
        } else if (input instanceof Date) {
          this._payload = { ...this._payload, exp: validateInput("setExpirationTime", epoch_default(input)) };
        } else {
          this._payload = { ...this._payload, exp: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
        }
        return this;
      }
      setIssuedAt(input) {
        if (typeof input === "undefined") {
          this._payload = { ...this._payload, iat: epoch_default(/* @__PURE__ */ new Date()) };
        } else if (input instanceof Date) {
          this._payload = { ...this._payload, iat: validateInput("setIssuedAt", epoch_default(input)) };
        } else if (typeof input === "string") {
          this._payload = {
            ...this._payload,
            iat: validateInput("setIssuedAt", epoch_default(/* @__PURE__ */ new Date()) + secs_default(input))
          };
        } else {
          this._payload = { ...this._payload, iat: validateInput("setIssuedAt", input) };
        }
        return this;
      }
    };
  }
});

// ../node_modules/jose/dist/browser/jwt/sign.js
var SignJWT;
var init_sign4 = __esm({
  "../node_modules/jose/dist/browser/jwt/sign.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_sign3();
    init_errors();
    init_buffer_utils();
    init_produce();
    SignJWT = class extends ProduceJWT {
      static {
        __name(this, "SignJWT");
      }
      setProtectedHeader(protectedHeader) {
        this._protectedHeader = protectedHeader;
        return this;
      }
      async sign(key, options) {
        const sig = new CompactSign(encoder.encode(JSON.stringify(this._payload)));
        sig.setProtectedHeader(this._protectedHeader);
        if (Array.isArray(this._protectedHeader?.crit) && this._protectedHeader.crit.includes("b64") && this._protectedHeader.b64 === false) {
          throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
        }
        return sig.sign(key, options);
      }
    };
  }
});

// ../node_modules/jose/dist/browser/util/base64url.js
var init_base64url2 = __esm({
  "../node_modules/jose/dist/browser/util/base64url.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
  }
});

// ../node_modules/jose/dist/browser/index.js
var init_browser = __esm({
  "../node_modules/jose/dist/browser/index.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_verify4();
    init_sign4();
    init_errors();
    init_base64url2();
  }
});

// ../node_modules/@libsql/core/lib-esm/api.js
var LibsqlError, LibsqlBatchError;
var init_api = __esm({
  "../node_modules/@libsql/core/lib-esm/api.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    LibsqlError = class extends Error {
      static {
        __name(this, "LibsqlError");
      }
      /** Machine-readable error code. */
      code;
      /** Extended error code with more specific information (e.g., SQLITE_CONSTRAINT_PRIMARYKEY). */
      extendedCode;
      /** Raw numeric error code */
      rawCode;
      constructor(message2, code, extendedCode, rawCode, cause) {
        if (code !== void 0) {
          message2 = `${code}: ${message2}`;
        }
        super(message2, { cause });
        this.code = code;
        this.extendedCode = extendedCode;
        this.rawCode = rawCode;
        this.name = "LibsqlError";
      }
    };
    LibsqlBatchError = class extends LibsqlError {
      static {
        __name(this, "LibsqlBatchError");
      }
      /** The zero-based index of the statement that failed in the batch. */
      statementIndex;
      constructor(message2, statementIndex, code, extendedCode, rawCode, cause) {
        super(message2, code, extendedCode, rawCode, cause);
        this.statementIndex = statementIndex;
        this.name = "LibsqlBatchError";
      }
    };
  }
});

// ../node_modules/@libsql/core/lib-esm/uri.js
function parseUri(text) {
  const match2 = URI_RE.exec(text);
  if (match2 === null) {
    throw new LibsqlError(`The URL '${text}' is not in a valid format`, "URL_INVALID");
  }
  const groups = match2.groups;
  const scheme = groups["scheme"];
  const authority = groups["authority"] !== void 0 ? parseAuthority(groups["authority"]) : void 0;
  const path = percentDecode(groups["path"]);
  const query = groups["query"] !== void 0 ? parseQuery(groups["query"]) : void 0;
  const fragment = groups["fragment"] !== void 0 ? percentDecode(groups["fragment"]) : void 0;
  return { scheme, authority, path, query, fragment };
}
function parseAuthority(text) {
  const match2 = AUTHORITY_RE.exec(text);
  if (match2 === null) {
    throw new LibsqlError("The authority part of the URL is not in a valid format", "URL_INVALID");
  }
  const groups = match2.groups;
  const host = percentDecode(groups["host_br"] ?? groups["host"]);
  const port = groups["port"] ? parseInt(groups["port"], 10) : void 0;
  const userinfo = groups["username"] !== void 0 ? {
    username: percentDecode(groups["username"]),
    password: groups["password"] !== void 0 ? percentDecode(groups["password"]) : void 0
  } : void 0;
  return { host, port, userinfo };
}
function parseQuery(text) {
  const sequences = text.split("&");
  const pairs = [];
  for (const sequence of sequences) {
    if (sequence === "") {
      continue;
    }
    let key;
    let value;
    const splitIdx = sequence.indexOf("=");
    if (splitIdx < 0) {
      key = sequence;
      value = "";
    } else {
      key = sequence.substring(0, splitIdx);
      value = sequence.substring(splitIdx + 1);
    }
    pairs.push({
      key: percentDecode(key.replaceAll("+", " ")),
      value: percentDecode(value.replaceAll("+", " "))
    });
  }
  return { pairs };
}
function percentDecode(text) {
  try {
    return decodeURIComponent(text);
  } catch (e) {
    if (e instanceof URIError) {
      throw new LibsqlError(`URL component has invalid percent encoding: ${e}`, "URL_INVALID", void 0, void 0, e);
    }
    throw e;
  }
}
function encodeBaseUrl(scheme, authority, path) {
  if (authority === void 0) {
    throw new LibsqlError(`URL with scheme ${JSON.stringify(scheme + ":")} requires authority (the "//" part)`, "URL_INVALID");
  }
  const schemeText = `${scheme}:`;
  const hostText = encodeHost(authority.host);
  const portText = encodePort(authority.port);
  const userinfoText = encodeUserinfo(authority.userinfo);
  const authorityText = `//${userinfoText}${hostText}${portText}`;
  let pathText = path.split("/").map(encodeURIComponent).join("/");
  if (pathText !== "" && !pathText.startsWith("/")) {
    pathText = "/" + pathText;
  }
  return new URL(`${schemeText}${authorityText}${pathText}`);
}
function encodeHost(host) {
  return host.includes(":") ? `[${encodeURI(host)}]` : encodeURI(host);
}
function encodePort(port) {
  return port !== void 0 ? `:${port}` : "";
}
function encodeUserinfo(userinfo) {
  if (userinfo === void 0) {
    return "";
  }
  const usernameText = encodeURIComponent(userinfo.username);
  const passwordText = userinfo.password !== void 0 ? `:${encodeURIComponent(userinfo.password)}` : "";
  return `${usernameText}${passwordText}@`;
}
var URI_RE, AUTHORITY_RE;
var init_uri = __esm({
  "../node_modules/@libsql/core/lib-esm/uri.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_api();
    __name(parseUri, "parseUri");
    URI_RE = (() => {
      const SCHEME = "(?<scheme>[A-Za-z][A-Za-z.+-]*)";
      const AUTHORITY = "(?<authority>[^/?#]*)";
      const PATH = "(?<path>[^?#]*)";
      const QUERY = "(?<query>[^#]*)";
      const FRAGMENT = "(?<fragment>.*)";
      return new RegExp(`^${SCHEME}:(//${AUTHORITY})?${PATH}(\\?${QUERY})?(#${FRAGMENT})?$`, "su");
    })();
    __name(parseAuthority, "parseAuthority");
    AUTHORITY_RE = (() => {
      return new RegExp(`^((?<username>[^:]*)(:(?<password>.*))?@)?((?<host>[^:\\[\\]]*)|(\\[(?<host_br>[^\\[\\]]*)\\]))(:(?<port>[0-9]*))?$`, "su");
    })();
    __name(parseQuery, "parseQuery");
    __name(percentDecode, "percentDecode");
    __name(encodeBaseUrl, "encodeBaseUrl");
    __name(encodeHost, "encodeHost");
    __name(encodePort, "encodePort");
    __name(encodeUserinfo, "encodeUserinfo");
  }
});

// ../node_modules/js-base64/base64.mjs
var version, VERSION, _hasBuffer, _TD, _TE, b64ch, b64chs, b64tab, b64re, _fromCC, _U8Afrom, _mkUriSafe, _tidyB64, btoaPolyfill, _btoa, _fromUint8Array, fromUint8Array, cb_utob, re_utob, utob, _encode, encode2, encodeURI2, re_btou, cb_btou, btou, atobPolyfill, _atob, _toUint8Array, toUint8Array, _decode, _unURI, decode2, isValid, _noEnum, extendString, extendUint8Array, extendBuiltins, gBase64;
var init_base64 = __esm({
  "../node_modules/js-base64/base64.mjs"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    version = "3.7.8";
    VERSION = version;
    _hasBuffer = typeof Buffer === "function";
    _TD = typeof TextDecoder === "function" ? new TextDecoder() : void 0;
    _TE = typeof TextEncoder === "function" ? new TextEncoder() : void 0;
    b64ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    b64chs = Array.prototype.slice.call(b64ch);
    b64tab = ((a) => {
      let tab = {};
      a.forEach((c, i) => tab[c] = i);
      return tab;
    })(b64chs);
    b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
    _fromCC = String.fromCharCode.bind(String);
    _U8Afrom = typeof Uint8Array.from === "function" ? Uint8Array.from.bind(Uint8Array) : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));
    _mkUriSafe = /* @__PURE__ */ __name((src) => src.replace(/=/g, "").replace(/[+\/]/g, (m0) => m0 == "+" ? "-" : "_"), "_mkUriSafe");
    _tidyB64 = /* @__PURE__ */ __name((s) => s.replace(/[^A-Za-z0-9\+\/]/g, ""), "_tidyB64");
    btoaPolyfill = /* @__PURE__ */ __name((bin) => {
      let u32, c0, c1, c2, asc = "";
      const pad = bin.length % 3;
      for (let i = 0; i < bin.length; ) {
        if ((c0 = bin.charCodeAt(i++)) > 255 || (c1 = bin.charCodeAt(i++)) > 255 || (c2 = bin.charCodeAt(i++)) > 255)
          throw new TypeError("invalid character found");
        u32 = c0 << 16 | c1 << 8 | c2;
        asc += b64chs[u32 >> 18 & 63] + b64chs[u32 >> 12 & 63] + b64chs[u32 >> 6 & 63] + b64chs[u32 & 63];
      }
      return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
    }, "btoaPolyfill");
    _btoa = typeof btoa === "function" ? (bin) => btoa(bin) : _hasBuffer ? (bin) => Buffer.from(bin, "binary").toString("base64") : btoaPolyfill;
    _fromUint8Array = _hasBuffer ? (u8a) => Buffer.from(u8a).toString("base64") : (u8a) => {
      const maxargs = 4096;
      let strs = [];
      for (let i = 0, l = u8a.length; i < l; i += maxargs) {
        strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
      }
      return _btoa(strs.join(""));
    };
    fromUint8Array = /* @__PURE__ */ __name((u8a, urlsafe = false) => urlsafe ? _mkUriSafe(_fromUint8Array(u8a)) : _fromUint8Array(u8a), "fromUint8Array");
    cb_utob = /* @__PURE__ */ __name((c) => {
      if (c.length < 2) {
        var cc = c.charCodeAt(0);
        return cc < 128 ? c : cc < 2048 ? _fromCC(192 | cc >>> 6) + _fromCC(128 | cc & 63) : _fromCC(224 | cc >>> 12 & 15) + _fromCC(128 | cc >>> 6 & 63) + _fromCC(128 | cc & 63);
      } else {
        var cc = 65536 + (c.charCodeAt(0) - 55296) * 1024 + (c.charCodeAt(1) - 56320);
        return _fromCC(240 | cc >>> 18 & 7) + _fromCC(128 | cc >>> 12 & 63) + _fromCC(128 | cc >>> 6 & 63) + _fromCC(128 | cc & 63);
      }
    }, "cb_utob");
    re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    utob = /* @__PURE__ */ __name((u) => u.replace(re_utob, cb_utob), "utob");
    _encode = _hasBuffer ? (s) => Buffer.from(s, "utf8").toString("base64") : _TE ? (s) => _fromUint8Array(_TE.encode(s)) : (s) => _btoa(utob(s));
    encode2 = /* @__PURE__ */ __name((src, urlsafe = false) => urlsafe ? _mkUriSafe(_encode(src)) : _encode(src), "encode");
    encodeURI2 = /* @__PURE__ */ __name((src) => encode2(src, true), "encodeURI");
    re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
    cb_btou = /* @__PURE__ */ __name((cccc) => {
      switch (cccc.length) {
        case 4:
          var cp = (7 & cccc.charCodeAt(0)) << 18 | (63 & cccc.charCodeAt(1)) << 12 | (63 & cccc.charCodeAt(2)) << 6 | 63 & cccc.charCodeAt(3), offset = cp - 65536;
          return _fromCC((offset >>> 10) + 55296) + _fromCC((offset & 1023) + 56320);
        case 3:
          return _fromCC((15 & cccc.charCodeAt(0)) << 12 | (63 & cccc.charCodeAt(1)) << 6 | 63 & cccc.charCodeAt(2));
        default:
          return _fromCC((31 & cccc.charCodeAt(0)) << 6 | 63 & cccc.charCodeAt(1));
      }
    }, "cb_btou");
    btou = /* @__PURE__ */ __name((b) => b.replace(re_btou, cb_btou), "btou");
    atobPolyfill = /* @__PURE__ */ __name((asc) => {
      asc = asc.replace(/\s+/g, "");
      if (!b64re.test(asc))
        throw new TypeError("malformed base64.");
      asc += "==".slice(2 - (asc.length & 3));
      let u24, r1, r2;
      let binArray = [];
      for (let i = 0; i < asc.length; ) {
        u24 = b64tab[asc.charAt(i++)] << 18 | b64tab[asc.charAt(i++)] << 12 | (r1 = b64tab[asc.charAt(i++)]) << 6 | (r2 = b64tab[asc.charAt(i++)]);
        if (r1 === 64) {
          binArray.push(_fromCC(u24 >> 16 & 255));
        } else if (r2 === 64) {
          binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255));
        } else {
          binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255));
        }
      }
      return binArray.join("");
    }, "atobPolyfill");
    _atob = typeof atob === "function" ? (asc) => atob(_tidyB64(asc)) : _hasBuffer ? (asc) => Buffer.from(asc, "base64").toString("binary") : atobPolyfill;
    _toUint8Array = _hasBuffer ? (a) => _U8Afrom(Buffer.from(a, "base64")) : (a) => _U8Afrom(_atob(a).split("").map((c) => c.charCodeAt(0)));
    toUint8Array = /* @__PURE__ */ __name((a) => _toUint8Array(_unURI(a)), "toUint8Array");
    _decode = _hasBuffer ? (a) => Buffer.from(a, "base64").toString("utf8") : _TD ? (a) => _TD.decode(_toUint8Array(a)) : (a) => btou(_atob(a));
    _unURI = /* @__PURE__ */ __name((a) => _tidyB64(a.replace(/[-_]/g, (m0) => m0 == "-" ? "+" : "/")), "_unURI");
    decode2 = /* @__PURE__ */ __name((src) => _decode(_unURI(src)), "decode");
    isValid = /* @__PURE__ */ __name((src) => {
      if (typeof src !== "string")
        return false;
      const s = src.replace(/\s+/g, "").replace(/={0,2}$/, "");
      return !/[^\s0-9a-zA-Z\+/]/.test(s) || !/[^\s0-9a-zA-Z\-_]/.test(s);
    }, "isValid");
    _noEnum = /* @__PURE__ */ __name((v) => {
      return {
        value: v,
        enumerable: false,
        writable: true,
        configurable: true
      };
    }, "_noEnum");
    extendString = /* @__PURE__ */ __name(function() {
      const _add = /* @__PURE__ */ __name((name, body) => Object.defineProperty(String.prototype, name, _noEnum(body)), "_add");
      _add("fromBase64", function() {
        return decode2(this);
      });
      _add("toBase64", function(urlsafe) {
        return encode2(this, urlsafe);
      });
      _add("toBase64URI", function() {
        return encode2(this, true);
      });
      _add("toBase64URL", function() {
        return encode2(this, true);
      });
      _add("toUint8Array", function() {
        return toUint8Array(this);
      });
    }, "extendString");
    extendUint8Array = /* @__PURE__ */ __name(function() {
      const _add = /* @__PURE__ */ __name((name, body) => Object.defineProperty(Uint8Array.prototype, name, _noEnum(body)), "_add");
      _add("toBase64", function(urlsafe) {
        return fromUint8Array(this, urlsafe);
      });
      _add("toBase64URI", function() {
        return fromUint8Array(this, true);
      });
      _add("toBase64URL", function() {
        return fromUint8Array(this, true);
      });
    }, "extendUint8Array");
    extendBuiltins = /* @__PURE__ */ __name(() => {
      extendString();
      extendUint8Array();
    }, "extendBuiltins");
    gBase64 = {
      version,
      VERSION,
      atob: _atob,
      atobPolyfill,
      btoa: _btoa,
      btoaPolyfill,
      fromBase64: decode2,
      toBase64: encode2,
      encode: encode2,
      encodeURI: encodeURI2,
      encodeURL: encodeURI2,
      utob,
      btou,
      decode: decode2,
      isValid,
      fromUint8Array,
      toUint8Array,
      extendString,
      extendUint8Array,
      extendBuiltins
    };
  }
});

// ../node_modules/@libsql/core/lib-esm/util.js
function transactionModeToBegin(mode) {
  if (mode === "write") {
    return "BEGIN IMMEDIATE";
  } else if (mode === "read") {
    return "BEGIN TRANSACTION READONLY";
  } else if (mode === "deferred") {
    return "BEGIN DEFERRED";
  } else {
    throw RangeError('Unknown transaction mode, supported values are "write", "read" and "deferred"');
  }
}
function rowToJson(row) {
  return Array.prototype.map.call(row, valueToJson);
}
function valueToJson(value) {
  if (typeof value === "bigint") {
    return "" + value;
  } else if (value instanceof ArrayBuffer) {
    return gBase64.fromUint8Array(new Uint8Array(value));
  } else {
    return value;
  }
}
var supportedUrlLink, ResultSetImpl;
var init_util = __esm({
  "../node_modules/@libsql/core/lib-esm/util.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_base64();
    supportedUrlLink = "https://github.com/libsql/libsql-client-ts#supported-urls";
    __name(transactionModeToBegin, "transactionModeToBegin");
    ResultSetImpl = class {
      static {
        __name(this, "ResultSetImpl");
      }
      columns;
      columnTypes;
      rows;
      rowsAffected;
      lastInsertRowid;
      constructor(columns, columnTypes, rows, rowsAffected, lastInsertRowid) {
        this.columns = columns;
        this.columnTypes = columnTypes;
        this.rows = rows;
        this.rowsAffected = rowsAffected;
        this.lastInsertRowid = lastInsertRowid;
      }
      toJSON() {
        return {
          columns: this.columns,
          columnTypes: this.columnTypes,
          rows: this.rows.map(rowToJson),
          rowsAffected: this.rowsAffected,
          lastInsertRowid: this.lastInsertRowid !== void 0 ? "" + this.lastInsertRowid : null
        };
      }
    };
    __name(rowToJson, "rowToJson");
    __name(valueToJson, "valueToJson");
  }
});

// ../node_modules/@libsql/core/lib-esm/config.js
function expandConfig(config, preferHttp) {
  if (typeof config !== "object") {
    throw new TypeError(`Expected client configuration as object, got ${typeof config}`);
  }
  let { url, authToken, tls, intMode, concurrency } = config;
  concurrency = Math.max(0, concurrency || 20);
  intMode ??= "number";
  let connectionQueryParams = [];
  if (url === inMemoryMode) {
    url = "file::memory:";
  }
  const uri = parseUri(url);
  const originalUriScheme = uri.scheme.toLowerCase();
  const isInMemoryMode = originalUriScheme === "file" && uri.path === inMemoryMode && uri.authority === void 0;
  let queryParamsDef;
  if (isInMemoryMode) {
    queryParamsDef = {
      cache: {
        values: ["shared", "private"],
        update: /* @__PURE__ */ __name((key, value) => connectionQueryParams.push(`${key}=${value}`), "update")
      }
    };
  } else {
    queryParamsDef = {
      tls: {
        values: ["0", "1"],
        update: /* @__PURE__ */ __name((_, value) => tls = value === "1", "update")
      },
      authToken: {
        update: /* @__PURE__ */ __name((_, value) => authToken = value, "update")
      }
    };
  }
  for (const { key, value } of uri.query?.pairs ?? []) {
    if (!Object.hasOwn(queryParamsDef, key)) {
      throw new LibsqlError(`Unsupported URL query parameter ${JSON.stringify(key)}`, "URL_PARAM_NOT_SUPPORTED");
    }
    const queryParamDef = queryParamsDef[key];
    if (queryParamDef.values !== void 0 && !queryParamDef.values.includes(value)) {
      throw new LibsqlError(`Unknown value for the "${key}" query argument: ${JSON.stringify(value)}. Supported values are: [${queryParamDef.values.map((x) => '"' + x + '"').join(", ")}]`, "URL_INVALID");
    }
    if (queryParamDef.update !== void 0) {
      queryParamDef?.update(key, value);
    }
  }
  const connectionQueryParamsString = connectionQueryParams.length === 0 ? "" : `?${connectionQueryParams.join("&")}`;
  const path = uri.path + connectionQueryParamsString;
  let scheme;
  if (originalUriScheme === "libsql") {
    if (tls === false) {
      if (uri.authority?.port === void 0) {
        throw new LibsqlError('A "libsql:" URL with ?tls=0 must specify an explicit port', "URL_INVALID");
      }
      scheme = preferHttp ? "http" : "ws";
    } else {
      scheme = preferHttp ? "https" : "wss";
    }
  } else {
    scheme = originalUriScheme;
  }
  if (scheme === "http" || scheme === "ws") {
    tls ??= false;
  } else {
    tls ??= true;
  }
  if (scheme !== "http" && scheme !== "ws" && scheme !== "https" && scheme !== "wss" && scheme !== "file") {
    throw new LibsqlError(`The client supports only "libsql:", "wss:", "ws:", "https:", "http:" and "file:" URLs, got ${JSON.stringify(uri.scheme + ":")}. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
  }
  if (intMode !== "number" && intMode !== "bigint" && intMode !== "string") {
    throw new TypeError(`Invalid value for intMode, expected "number", "bigint" or "string", got ${JSON.stringify(intMode)}`);
  }
  if (uri.fragment !== void 0) {
    throw new LibsqlError(`URL fragments are not supported: ${JSON.stringify("#" + uri.fragment)}`, "URL_INVALID");
  }
  if (isInMemoryMode) {
    return {
      scheme: "file",
      tls: false,
      path,
      intMode,
      concurrency,
      syncUrl: config.syncUrl,
      syncInterval: config.syncInterval,
      readYourWrites: config.readYourWrites,
      offline: config.offline,
      fetch: config.fetch,
      authToken: void 0,
      encryptionKey: void 0,
      remoteEncryptionKey: void 0,
      authority: void 0
    };
  }
  return {
    scheme,
    tls,
    authority: uri.authority,
    path,
    authToken,
    intMode,
    concurrency,
    encryptionKey: config.encryptionKey,
    remoteEncryptionKey: config.remoteEncryptionKey,
    syncUrl: config.syncUrl,
    syncInterval: config.syncInterval,
    readYourWrites: config.readYourWrites,
    offline: config.offline,
    fetch: config.fetch
  };
}
var inMemoryMode;
var init_config = __esm({
  "../node_modules/@libsql/core/lib-esm/config.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_api();
    init_uri();
    init_util();
    inMemoryMode = ":memory:";
    __name(expandConfig, "expandConfig");
  }
});

// ../node_modules/@libsql/isomorphic-ws/web.mjs
var _WebSocket;
var init_web = __esm({
  "../node_modules/@libsql/isomorphic-ws/web.mjs"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    if (typeof WebSocket !== "undefined") {
      _WebSocket = WebSocket;
    } else if (typeof global !== "undefined") {
      _WebSocket = global.WebSocket;
    } else if (typeof window !== "undefined") {
      _WebSocket = window.WebSocket;
    } else if (typeof self !== "undefined") {
      _WebSocket = self.WebSocket;
    }
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/client.js
var Client;
var init_client = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/client.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    Client = class {
      static {
        __name(this, "Client");
      }
      /** @private */
      constructor() {
        this.intMode = "number";
      }
      /** Representation of integers returned from the database. See {@link IntMode}.
       *
       * This value is inherited by {@link Stream} objects created with {@link openStream}, but you can
       * override the integer mode for every stream by setting {@link Stream.intMode} on the stream.
       */
      intMode;
    };
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/errors.js
var ClientError, ProtoError, ResponseError, ClosedError, WebSocketUnsupportedError, WebSocketError, HttpServerError, ProtocolVersionError, InternalError, MisuseError;
var init_errors2 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/errors.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    ClientError = class extends Error {
      static {
        __name(this, "ClientError");
      }
      /** @private */
      constructor(message2) {
        super(message2);
        this.name = "ClientError";
      }
    };
    ProtoError = class extends ClientError {
      static {
        __name(this, "ProtoError");
      }
      /** @private */
      constructor(message2) {
        super(message2);
        this.name = "ProtoError";
      }
    };
    ResponseError = class extends ClientError {
      static {
        __name(this, "ResponseError");
      }
      code;
      /** @internal */
      proto;
      /** @private */
      constructor(message2, protoError) {
        super(message2);
        this.name = "ResponseError";
        this.code = protoError.code;
        this.proto = protoError;
        this.stack = void 0;
      }
    };
    ClosedError = class extends ClientError {
      static {
        __name(this, "ClosedError");
      }
      /** @private */
      constructor(message2, cause) {
        if (cause !== void 0) {
          super(`${message2}: ${cause}`);
          this.cause = cause;
        } else {
          super(message2);
        }
        this.name = "ClosedError";
      }
    };
    WebSocketUnsupportedError = class extends ClientError {
      static {
        __name(this, "WebSocketUnsupportedError");
      }
      /** @private */
      constructor(message2) {
        super(message2);
        this.name = "WebSocketUnsupportedError";
      }
    };
    WebSocketError = class extends ClientError {
      static {
        __name(this, "WebSocketError");
      }
      /** @private */
      constructor(message2) {
        super(message2);
        this.name = "WebSocketError";
      }
    };
    HttpServerError = class extends ClientError {
      static {
        __name(this, "HttpServerError");
      }
      status;
      /** @private */
      constructor(message2, status) {
        super(message2);
        this.status = status;
        this.name = "HttpServerError";
      }
    };
    ProtocolVersionError = class extends ClientError {
      static {
        __name(this, "ProtocolVersionError");
      }
      /** @private */
      constructor(message2) {
        super(message2);
        this.name = "ProtocolVersionError";
      }
    };
    InternalError = class extends ClientError {
      static {
        __name(this, "InternalError");
      }
      /** @private */
      constructor(message2) {
        super(message2);
        this.name = "InternalError";
      }
    };
    MisuseError = class extends ClientError {
      static {
        __name(this, "MisuseError");
      }
      /** @private */
      constructor(message2) {
        super(message2);
        this.name = "MisuseError";
      }
    };
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/encoding/json/decode.js
function string(value) {
  if (typeof value === "string") {
    return value;
  }
  throw typeError(value, "string");
}
function stringOpt(value) {
  if (value === null || value === void 0) {
    return void 0;
  } else if (typeof value === "string") {
    return value;
  }
  throw typeError(value, "string or null");
}
function number(value) {
  if (typeof value === "number") {
    return value;
  }
  throw typeError(value, "number");
}
function boolean(value) {
  if (typeof value === "boolean") {
    return value;
  }
  throw typeError(value, "boolean");
}
function array(value) {
  if (Array.isArray(value)) {
    return value;
  }
  throw typeError(value, "array");
}
function object(value) {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  throw typeError(value, "object");
}
function arrayObjectsMap(value, fun) {
  return array(value).map((elemValue) => fun(object(elemValue)));
}
function typeError(value, expected) {
  if (value === void 0) {
    return new ProtoError(`Expected ${expected}, but the property was missing`);
  }
  let received = typeof value;
  if (value === null) {
    received = "null";
  } else if (Array.isArray(value)) {
    received = "array";
  }
  return new ProtoError(`Expected ${expected}, received ${received}`);
}
function readJsonObject(value, fun) {
  return fun(object(value));
}
var init_decode = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/encoding/json/decode.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_errors2();
    __name(string, "string");
    __name(stringOpt, "stringOpt");
    __name(number, "number");
    __name(boolean, "boolean");
    __name(array, "array");
    __name(object, "object");
    __name(arrayObjectsMap, "arrayObjectsMap");
    __name(typeError, "typeError");
    __name(readJsonObject, "readJsonObject");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/encoding/json/encode.js
function writeJsonObject(value, fun) {
  const output = [];
  const writer = new ObjectWriter(output);
  writer.begin();
  fun(writer, value);
  writer.end();
  return output.join("");
}
var ObjectWriter;
var init_encode = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/encoding/json/encode.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    ObjectWriter = class {
      static {
        __name(this, "ObjectWriter");
      }
      #output;
      #isFirst;
      constructor(output) {
        this.#output = output;
        this.#isFirst = false;
      }
      begin() {
        this.#output.push("{");
        this.#isFirst = true;
      }
      end() {
        this.#output.push("}");
        this.#isFirst = false;
      }
      #key(name) {
        if (this.#isFirst) {
          this.#output.push('"');
          this.#isFirst = false;
        } else {
          this.#output.push(',"');
        }
        this.#output.push(name);
        this.#output.push('":');
      }
      string(name, value) {
        this.#key(name);
        this.#output.push(JSON.stringify(value));
      }
      stringRaw(name, value) {
        this.#key(name);
        this.#output.push('"');
        this.#output.push(value);
        this.#output.push('"');
      }
      number(name, value) {
        this.#key(name);
        this.#output.push("" + value);
      }
      boolean(name, value) {
        this.#key(name);
        this.#output.push(value ? "true" : "false");
      }
      object(name, value, valueFun) {
        this.#key(name);
        this.begin();
        valueFun(this, value);
        this.end();
      }
      arrayObjects(name, values, valueFun) {
        this.#key(name);
        this.#output.push("[");
        for (let i = 0; i < values.length; ++i) {
          if (i !== 0) {
            this.#output.push(",");
          }
          this.begin();
          valueFun(this, values[i]);
          this.end();
        }
        this.#output.push("]");
      }
    };
    __name(writeJsonObject, "writeJsonObject");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/util.js
var VARINT, FIXED_64, LENGTH_DELIMITED, FIXED_32;
var init_util2 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/util.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    VARINT = 0;
    FIXED_64 = 1;
    LENGTH_DELIMITED = 2;
    FIXED_32 = 5;
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/decode.js
function readProtobufMessage(data, def) {
  const msgReader = new MessageReader(data);
  const fieldReader = new FieldReader(msgReader);
  let value = def.default();
  while (!msgReader.eof()) {
    const key = msgReader.varint();
    const tag2 = key >> 3;
    const wireType = key & 7;
    fieldReader.setup(wireType);
    const tagFun = def[tag2];
    if (tagFun !== void 0) {
      const returnedValue = tagFun(fieldReader, value);
      if (returnedValue !== void 0) {
        value = returnedValue;
      }
    }
    fieldReader.maybeSkip();
  }
  return value;
}
var MessageReader, FieldReader;
var init_decode2 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/decode.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_errors2();
    init_util2();
    MessageReader = class {
      static {
        __name(this, "MessageReader");
      }
      #array;
      #view;
      #pos;
      constructor(array2) {
        this.#array = array2;
        this.#view = new DataView(array2.buffer, array2.byteOffset, array2.byteLength);
        this.#pos = 0;
      }
      varint() {
        let value = 0;
        for (let shift = 0; ; shift += 7) {
          const byte = this.#array[this.#pos++];
          value |= (byte & 127) << shift;
          if (!(byte & 128)) {
            break;
          }
        }
        return value;
      }
      varintBig() {
        let value = 0n;
        for (let shift = 0n; ; shift += 7n) {
          const byte = this.#array[this.#pos++];
          value |= BigInt(byte & 127) << shift;
          if (!(byte & 128)) {
            break;
          }
        }
        return value;
      }
      bytes(length) {
        const array2 = new Uint8Array(this.#array.buffer, this.#array.byteOffset + this.#pos, length);
        this.#pos += length;
        return array2;
      }
      double() {
        const value = this.#view.getFloat64(this.#pos, true);
        this.#pos += 8;
        return value;
      }
      skipVarint() {
        for (; ; ) {
          const byte = this.#array[this.#pos++];
          if (!(byte & 128)) {
            break;
          }
        }
      }
      skip(count) {
        this.#pos += count;
      }
      eof() {
        return this.#pos >= this.#array.byteLength;
      }
    };
    FieldReader = class {
      static {
        __name(this, "FieldReader");
      }
      #reader;
      #wireType;
      constructor(reader) {
        this.#reader = reader;
        this.#wireType = -1;
      }
      setup(wireType) {
        this.#wireType = wireType;
      }
      #expect(expectedWireType) {
        if (this.#wireType !== expectedWireType) {
          throw new ProtoError(`Expected wire type ${expectedWireType}, got ${this.#wireType}`);
        }
        this.#wireType = -1;
      }
      bytes() {
        this.#expect(LENGTH_DELIMITED);
        const length = this.#reader.varint();
        return this.#reader.bytes(length);
      }
      string() {
        return new TextDecoder().decode(this.bytes());
      }
      message(def) {
        return readProtobufMessage(this.bytes(), def);
      }
      int32() {
        this.#expect(VARINT);
        return this.#reader.varint();
      }
      uint32() {
        return this.int32();
      }
      bool() {
        return this.int32() !== 0;
      }
      uint64() {
        this.#expect(VARINT);
        return this.#reader.varintBig();
      }
      sint64() {
        const value = this.uint64();
        return value >> 1n ^ -(value & 1n);
      }
      double() {
        this.#expect(FIXED_64);
        return this.#reader.double();
      }
      maybeSkip() {
        if (this.#wireType < 0) {
          return;
        } else if (this.#wireType === VARINT) {
          this.#reader.skipVarint();
        } else if (this.#wireType === FIXED_64) {
          this.#reader.skip(8);
        } else if (this.#wireType === LENGTH_DELIMITED) {
          const length = this.#reader.varint();
          this.#reader.skip(length);
        } else if (this.#wireType === FIXED_32) {
          this.#reader.skip(4);
        } else {
          throw new ProtoError(`Unexpected wire type ${this.#wireType}`);
        }
        this.#wireType = -1;
      }
    };
    __name(readProtobufMessage, "readProtobufMessage");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/encode.js
function writeProtobufMessage(value, fun) {
  const w = new MessageWriter();
  fun(w, value);
  return w.data();
}
var MessageWriter;
var init_encode2 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/encoding/protobuf/encode.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_util2();
    MessageWriter = class _MessageWriter {
      static {
        __name(this, "MessageWriter");
      }
      #buf;
      #array;
      #view;
      #pos;
      constructor() {
        this.#buf = new ArrayBuffer(256);
        this.#array = new Uint8Array(this.#buf);
        this.#view = new DataView(this.#buf);
        this.#pos = 0;
      }
      #ensure(extra) {
        if (this.#pos + extra <= this.#buf.byteLength) {
          return;
        }
        let newCap = this.#buf.byteLength;
        while (newCap < this.#pos + extra) {
          newCap *= 2;
        }
        const newBuf = new ArrayBuffer(newCap);
        const newArray = new Uint8Array(newBuf);
        const newView = new DataView(newBuf);
        newArray.set(new Uint8Array(this.#buf, 0, this.#pos));
        this.#buf = newBuf;
        this.#array = newArray;
        this.#view = newView;
      }
      #varint(value) {
        this.#ensure(5);
        value = 0 | value;
        do {
          let byte = value & 127;
          value >>>= 7;
          byte |= value ? 128 : 0;
          this.#array[this.#pos++] = byte;
        } while (value);
      }
      #varintBig(value) {
        this.#ensure(10);
        value = value & 0xffffffffffffffffn;
        do {
          let byte = Number(value & 0x7fn);
          value >>= 7n;
          byte |= value ? 128 : 0;
          this.#array[this.#pos++] = byte;
        } while (value);
      }
      #tag(tag2, wireType) {
        this.#varint(tag2 << 3 | wireType);
      }
      bytes(tag2, value) {
        this.#tag(tag2, LENGTH_DELIMITED);
        this.#varint(value.byteLength);
        this.#ensure(value.byteLength);
        this.#array.set(value, this.#pos);
        this.#pos += value.byteLength;
      }
      string(tag2, value) {
        this.bytes(tag2, new TextEncoder().encode(value));
      }
      message(tag2, value, fun) {
        const writer = new _MessageWriter();
        fun(writer, value);
        this.bytes(tag2, writer.data());
      }
      int32(tag2, value) {
        this.#tag(tag2, VARINT);
        this.#varint(value);
      }
      uint32(tag2, value) {
        this.int32(tag2, value);
      }
      bool(tag2, value) {
        this.int32(tag2, value ? 1 : 0);
      }
      sint64(tag2, value) {
        this.#tag(tag2, VARINT);
        this.#varintBig(value << 1n ^ value >> 63n);
      }
      double(tag2, value) {
        this.#tag(tag2, FIXED_64);
        this.#ensure(8);
        this.#view.setFloat64(this.#pos, value, true);
        this.#pos += 8;
      }
      data() {
        return new Uint8Array(this.#buf, 0, this.#pos);
      }
    };
    __name(writeProtobufMessage, "writeProtobufMessage");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/encoding/index.js
var init_encoding = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/encoding/index.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_decode();
    init_encode();
    init_decode2();
    init_encode2();
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/id_alloc.js
var IdAlloc;
var init_id_alloc = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/id_alloc.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_errors2();
    IdAlloc = class {
      static {
        __name(this, "IdAlloc");
      }
      // Set of all allocated ids
      #usedIds;
      // Set of all free ids lower than `#usedIds.size`
      #freeIds;
      constructor() {
        this.#usedIds = /* @__PURE__ */ new Set();
        this.#freeIds = /* @__PURE__ */ new Set();
      }
      // Returns an id that was free, and marks it as used.
      alloc() {
        for (const freeId2 of this.#freeIds) {
          this.#freeIds.delete(freeId2);
          this.#usedIds.add(freeId2);
          if (!this.#usedIds.has(this.#usedIds.size - 1)) {
            this.#freeIds.add(this.#usedIds.size - 1);
          }
          return freeId2;
        }
        const freeId = this.#usedIds.size;
        this.#usedIds.add(freeId);
        return freeId;
      }
      free(id) {
        if (!this.#usedIds.delete(id)) {
          throw new InternalError("Freeing an id that is not allocated");
        }
        this.#freeIds.delete(this.#usedIds.size);
        if (id < this.#usedIds.size) {
          this.#freeIds.add(id);
        }
      }
    };
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/util.js
function impossible(value, message2) {
  throw new InternalError(message2);
}
var init_util3 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/util.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_errors2();
    __name(impossible, "impossible");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/value.js
function valueToProto(value) {
  if (value === null) {
    return null;
  } else if (typeof value === "string") {
    return value;
  } else if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new RangeError("Only finite numbers (not Infinity or NaN) can be passed as arguments");
    }
    return value;
  } else if (typeof value === "bigint") {
    if (value < minInteger || value > maxInteger) {
      throw new RangeError("This bigint value is too large to be represented as a 64-bit integer and passed as argument");
    }
    return value;
  } else if (typeof value === "boolean") {
    return value ? 1n : 0n;
  } else if (value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  } else if (value instanceof Uint8Array) {
    return value;
  } else if (value instanceof Date) {
    return +value.valueOf();
  } else if (typeof value === "object") {
    return "" + value.toString();
  } else {
    throw new TypeError("Unsupported type of value");
  }
}
function valueFromProto(value, intMode) {
  if (value === null) {
    return null;
  } else if (typeof value === "number") {
    return value;
  } else if (typeof value === "string") {
    return value;
  } else if (typeof value === "bigint") {
    if (intMode === "number") {
      const num = Number(value);
      if (!Number.isSafeInteger(num)) {
        throw new RangeError("Received integer which is too large to be safely represented as a JavaScript number");
      }
      return num;
    } else if (intMode === "bigint") {
      return value;
    } else if (intMode === "string") {
      return "" + value;
    } else {
      throw new MisuseError("Invalid value for IntMode");
    }
  } else if (value instanceof Uint8Array) {
    return value.slice().buffer;
  } else if (value === void 0) {
    throw new ProtoError("Received unrecognized type of Value");
  } else {
    throw impossible(value, "Impossible type of Value");
  }
}
var minInteger, maxInteger;
var init_value = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/value.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_errors2();
    init_util3();
    __name(valueToProto, "valueToProto");
    minInteger = -9223372036854775808n;
    maxInteger = 9223372036854775807n;
    __name(valueFromProto, "valueFromProto");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/result.js
function stmtResultFromProto(result) {
  return {
    affectedRowCount: result.affectedRowCount,
    lastInsertRowid: result.lastInsertRowid,
    columnNames: result.cols.map((col) => col.name),
    columnDecltypes: result.cols.map((col) => col.decltype)
  };
}
function rowsResultFromProto(result, intMode) {
  const stmtResult = stmtResultFromProto(result);
  const rows = result.rows.map((row) => rowFromProto(stmtResult.columnNames, row, intMode));
  return { ...stmtResult, rows };
}
function rowResultFromProto(result, intMode) {
  const stmtResult = stmtResultFromProto(result);
  let row;
  if (result.rows.length > 0) {
    row = rowFromProto(stmtResult.columnNames, result.rows[0], intMode);
  }
  return { ...stmtResult, row };
}
function valueResultFromProto(result, intMode) {
  const stmtResult = stmtResultFromProto(result);
  let value;
  if (result.rows.length > 0 && stmtResult.columnNames.length > 0) {
    value = valueFromProto(result.rows[0][0], intMode);
  }
  return { ...stmtResult, value };
}
function rowFromProto(colNames, values, intMode) {
  const row = {};
  Object.defineProperty(row, "length", { value: values.length });
  for (let i = 0; i < values.length; ++i) {
    const value = valueFromProto(values[i], intMode);
    Object.defineProperty(row, i, { value });
    const colName = colNames[i];
    if (colName !== void 0 && !Object.hasOwn(row, colName)) {
      Object.defineProperty(row, colName, { value, enumerable: true, configurable: true, writable: true });
    }
  }
  return row;
}
function errorFromProto(error) {
  return new ResponseError(error.message, error);
}
var init_result = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/result.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_errors2();
    init_value();
    __name(stmtResultFromProto, "stmtResultFromProto");
    __name(rowsResultFromProto, "rowsResultFromProto");
    __name(rowResultFromProto, "rowResultFromProto");
    __name(valueResultFromProto, "valueResultFromProto");
    __name(rowFromProto, "rowFromProto");
    __name(errorFromProto, "errorFromProto");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/sql.js
function sqlToProto(owner, sql) {
  if (sql instanceof Sql) {
    return { sqlId: sql._getSqlId(owner) };
  } else {
    return { sql: "" + sql };
  }
}
var Sql;
var init_sql = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/sql.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_errors2();
    Sql = class {
      static {
        __name(this, "Sql");
      }
      #owner;
      #sqlId;
      #closed;
      /** @private */
      constructor(owner, sqlId) {
        this.#owner = owner;
        this.#sqlId = sqlId;
        this.#closed = void 0;
      }
      /** @private */
      _getSqlId(owner) {
        if (this.#owner !== owner) {
          throw new MisuseError("Attempted to use SQL text opened with other object");
        } else if (this.#closed !== void 0) {
          throw new ClosedError("SQL text is closed", this.#closed);
        }
        return this.#sqlId;
      }
      /** Remove the SQL text from the server, releasing resouces. */
      close() {
        this._setClosed(new ClientError("SQL text was manually closed"));
      }
      /** @private */
      _setClosed(error) {
        if (this.#closed === void 0) {
          this.#closed = error;
          this.#owner._closeSql(this.#sqlId);
        }
      }
      /** True if the SQL text is closed (removed from the server). */
      get closed() {
        return this.#closed !== void 0;
      }
    };
    __name(sqlToProto, "sqlToProto");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/queue.js
var Queue;
var init_queue = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/queue.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    Queue = class {
      static {
        __name(this, "Queue");
      }
      #pushStack;
      #shiftStack;
      constructor() {
        this.#pushStack = [];
        this.#shiftStack = [];
      }
      get length() {
        return this.#pushStack.length + this.#shiftStack.length;
      }
      push(elem) {
        this.#pushStack.push(elem);
      }
      shift() {
        if (this.#shiftStack.length === 0 && this.#pushStack.length > 0) {
          this.#shiftStack = this.#pushStack.reverse();
          this.#pushStack = [];
        }
        return this.#shiftStack.pop();
      }
      first() {
        return this.#shiftStack.length !== 0 ? this.#shiftStack[this.#shiftStack.length - 1] : this.#pushStack[0];
      }
    };
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/stmt.js
function stmtToProto(sqlOwner, stmt, wantRows) {
  let inSql;
  let args = [];
  let namedArgs = [];
  if (stmt instanceof Stmt) {
    inSql = stmt.sql;
    args = stmt._args;
    for (const [name, value] of stmt._namedArgs.entries()) {
      namedArgs.push({ name, value });
    }
  } else if (Array.isArray(stmt)) {
    inSql = stmt[0];
    if (Array.isArray(stmt[1])) {
      args = stmt[1].map((arg) => valueToProto(arg));
    } else {
      namedArgs = Object.entries(stmt[1]).map(([name, value]) => {
        return { name, value: valueToProto(value) };
      });
    }
  } else {
    inSql = stmt;
  }
  const { sql, sqlId } = sqlToProto(sqlOwner, inSql);
  return { sql, sqlId, args, namedArgs, wantRows };
}
var Stmt;
var init_stmt = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/stmt.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_sql();
    init_value();
    Stmt = class {
      static {
        __name(this, "Stmt");
      }
      /** The SQL statement text. */
      sql;
      /** @private */
      _args;
      /** @private */
      _namedArgs;
      /** Initialize the statement with given SQL text. */
      constructor(sql) {
        this.sql = sql;
        this._args = [];
        this._namedArgs = /* @__PURE__ */ new Map();
      }
      /** Binds positional parameters from the given `values`. All previous positional bindings are cleared. */
      bindIndexes(values) {
        this._args.length = 0;
        for (const value of values) {
          this._args.push(valueToProto(value));
        }
        return this;
      }
      /** Binds a parameter by a 1-based index. */
      bindIndex(index, value) {
        if (index !== (index | 0) || index <= 0) {
          throw new RangeError("Index of a positional argument must be positive integer");
        }
        while (this._args.length < index) {
          this._args.push(null);
        }
        this._args[index - 1] = valueToProto(value);
        return this;
      }
      /** Binds a parameter by name. */
      bindName(name, value) {
        this._namedArgs.set(name, valueToProto(value));
        return this;
      }
      /** Clears all bindings. */
      unbindAll() {
        this._args.length = 0;
        this._namedArgs.clear();
        return this;
      }
    };
    __name(stmtToProto, "stmtToProto");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/batch.js
function executeRegular(stream, steps, batch) {
  return stream._batch(batch).then((result) => {
    for (let step = 0; step < steps.length; ++step) {
      const stepResult = result.stepResults.get(step);
      const stepError = result.stepErrors.get(step);
      steps[step].callback(stepResult, stepError);
    }
  });
}
async function executeCursor(stream, steps, batch) {
  const cursor = await stream._openCursor(batch);
  try {
    let nextStep = 0;
    let beginEntry = void 0;
    let rows = [];
    for (; ; ) {
      const entry = await cursor.next();
      if (entry === void 0) {
        break;
      }
      if (entry.type === "step_begin") {
        if (entry.step < nextStep || entry.step >= steps.length) {
          throw new ProtoError("Server produced StepBeginEntry for unexpected step");
        } else if (beginEntry !== void 0) {
          throw new ProtoError("Server produced StepBeginEntry before terminating previous step");
        }
        for (let step = nextStep; step < entry.step; ++step) {
          steps[step].callback(void 0, void 0);
        }
        nextStep = entry.step + 1;
        beginEntry = entry;
        rows = [];
      } else if (entry.type === "step_end") {
        if (beginEntry === void 0) {
          throw new ProtoError("Server produced StepEndEntry but no step is active");
        }
        const stmtResult = {
          cols: beginEntry.cols,
          rows,
          affectedRowCount: entry.affectedRowCount,
          lastInsertRowid: entry.lastInsertRowid
        };
        steps[beginEntry.step].callback(stmtResult, void 0);
        beginEntry = void 0;
        rows = [];
      } else if (entry.type === "step_error") {
        if (beginEntry === void 0) {
          if (entry.step >= steps.length) {
            throw new ProtoError("Server produced StepErrorEntry for unexpected step");
          }
          for (let step = nextStep; step < entry.step; ++step) {
            steps[step].callback(void 0, void 0);
          }
        } else {
          if (entry.step !== beginEntry.step) {
            throw new ProtoError("Server produced StepErrorEntry for unexpected step");
          }
          beginEntry = void 0;
          rows = [];
        }
        steps[entry.step].callback(void 0, entry.error);
        nextStep = entry.step + 1;
      } else if (entry.type === "row") {
        if (beginEntry === void 0) {
          throw new ProtoError("Server produced RowEntry but no step is active");
        }
        rows.push(entry.row);
      } else if (entry.type === "error") {
        throw errorFromProto(entry.error);
      } else if (entry.type === "none") {
        throw new ProtoError("Server produced unrecognized CursorEntry");
      } else {
        throw impossible(entry, "Impossible CursorEntry");
      }
    }
    if (beginEntry !== void 0) {
      throw new ProtoError("Server closed Cursor before terminating active step");
    }
    for (let step = nextStep; step < steps.length; ++step) {
      steps[step].callback(void 0, void 0);
    }
  } finally {
    cursor.close();
  }
}
function stepIndex(step) {
  if (step._index === void 0) {
    throw new MisuseError("Cannot add a condition referencing a step that has not been added to the batch");
  }
  return step._index;
}
function checkCondBatch(expectedBatch, cond) {
  if (cond._batch !== expectedBatch) {
    throw new MisuseError("Cannot mix BatchCond objects for different Batch objects");
  }
}
var Batch, BatchStep, BatchCond;
var init_batch = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/batch.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_errors2();
    init_result();
    init_stmt();
    init_util3();
    Batch = class {
      static {
        __name(this, "Batch");
      }
      /** @private */
      _stream;
      #useCursor;
      /** @private */
      _steps;
      #executed;
      /** @private */
      constructor(stream, useCursor) {
        this._stream = stream;
        this.#useCursor = useCursor;
        this._steps = [];
        this.#executed = false;
      }
      /** Return a builder for adding a step to the batch. */
      step() {
        return new BatchStep(this);
      }
      /** Execute the batch. */
      execute() {
        if (this.#executed) {
          throw new MisuseError("This batch has already been executed");
        }
        this.#executed = true;
        const batch = {
          steps: this._steps.map((step) => step.proto)
        };
        if (this.#useCursor) {
          return executeCursor(this._stream, this._steps, batch);
        } else {
          return executeRegular(this._stream, this._steps, batch);
        }
      }
    };
    __name(executeRegular, "executeRegular");
    __name(executeCursor, "executeCursor");
    BatchStep = class {
      static {
        __name(this, "BatchStep");
      }
      /** @private */
      _batch;
      #conds;
      /** @private */
      _index;
      /** @private */
      constructor(batch) {
        this._batch = batch;
        this.#conds = [];
        this._index = void 0;
      }
      /** Add the condition that needs to be satisfied to execute the statement. If you use this method multiple
       * times, we join the conditions with a logical AND. */
      condition(cond) {
        this.#conds.push(cond._proto);
        return this;
      }
      /** Add a statement that returns rows. */
      query(stmt) {
        return this.#add(stmt, true, rowsResultFromProto);
      }
      /** Add a statement that returns at most a single row. */
      queryRow(stmt) {
        return this.#add(stmt, true, rowResultFromProto);
      }
      /** Add a statement that returns at most a single value. */
      queryValue(stmt) {
        return this.#add(stmt, true, valueResultFromProto);
      }
      /** Add a statement without returning rows. */
      run(stmt) {
        return this.#add(stmt, false, stmtResultFromProto);
      }
      #add(inStmt, wantRows, fromProto) {
        if (this._index !== void 0) {
          throw new MisuseError("This BatchStep has already been added to the batch");
        }
        const stmt = stmtToProto(this._batch._stream._sqlOwner(), inStmt, wantRows);
        let condition;
        if (this.#conds.length === 0) {
          condition = void 0;
        } else if (this.#conds.length === 1) {
          condition = this.#conds[0];
        } else {
          condition = { type: "and", conds: this.#conds.slice() };
        }
        const proto = { stmt, condition };
        return new Promise((outputCallback, errorCallback) => {
          const callback = /* @__PURE__ */ __name((stepResult, stepError) => {
            if (stepResult !== void 0 && stepError !== void 0) {
              errorCallback(new ProtoError("Server returned both result and error"));
            } else if (stepError !== void 0) {
              errorCallback(errorFromProto(stepError));
            } else if (stepResult !== void 0) {
              outputCallback(fromProto(stepResult, this._batch._stream.intMode));
            } else {
              outputCallback(void 0);
            }
          }, "callback");
          this._index = this._batch._steps.length;
          this._batch._steps.push({ proto, callback });
        });
      }
    };
    BatchCond = class _BatchCond {
      static {
        __name(this, "BatchCond");
      }
      /** @private */
      _batch;
      /** @private */
      _proto;
      /** @private */
      constructor(batch, proto) {
        this._batch = batch;
        this._proto = proto;
      }
      /** Create a condition that evaluates to true when the given step executes successfully.
       *
       * If the given step fails error or is skipped because its condition evaluated to false, this
       * condition evaluates to false.
       */
      static ok(step) {
        return new _BatchCond(step._batch, { type: "ok", step: stepIndex(step) });
      }
      /** Create a condition that evaluates to true when the given step fails.
       *
       * If the given step succeeds or is skipped because its condition evaluated to false, this condition
       * evaluates to false.
       */
      static error(step) {
        return new _BatchCond(step._batch, { type: "error", step: stepIndex(step) });
      }
      /** Create a condition that is a logical negation of another condition.
       */
      static not(cond) {
        return new _BatchCond(cond._batch, { type: "not", cond: cond._proto });
      }
      /** Create a condition that is a logical AND of other conditions.
       */
      static and(batch, conds) {
        for (const cond of conds) {
          checkCondBatch(batch, cond);
        }
        return new _BatchCond(batch, { type: "and", conds: conds.map((e) => e._proto) });
      }
      /** Create a condition that is a logical OR of other conditions.
       */
      static or(batch, conds) {
        for (const cond of conds) {
          checkCondBatch(batch, cond);
        }
        return new _BatchCond(batch, { type: "or", conds: conds.map((e) => e._proto) });
      }
      /** Create a condition that evaluates to true when the SQL connection is in autocommit mode (not inside an
       * explicit transaction). This requires protocol version 3 or higher.
       */
      static isAutocommit(batch) {
        batch._stream.client()._ensureVersion(3, "BatchCond.isAutocommit()");
        return new _BatchCond(batch, { type: "is_autocommit" });
      }
    };
    __name(stepIndex, "stepIndex");
    __name(checkCondBatch, "checkCondBatch");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/describe.js
function describeResultFromProto(result) {
  return {
    paramNames: result.params.map((p) => p.name),
    columns: result.cols,
    isExplain: result.isExplain,
    isReadonly: result.isReadonly
  };
}
var init_describe = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/describe.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    __name(describeResultFromProto, "describeResultFromProto");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/stream.js
var Stream;
var init_stream = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/stream.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_batch();
    init_describe();
    init_result();
    init_sql();
    init_stmt();
    Stream = class {
      static {
        __name(this, "Stream");
      }
      /** @private */
      constructor(intMode) {
        this.intMode = intMode;
      }
      /** Execute a statement and return rows. */
      query(stmt) {
        return this.#execute(stmt, true, rowsResultFromProto);
      }
      /** Execute a statement and return at most a single row. */
      queryRow(stmt) {
        return this.#execute(stmt, true, rowResultFromProto);
      }
      /** Execute a statement and return at most a single value. */
      queryValue(stmt) {
        return this.#execute(stmt, true, valueResultFromProto);
      }
      /** Execute a statement without returning rows. */
      run(stmt) {
        return this.#execute(stmt, false, stmtResultFromProto);
      }
      #execute(inStmt, wantRows, fromProto) {
        const stmt = stmtToProto(this._sqlOwner(), inStmt, wantRows);
        return this._execute(stmt).then((r) => fromProto(r, this.intMode));
      }
      /** Return a builder for creating and executing a batch.
       *
       * If `useCursor` is true, the batch will be executed using a Hrana cursor, which will stream results from
       * the server to the client, which consumes less memory on the server. This requires protocol version 3 or
       * higher.
       */
      batch(useCursor = false) {
        return new Batch(this, useCursor);
      }
      /** Parse and analyze a statement. This requires protocol version 2 or higher. */
      describe(inSql) {
        const protoSql = sqlToProto(this._sqlOwner(), inSql);
        return this._describe(protoSql).then(describeResultFromProto);
      }
      /** Execute a sequence of statements separated by semicolons. This requires protocol version 2 or higher.
       * */
      sequence(inSql) {
        const protoSql = sqlToProto(this._sqlOwner(), inSql);
        return this._sequence(protoSql);
      }
      /** Representation of integers returned from the database. See {@link IntMode}.
       *
       * This value affects the results of all operations on this stream.
       */
      intMode;
    };
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/cursor.js
var Cursor;
var init_cursor = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/cursor.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    Cursor = class {
      static {
        __name(this, "Cursor");
      }
    };
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/ws/cursor.js
var fetchChunkSize, fetchQueueSize, WsCursor;
var init_cursor2 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/ws/cursor.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_errors2();
    init_cursor();
    init_queue();
    fetchChunkSize = 1e3;
    fetchQueueSize = 10;
    WsCursor = class extends Cursor {
      static {
        __name(this, "WsCursor");
      }
      #client;
      #stream;
      #cursorId;
      #entryQueue;
      #fetchQueue;
      #closed;
      #done;
      /** @private */
      constructor(client, stream, cursorId) {
        super();
        this.#client = client;
        this.#stream = stream;
        this.#cursorId = cursorId;
        this.#entryQueue = new Queue();
        this.#fetchQueue = new Queue();
        this.#closed = void 0;
        this.#done = false;
      }
      /** Fetch the next entry from the cursor. */
      async next() {
        for (; ; ) {
          if (this.#closed !== void 0) {
            throw new ClosedError("Cursor is closed", this.#closed);
          }
          while (!this.#done && this.#fetchQueue.length < fetchQueueSize) {
            this.#fetchQueue.push(this.#fetch());
          }
          const entry = this.#entryQueue.shift();
          if (this.#done || entry !== void 0) {
            return entry;
          }
          await this.#fetchQueue.shift().then((response) => {
            if (response === void 0) {
              return;
            }
            for (const entry2 of response.entries) {
              this.#entryQueue.push(entry2);
            }
            this.#done ||= response.done;
          });
        }
      }
      #fetch() {
        return this.#stream._sendCursorRequest(this, {
          type: "fetch_cursor",
          cursorId: this.#cursorId,
          maxCount: fetchChunkSize
        }).then((resp) => resp, (error) => {
          this._setClosed(error);
          return void 0;
        });
      }
      /** @private */
      _setClosed(error) {
        if (this.#closed !== void 0) {
          return;
        }
        this.#closed = error;
        this.#stream._sendCursorRequest(this, {
          type: "close_cursor",
          cursorId: this.#cursorId
        }).catch(() => void 0);
        this.#stream._cursorClosed(this);
      }
      /** Close the cursor. */
      close() {
        this._setClosed(new ClientError("Cursor was manually closed"));
      }
      /** True if the cursor is closed. */
      get closed() {
        return this.#closed !== void 0;
      }
    };
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/ws/stream.js
var WsStream;
var init_stream2 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/ws/stream.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_errors2();
    init_queue();
    init_stream();
    init_cursor2();
    WsStream = class _WsStream extends Stream {
      static {
        __name(this, "WsStream");
      }
      #client;
      #streamId;
      #queue;
      #cursor;
      #closing;
      #closed;
      /** @private */
      static open(client) {
        const streamId = client._streamIdAlloc.alloc();
        const stream = new _WsStream(client, streamId);
        const responseCallback = /* @__PURE__ */ __name(() => void 0, "responseCallback");
        const errorCallback = /* @__PURE__ */ __name((e) => stream.#setClosed(e), "errorCallback");
        const request = { type: "open_stream", streamId };
        client._sendRequest(request, { responseCallback, errorCallback });
        return stream;
      }
      /** @private */
      constructor(client, streamId) {
        super(client.intMode);
        this.#client = client;
        this.#streamId = streamId;
        this.#queue = new Queue();
        this.#cursor = void 0;
        this.#closing = false;
        this.#closed = void 0;
      }
      /** Get the {@link WsClient} object that this stream belongs to. */
      client() {
        return this.#client;
      }
      /** @private */
      _sqlOwner() {
        return this.#client;
      }
      /** @private */
      _execute(stmt) {
        return this.#sendStreamRequest({
          type: "execute",
          streamId: this.#streamId,
          stmt
        }).then((response) => {
          return response.result;
        });
      }
      /** @private */
      _batch(batch) {
        return this.#sendStreamRequest({
          type: "batch",
          streamId: this.#streamId,
          batch
        }).then((response) => {
          return response.result;
        });
      }
      /** @private */
      _describe(protoSql) {
        this.#client._ensureVersion(2, "describe()");
        return this.#sendStreamRequest({
          type: "describe",
          streamId: this.#streamId,
          sql: protoSql.sql,
          sqlId: protoSql.sqlId
        }).then((response) => {
          return response.result;
        });
      }
      /** @private */
      _sequence(protoSql) {
        this.#client._ensureVersion(2, "sequence()");
        return this.#sendStreamRequest({
          type: "sequence",
          streamId: this.#streamId,
          sql: protoSql.sql,
          sqlId: protoSql.sqlId
        }).then((_response) => {
          return void 0;
        });
      }
      /** Check whether the SQL connection underlying this stream is in autocommit state (i.e., outside of an
       * explicit transaction). This requires protocol version 3 or higher.
       */
      getAutocommit() {
        this.#client._ensureVersion(3, "getAutocommit()");
        return this.#sendStreamRequest({
          type: "get_autocommit",
          streamId: this.#streamId
        }).then((response) => {
          return response.isAutocommit;
        });
      }
      #sendStreamRequest(request) {
        return new Promise((responseCallback, errorCallback) => {
          this.#pushToQueue({ type: "request", request, responseCallback, errorCallback });
        });
      }
      /** @private */
      _openCursor(batch) {
        this.#client._ensureVersion(3, "cursor");
        return new Promise((cursorCallback, errorCallback) => {
          this.#pushToQueue({ type: "cursor", batch, cursorCallback, errorCallback });
        });
      }
      /** @private */
      _sendCursorRequest(cursor, request) {
        if (cursor !== this.#cursor) {
          throw new InternalError("Cursor not associated with the stream attempted to execute a request");
        }
        return new Promise((responseCallback, errorCallback) => {
          if (this.#closed !== void 0) {
            errorCallback(new ClosedError("Stream is closed", this.#closed));
          } else {
            this.#client._sendRequest(request, { responseCallback, errorCallback });
          }
        });
      }
      /** @private */
      _cursorClosed(cursor) {
        if (cursor !== this.#cursor) {
          throw new InternalError("Cursor was closed, but it was not associated with the stream");
        }
        this.#cursor = void 0;
        this.#flushQueue();
      }
      #pushToQueue(entry) {
        if (this.#closed !== void 0) {
          entry.errorCallback(new ClosedError("Stream is closed", this.#closed));
        } else if (this.#closing) {
          entry.errorCallback(new ClosedError("Stream is closing", void 0));
        } else {
          this.#queue.push(entry);
          this.#flushQueue();
        }
      }
      #flushQueue() {
        for (; ; ) {
          const entry = this.#queue.first();
          if (entry === void 0 && this.#cursor === void 0 && this.#closing) {
            this.#setClosed(new ClientError("Stream was gracefully closed"));
            break;
          } else if (entry?.type === "request" && this.#cursor === void 0) {
            const { request, responseCallback, errorCallback } = entry;
            this.#queue.shift();
            this.#client._sendRequest(request, { responseCallback, errorCallback });
          } else if (entry?.type === "cursor" && this.#cursor === void 0) {
            const { batch, cursorCallback } = entry;
            this.#queue.shift();
            const cursorId = this.#client._cursorIdAlloc.alloc();
            const cursor = new WsCursor(this.#client, this, cursorId);
            const request = {
              type: "open_cursor",
              streamId: this.#streamId,
              cursorId,
              batch
            };
            const responseCallback = /* @__PURE__ */ __name(() => void 0, "responseCallback");
            const errorCallback = /* @__PURE__ */ __name((e) => cursor._setClosed(e), "errorCallback");
            this.#client._sendRequest(request, { responseCallback, errorCallback });
            this.#cursor = cursor;
            cursorCallback(cursor);
          } else {
            break;
          }
        }
      }
      #setClosed(error) {
        if (this.#closed !== void 0) {
          return;
        }
        this.#closed = error;
        if (this.#cursor !== void 0) {
          this.#cursor._setClosed(error);
        }
        for (; ; ) {
          const entry = this.#queue.shift();
          if (entry !== void 0) {
            entry.errorCallback(error);
          } else {
            break;
          }
        }
        const request = { type: "close_stream", streamId: this.#streamId };
        const responseCallback = /* @__PURE__ */ __name(() => this.#client._streamIdAlloc.free(this.#streamId), "responseCallback");
        const errorCallback = /* @__PURE__ */ __name(() => void 0, "errorCallback");
        this.#client._sendRequest(request, { responseCallback, errorCallback });
      }
      /** Immediately close the stream. */
      close() {
        this.#setClosed(new ClientError("Stream was manually closed"));
      }
      /** Gracefully close the stream. */
      closeGracefully() {
        this.#closing = true;
        this.#flushQueue();
      }
      /** True if the stream is closed or closing. */
      get closed() {
        return this.#closed !== void 0 || this.#closing;
      }
    };
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/shared/json_encode.js
function Stmt2(w, msg) {
  if (msg.sql !== void 0) {
    w.string("sql", msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.number("sql_id", msg.sqlId);
  }
  w.arrayObjects("args", msg.args, Value);
  w.arrayObjects("named_args", msg.namedArgs, NamedArg);
  w.boolean("want_rows", msg.wantRows);
}
function NamedArg(w, msg) {
  w.string("name", msg.name);
  w.object("value", msg.value, Value);
}
function Batch2(w, msg) {
  w.arrayObjects("steps", msg.steps, BatchStep2);
}
function BatchStep2(w, msg) {
  if (msg.condition !== void 0) {
    w.object("condition", msg.condition, BatchCond2);
  }
  w.object("stmt", msg.stmt, Stmt2);
}
function BatchCond2(w, msg) {
  w.stringRaw("type", msg.type);
  if (msg.type === "ok" || msg.type === "error") {
    w.number("step", msg.step);
  } else if (msg.type === "not") {
    w.object("cond", msg.cond, BatchCond2);
  } else if (msg.type === "and" || msg.type === "or") {
    w.arrayObjects("conds", msg.conds, BatchCond2);
  } else if (msg.type === "is_autocommit") {
  } else {
    throw impossible(msg, "Impossible type of BatchCond");
  }
}
function Value(w, msg) {
  if (msg === null) {
    w.stringRaw("type", "null");
  } else if (typeof msg === "bigint") {
    w.stringRaw("type", "integer");
    w.stringRaw("value", "" + msg);
  } else if (typeof msg === "number") {
    w.stringRaw("type", "float");
    w.number("value", msg);
  } else if (typeof msg === "string") {
    w.stringRaw("type", "text");
    w.string("value", msg);
  } else if (msg instanceof Uint8Array) {
    w.stringRaw("type", "blob");
    w.stringRaw("base64", gBase64.fromUint8Array(msg));
  } else if (msg === void 0) {
  } else {
    throw impossible(msg, "Impossible type of Value");
  }
}
var init_json_encode = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/shared/json_encode.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_base64();
    init_util3();
    __name(Stmt2, "Stmt");
    __name(NamedArg, "NamedArg");
    __name(Batch2, "Batch");
    __name(BatchStep2, "BatchStep");
    __name(BatchCond2, "BatchCond");
    __name(Value, "Value");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/ws/json_encode.js
function ClientMsg(w, msg) {
  w.stringRaw("type", msg.type);
  if (msg.type === "hello") {
    if (msg.jwt !== void 0) {
      w.string("jwt", msg.jwt);
    }
  } else if (msg.type === "request") {
    w.number("request_id", msg.requestId);
    w.object("request", msg.request, Request2);
  } else {
    throw impossible(msg, "Impossible type of ClientMsg");
  }
}
function Request2(w, msg) {
  w.stringRaw("type", msg.type);
  if (msg.type === "open_stream") {
    w.number("stream_id", msg.streamId);
  } else if (msg.type === "close_stream") {
    w.number("stream_id", msg.streamId);
  } else if (msg.type === "execute") {
    w.number("stream_id", msg.streamId);
    w.object("stmt", msg.stmt, Stmt2);
  } else if (msg.type === "batch") {
    w.number("stream_id", msg.streamId);
    w.object("batch", msg.batch, Batch2);
  } else if (msg.type === "open_cursor") {
    w.number("stream_id", msg.streamId);
    w.number("cursor_id", msg.cursorId);
    w.object("batch", msg.batch, Batch2);
  } else if (msg.type === "close_cursor") {
    w.number("cursor_id", msg.cursorId);
  } else if (msg.type === "fetch_cursor") {
    w.number("cursor_id", msg.cursorId);
    w.number("max_count", msg.maxCount);
  } else if (msg.type === "sequence") {
    w.number("stream_id", msg.streamId);
    if (msg.sql !== void 0) {
      w.string("sql", msg.sql);
    }
    if (msg.sqlId !== void 0) {
      w.number("sql_id", msg.sqlId);
    }
  } else if (msg.type === "describe") {
    w.number("stream_id", msg.streamId);
    if (msg.sql !== void 0) {
      w.string("sql", msg.sql);
    }
    if (msg.sqlId !== void 0) {
      w.number("sql_id", msg.sqlId);
    }
  } else if (msg.type === "store_sql") {
    w.number("sql_id", msg.sqlId);
    w.string("sql", msg.sql);
  } else if (msg.type === "close_sql") {
    w.number("sql_id", msg.sqlId);
  } else if (msg.type === "get_autocommit") {
    w.number("stream_id", msg.streamId);
  } else {
    throw impossible(msg, "Impossible type of Request");
  }
}
var init_json_encode2 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/ws/json_encode.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_json_encode();
    init_util3();
    __name(ClientMsg, "ClientMsg");
    __name(Request2, "Request");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/shared/protobuf_encode.js
function Stmt3(w, msg) {
  if (msg.sql !== void 0) {
    w.string(1, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(2, msg.sqlId);
  }
  for (const arg of msg.args) {
    w.message(3, arg, Value2);
  }
  for (const arg of msg.namedArgs) {
    w.message(4, arg, NamedArg2);
  }
  w.bool(5, msg.wantRows);
}
function NamedArg2(w, msg) {
  w.string(1, msg.name);
  w.message(2, msg.value, Value2);
}
function Batch3(w, msg) {
  for (const step of msg.steps) {
    w.message(1, step, BatchStep3);
  }
}
function BatchStep3(w, msg) {
  if (msg.condition !== void 0) {
    w.message(1, msg.condition, BatchCond3);
  }
  w.message(2, msg.stmt, Stmt3);
}
function BatchCond3(w, msg) {
  if (msg.type === "ok") {
    w.uint32(1, msg.step);
  } else if (msg.type === "error") {
    w.uint32(2, msg.step);
  } else if (msg.type === "not") {
    w.message(3, msg.cond, BatchCond3);
  } else if (msg.type === "and") {
    w.message(4, msg.conds, BatchCondList);
  } else if (msg.type === "or") {
    w.message(5, msg.conds, BatchCondList);
  } else if (msg.type === "is_autocommit") {
    w.message(6, void 0, Empty);
  } else {
    throw impossible(msg, "Impossible type of BatchCond");
  }
}
function BatchCondList(w, msg) {
  for (const cond of msg) {
    w.message(1, cond, BatchCond3);
  }
}
function Value2(w, msg) {
  if (msg === null) {
    w.message(1, void 0, Empty);
  } else if (typeof msg === "bigint") {
    w.sint64(2, msg);
  } else if (typeof msg === "number") {
    w.double(3, msg);
  } else if (typeof msg === "string") {
    w.string(4, msg);
  } else if (msg instanceof Uint8Array) {
    w.bytes(5, msg);
  } else if (msg === void 0) {
  } else {
    throw impossible(msg, "Impossible type of Value");
  }
}
function Empty(_w, _msg) {
}
var init_protobuf_encode = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/shared/protobuf_encode.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_util3();
    __name(Stmt3, "Stmt");
    __name(NamedArg2, "NamedArg");
    __name(Batch3, "Batch");
    __name(BatchStep3, "BatchStep");
    __name(BatchCond3, "BatchCond");
    __name(BatchCondList, "BatchCondList");
    __name(Value2, "Value");
    __name(Empty, "Empty");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/ws/protobuf_encode.js
function ClientMsg2(w, msg) {
  if (msg.type === "hello") {
    w.message(1, msg, HelloMsg);
  } else if (msg.type === "request") {
    w.message(2, msg, RequestMsg);
  } else {
    throw impossible(msg, "Impossible type of ClientMsg");
  }
}
function HelloMsg(w, msg) {
  if (msg.jwt !== void 0) {
    w.string(1, msg.jwt);
  }
}
function RequestMsg(w, msg) {
  w.int32(1, msg.requestId);
  const request = msg.request;
  if (request.type === "open_stream") {
    w.message(2, request, OpenStreamReq);
  } else if (request.type === "close_stream") {
    w.message(3, request, CloseStreamReq);
  } else if (request.type === "execute") {
    w.message(4, request, ExecuteReq);
  } else if (request.type === "batch") {
    w.message(5, request, BatchReq);
  } else if (request.type === "open_cursor") {
    w.message(6, request, OpenCursorReq);
  } else if (request.type === "close_cursor") {
    w.message(7, request, CloseCursorReq);
  } else if (request.type === "fetch_cursor") {
    w.message(8, request, FetchCursorReq);
  } else if (request.type === "sequence") {
    w.message(9, request, SequenceReq);
  } else if (request.type === "describe") {
    w.message(10, request, DescribeReq);
  } else if (request.type === "store_sql") {
    w.message(11, request, StoreSqlReq);
  } else if (request.type === "close_sql") {
    w.message(12, request, CloseSqlReq);
  } else if (request.type === "get_autocommit") {
    w.message(13, request, GetAutocommitReq);
  } else {
    throw impossible(request, "Impossible type of Request");
  }
}
function OpenStreamReq(w, msg) {
  w.int32(1, msg.streamId);
}
function CloseStreamReq(w, msg) {
  w.int32(1, msg.streamId);
}
function ExecuteReq(w, msg) {
  w.int32(1, msg.streamId);
  w.message(2, msg.stmt, Stmt3);
}
function BatchReq(w, msg) {
  w.int32(1, msg.streamId);
  w.message(2, msg.batch, Batch3);
}
function OpenCursorReq(w, msg) {
  w.int32(1, msg.streamId);
  w.int32(2, msg.cursorId);
  w.message(3, msg.batch, Batch3);
}
function CloseCursorReq(w, msg) {
  w.int32(1, msg.cursorId);
}
function FetchCursorReq(w, msg) {
  w.int32(1, msg.cursorId);
  w.uint32(2, msg.maxCount);
}
function SequenceReq(w, msg) {
  w.int32(1, msg.streamId);
  if (msg.sql !== void 0) {
    w.string(2, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(3, msg.sqlId);
  }
}
function DescribeReq(w, msg) {
  w.int32(1, msg.streamId);
  if (msg.sql !== void 0) {
    w.string(2, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(3, msg.sqlId);
  }
}
function StoreSqlReq(w, msg) {
  w.int32(1, msg.sqlId);
  w.string(2, msg.sql);
}
function CloseSqlReq(w, msg) {
  w.int32(1, msg.sqlId);
}
function GetAutocommitReq(w, msg) {
  w.int32(1, msg.streamId);
}
var init_protobuf_encode2 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/ws/protobuf_encode.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_protobuf_encode();
    init_util3();
    __name(ClientMsg2, "ClientMsg");
    __name(HelloMsg, "HelloMsg");
    __name(RequestMsg, "RequestMsg");
    __name(OpenStreamReq, "OpenStreamReq");
    __name(CloseStreamReq, "CloseStreamReq");
    __name(ExecuteReq, "ExecuteReq");
    __name(BatchReq, "BatchReq");
    __name(OpenCursorReq, "OpenCursorReq");
    __name(CloseCursorReq, "CloseCursorReq");
    __name(FetchCursorReq, "FetchCursorReq");
    __name(SequenceReq, "SequenceReq");
    __name(DescribeReq, "DescribeReq");
    __name(StoreSqlReq, "StoreSqlReq");
    __name(CloseSqlReq, "CloseSqlReq");
    __name(GetAutocommitReq, "GetAutocommitReq");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/shared/json_decode.js
function Error2(obj) {
  const message2 = string(obj["message"]);
  const code = stringOpt(obj["code"]);
  return { message: message2, code };
}
function StmtResult(obj) {
  const cols = arrayObjectsMap(obj["cols"], Col);
  const rows = array(obj["rows"]).map((rowObj) => arrayObjectsMap(rowObj, Value3));
  const affectedRowCount = number(obj["affected_row_count"]);
  const lastInsertRowidStr = stringOpt(obj["last_insert_rowid"]);
  const lastInsertRowid = lastInsertRowidStr !== void 0 ? BigInt(lastInsertRowidStr) : void 0;
  return { cols, rows, affectedRowCount, lastInsertRowid };
}
function Col(obj) {
  const name = stringOpt(obj["name"]);
  const decltype = stringOpt(obj["decltype"]);
  return { name, decltype };
}
function BatchResult(obj) {
  const stepResults = /* @__PURE__ */ new Map();
  array(obj["step_results"]).forEach((value, i) => {
    if (value !== null) {
      stepResults.set(i, StmtResult(object(value)));
    }
  });
  const stepErrors = /* @__PURE__ */ new Map();
  array(obj["step_errors"]).forEach((value, i) => {
    if (value !== null) {
      stepErrors.set(i, Error2(object(value)));
    }
  });
  return { stepResults, stepErrors };
}
function CursorEntry(obj) {
  const type = string(obj["type"]);
  if (type === "step_begin") {
    const step = number(obj["step"]);
    const cols = arrayObjectsMap(obj["cols"], Col);
    return { type: "step_begin", step, cols };
  } else if (type === "step_end") {
    const affectedRowCount = number(obj["affected_row_count"]);
    const lastInsertRowidStr = stringOpt(obj["last_insert_rowid"]);
    const lastInsertRowid = lastInsertRowidStr !== void 0 ? BigInt(lastInsertRowidStr) : void 0;
    return { type: "step_end", affectedRowCount, lastInsertRowid };
  } else if (type === "step_error") {
    const step = number(obj["step"]);
    const error = Error2(object(obj["error"]));
    return { type: "step_error", step, error };
  } else if (type === "row") {
    const row = arrayObjectsMap(obj["row"], Value3);
    return { type: "row", row };
  } else if (type === "error") {
    const error = Error2(object(obj["error"]));
    return { type: "error", error };
  } else {
    throw new ProtoError("Unexpected type of CursorEntry");
  }
}
function DescribeResult(obj) {
  const params = arrayObjectsMap(obj["params"], DescribeParam);
  const cols = arrayObjectsMap(obj["cols"], DescribeCol);
  const isExplain = boolean(obj["is_explain"]);
  const isReadonly = boolean(obj["is_readonly"]);
  return { params, cols, isExplain, isReadonly };
}
function DescribeParam(obj) {
  const name = stringOpt(obj["name"]);
  return { name };
}
function DescribeCol(obj) {
  const name = string(obj["name"]);
  const decltype = stringOpt(obj["decltype"]);
  return { name, decltype };
}
function Value3(obj) {
  const type = string(obj["type"]);
  if (type === "null") {
    return null;
  } else if (type === "integer") {
    const value = string(obj["value"]);
    return BigInt(value);
  } else if (type === "float") {
    return number(obj["value"]);
  } else if (type === "text") {
    return string(obj["value"]);
  } else if (type === "blob") {
    return gBase64.toUint8Array(string(obj["base64"]));
  } else {
    throw new ProtoError("Unexpected type of Value");
  }
}
var init_json_decode = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/shared/json_decode.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_base64();
    init_errors2();
    init_decode();
    __name(Error2, "Error");
    __name(StmtResult, "StmtResult");
    __name(Col, "Col");
    __name(BatchResult, "BatchResult");
    __name(CursorEntry, "CursorEntry");
    __name(DescribeResult, "DescribeResult");
    __name(DescribeParam, "DescribeParam");
    __name(DescribeCol, "DescribeCol");
    __name(Value3, "Value");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/ws/json_decode.js
function ServerMsg(obj) {
  const type = string(obj["type"]);
  if (type === "hello_ok") {
    return { type: "hello_ok" };
  } else if (type === "hello_error") {
    const error = Error2(object(obj["error"]));
    return { type: "hello_error", error };
  } else if (type === "response_ok") {
    const requestId = number(obj["request_id"]);
    const response = Response2(object(obj["response"]));
    return { type: "response_ok", requestId, response };
  } else if (type === "response_error") {
    const requestId = number(obj["request_id"]);
    const error = Error2(object(obj["error"]));
    return { type: "response_error", requestId, error };
  } else {
    throw new ProtoError("Unexpected type of ServerMsg");
  }
}
function Response2(obj) {
  const type = string(obj["type"]);
  if (type === "open_stream") {
    return { type: "open_stream" };
  } else if (type === "close_stream") {
    return { type: "close_stream" };
  } else if (type === "execute") {
    const result = StmtResult(object(obj["result"]));
    return { type: "execute", result };
  } else if (type === "batch") {
    const result = BatchResult(object(obj["result"]));
    return { type: "batch", result };
  } else if (type === "open_cursor") {
    return { type: "open_cursor" };
  } else if (type === "close_cursor") {
    return { type: "close_cursor" };
  } else if (type === "fetch_cursor") {
    const entries = arrayObjectsMap(obj["entries"], CursorEntry);
    const done = boolean(obj["done"]);
    return { type: "fetch_cursor", entries, done };
  } else if (type === "sequence") {
    return { type: "sequence" };
  } else if (type === "describe") {
    const result = DescribeResult(object(obj["result"]));
    return { type: "describe", result };
  } else if (type === "store_sql") {
    return { type: "store_sql" };
  } else if (type === "close_sql") {
    return { type: "close_sql" };
  } else if (type === "get_autocommit") {
    const isAutocommit = boolean(obj["is_autocommit"]);
    return { type: "get_autocommit", isAutocommit };
  } else {
    throw new ProtoError("Unexpected type of Response");
  }
}
var init_json_decode2 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/ws/json_decode.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_errors2();
    init_decode();
    init_json_decode();
    __name(ServerMsg, "ServerMsg");
    __name(Response2, "Response");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/shared/protobuf_decode.js
var Error3, StmtResult2, Col2, Row, BatchResult2, BatchResultStepResult, BatchResultStepError, CursorEntry2, StepBeginEntry, StepEndEntry, StepErrorEntry, DescribeResult2, DescribeParam2, DescribeCol2, Value4;
var init_protobuf_decode = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/shared/protobuf_decode.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    Error3 = {
      default() {
        return { message: "", code: void 0 };
      },
      1(r, msg) {
        msg.message = r.string();
      },
      2(r, msg) {
        msg.code = r.string();
      }
    };
    StmtResult2 = {
      default() {
        return {
          cols: [],
          rows: [],
          affectedRowCount: 0,
          lastInsertRowid: void 0
        };
      },
      1(r, msg) {
        msg.cols.push(r.message(Col2));
      },
      2(r, msg) {
        msg.rows.push(r.message(Row));
      },
      3(r, msg) {
        msg.affectedRowCount = Number(r.uint64());
      },
      4(r, msg) {
        msg.lastInsertRowid = r.sint64();
      }
    };
    Col2 = {
      default() {
        return { name: void 0, decltype: void 0 };
      },
      1(r, msg) {
        msg.name = r.string();
      },
      2(r, msg) {
        msg.decltype = r.string();
      }
    };
    Row = {
      default() {
        return [];
      },
      1(r, msg) {
        msg.push(r.message(Value4));
      }
    };
    BatchResult2 = {
      default() {
        return { stepResults: /* @__PURE__ */ new Map(), stepErrors: /* @__PURE__ */ new Map() };
      },
      1(r, msg) {
        const [key, value] = r.message(BatchResultStepResult);
        msg.stepResults.set(key, value);
      },
      2(r, msg) {
        const [key, value] = r.message(BatchResultStepError);
        msg.stepErrors.set(key, value);
      }
    };
    BatchResultStepResult = {
      default() {
        return [0, StmtResult2.default()];
      },
      1(r, msg) {
        msg[0] = r.uint32();
      },
      2(r, msg) {
        msg[1] = r.message(StmtResult2);
      }
    };
    BatchResultStepError = {
      default() {
        return [0, Error3.default()];
      },
      1(r, msg) {
        msg[0] = r.uint32();
      },
      2(r, msg) {
        msg[1] = r.message(Error3);
      }
    };
    CursorEntry2 = {
      default() {
        return { type: "none" };
      },
      1(r) {
        return r.message(StepBeginEntry);
      },
      2(r) {
        return r.message(StepEndEntry);
      },
      3(r) {
        return r.message(StepErrorEntry);
      },
      4(r) {
        return { type: "row", row: r.message(Row) };
      },
      5(r) {
        return { type: "error", error: r.message(Error3) };
      }
    };
    StepBeginEntry = {
      default() {
        return { type: "step_begin", step: 0, cols: [] };
      },
      1(r, msg) {
        msg.step = r.uint32();
      },
      2(r, msg) {
        msg.cols.push(r.message(Col2));
      }
    };
    StepEndEntry = {
      default() {
        return {
          type: "step_end",
          affectedRowCount: 0,
          lastInsertRowid: void 0
        };
      },
      1(r, msg) {
        msg.affectedRowCount = r.uint32();
      },
      2(r, msg) {
        msg.lastInsertRowid = r.uint64();
      }
    };
    StepErrorEntry = {
      default() {
        return {
          type: "step_error",
          step: 0,
          error: Error3.default()
        };
      },
      1(r, msg) {
        msg.step = r.uint32();
      },
      2(r, msg) {
        msg.error = r.message(Error3);
      }
    };
    DescribeResult2 = {
      default() {
        return {
          params: [],
          cols: [],
          isExplain: false,
          isReadonly: false
        };
      },
      1(r, msg) {
        msg.params.push(r.message(DescribeParam2));
      },
      2(r, msg) {
        msg.cols.push(r.message(DescribeCol2));
      },
      3(r, msg) {
        msg.isExplain = r.bool();
      },
      4(r, msg) {
        msg.isReadonly = r.bool();
      }
    };
    DescribeParam2 = {
      default() {
        return { name: void 0 };
      },
      1(r, msg) {
        msg.name = r.string();
      }
    };
    DescribeCol2 = {
      default() {
        return { name: "", decltype: void 0 };
      },
      1(r, msg) {
        msg.name = r.string();
      },
      2(r, msg) {
        msg.decltype = r.string();
      }
    };
    Value4 = {
      default() {
        return void 0;
      },
      1(r) {
        return null;
      },
      2(r) {
        return r.sint64();
      },
      3(r) {
        return r.double();
      },
      4(r) {
        return r.string();
      },
      5(r) {
        return r.bytes();
      }
    };
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/ws/protobuf_decode.js
var ServerMsg2, HelloErrorMsg, ResponseErrorMsg, ResponseOkMsg, ExecuteResp, BatchResp, FetchCursorResp, DescribeResp, GetAutocommitResp;
var init_protobuf_decode2 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/ws/protobuf_decode.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_protobuf_decode();
    ServerMsg2 = {
      default() {
        return { type: "none" };
      },
      1(r) {
        return { type: "hello_ok" };
      },
      2(r) {
        return r.message(HelloErrorMsg);
      },
      3(r) {
        return r.message(ResponseOkMsg);
      },
      4(r) {
        return r.message(ResponseErrorMsg);
      }
    };
    HelloErrorMsg = {
      default() {
        return { type: "hello_error", error: Error3.default() };
      },
      1(r, msg) {
        msg.error = r.message(Error3);
      }
    };
    ResponseErrorMsg = {
      default() {
        return { type: "response_error", requestId: 0, error: Error3.default() };
      },
      1(r, msg) {
        msg.requestId = r.int32();
      },
      2(r, msg) {
        msg.error = r.message(Error3);
      }
    };
    ResponseOkMsg = {
      default() {
        return {
          type: "response_ok",
          requestId: 0,
          response: { type: "none" }
        };
      },
      1(r, msg) {
        msg.requestId = r.int32();
      },
      2(r, msg) {
        msg.response = { type: "open_stream" };
      },
      3(r, msg) {
        msg.response = { type: "close_stream" };
      },
      4(r, msg) {
        msg.response = r.message(ExecuteResp);
      },
      5(r, msg) {
        msg.response = r.message(BatchResp);
      },
      6(r, msg) {
        msg.response = { type: "open_cursor" };
      },
      7(r, msg) {
        msg.response = { type: "close_cursor" };
      },
      8(r, msg) {
        msg.response = r.message(FetchCursorResp);
      },
      9(r, msg) {
        msg.response = { type: "sequence" };
      },
      10(r, msg) {
        msg.response = r.message(DescribeResp);
      },
      11(r, msg) {
        msg.response = { type: "store_sql" };
      },
      12(r, msg) {
        msg.response = { type: "close_sql" };
      },
      13(r, msg) {
        msg.response = r.message(GetAutocommitResp);
      }
    };
    ExecuteResp = {
      default() {
        return { type: "execute", result: StmtResult2.default() };
      },
      1(r, msg) {
        msg.result = r.message(StmtResult2);
      }
    };
    BatchResp = {
      default() {
        return { type: "batch", result: BatchResult2.default() };
      },
      1(r, msg) {
        msg.result = r.message(BatchResult2);
      }
    };
    FetchCursorResp = {
      default() {
        return { type: "fetch_cursor", entries: [], done: false };
      },
      1(r, msg) {
        msg.entries.push(r.message(CursorEntry2));
      },
      2(r, msg) {
        msg.done = r.bool();
      }
    };
    DescribeResp = {
      default() {
        return { type: "describe", result: DescribeResult2.default() };
      },
      1(r, msg) {
        msg.result = r.message(DescribeResult2);
      }
    };
    GetAutocommitResp = {
      default() {
        return { type: "get_autocommit", isAutocommit: false };
      },
      1(r, msg) {
        msg.isAutocommit = r.bool();
      }
    };
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/ws/client.js
var subprotocolsV2, subprotocolsV3, WsClient;
var init_client2 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/ws/client.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_client();
    init_encoding();
    init_errors2();
    init_id_alloc();
    init_result();
    init_sql();
    init_util3();
    init_stream2();
    init_json_encode2();
    init_protobuf_encode2();
    init_json_decode2();
    init_protobuf_decode2();
    subprotocolsV2 = /* @__PURE__ */ new Map([
      ["hrana2", { version: 2, encoding: "json" }],
      ["hrana1", { version: 1, encoding: "json" }]
    ]);
    subprotocolsV3 = /* @__PURE__ */ new Map([
      ["hrana3-protobuf", { version: 3, encoding: "protobuf" }],
      ["hrana3", { version: 3, encoding: "json" }],
      ["hrana2", { version: 2, encoding: "json" }],
      ["hrana1", { version: 1, encoding: "json" }]
    ]);
    WsClient = class extends Client {
      static {
        __name(this, "WsClient");
      }
      #socket;
      // List of callbacks that we queue until the socket transitions from the CONNECTING to the OPEN state.
      #openCallbacks;
      // Have we already transitioned from CONNECTING to OPEN and fired the callbacks in #openCallbacks?
      #opened;
      // Stores the error that caused us to close the client (and the socket). If we are not closed, this is
      // `undefined`.
      #closed;
      // Have we received a response to our "hello" from the server?
      #recvdHello;
      // Subprotocol negotiated with the server. It is only available after the socket transitions to the OPEN
      // state.
      #subprotocol;
      // Has the `getVersion()` function been called? This is only used to validate that the API is used
      // correctly.
      #getVersionCalled;
      // A map from request id to the responses that we expect to receive from the server.
      #responseMap;
      // An allocator of request ids.
      #requestIdAlloc;
      // An allocator of stream ids.
      /** @private */
      _streamIdAlloc;
      // An allocator of cursor ids.
      /** @private */
      _cursorIdAlloc;
      // An allocator of SQL text ids.
      #sqlIdAlloc;
      /** @private */
      constructor(socket, jwt) {
        super();
        this.#socket = socket;
        this.#openCallbacks = [];
        this.#opened = false;
        this.#closed = void 0;
        this.#recvdHello = false;
        this.#subprotocol = void 0;
        this.#getVersionCalled = false;
        this.#responseMap = /* @__PURE__ */ new Map();
        this.#requestIdAlloc = new IdAlloc();
        this._streamIdAlloc = new IdAlloc();
        this._cursorIdAlloc = new IdAlloc();
        this.#sqlIdAlloc = new IdAlloc();
        this.#socket.binaryType = "arraybuffer";
        this.#socket.addEventListener("open", () => this.#onSocketOpen());
        this.#socket.addEventListener("close", (event) => this.#onSocketClose(event));
        this.#socket.addEventListener("error", (event) => this.#onSocketError(event));
        this.#socket.addEventListener("message", (event) => this.#onSocketMessage(event));
        this.#send({ type: "hello", jwt });
      }
      // Send (or enqueue to send) a message to the server.
      #send(msg) {
        if (this.#closed !== void 0) {
          throw new InternalError("Trying to send a message on a closed client");
        }
        if (this.#opened) {
          this.#sendToSocket(msg);
        } else {
          const openCallback = /* @__PURE__ */ __name(() => this.#sendToSocket(msg), "openCallback");
          const errorCallback = /* @__PURE__ */ __name(() => void 0, "errorCallback");
          this.#openCallbacks.push({ openCallback, errorCallback });
        }
      }
      // The socket transitioned from CONNECTING to OPEN
      #onSocketOpen() {
        const protocol = this.#socket.protocol;
        if (protocol === void 0) {
          this.#setClosed(new ClientError("The `WebSocket.protocol` property is undefined. This most likely means that the WebSocket implementation provided by the environment is broken. If you are using Miniflare 2, please update to Miniflare 3, which fixes this problem."));
          return;
        } else if (protocol === "") {
          this.#subprotocol = { version: 1, encoding: "json" };
        } else {
          this.#subprotocol = subprotocolsV3.get(protocol);
          if (this.#subprotocol === void 0) {
            this.#setClosed(new ProtoError(`Unrecognized WebSocket subprotocol: ${JSON.stringify(protocol)}`));
            return;
          }
        }
        for (const callbacks of this.#openCallbacks) {
          callbacks.openCallback();
        }
        this.#openCallbacks.length = 0;
        this.#opened = true;
      }
      #sendToSocket(msg) {
        const encoding = this.#subprotocol.encoding;
        if (encoding === "json") {
          const jsonMsg = writeJsonObject(msg, ClientMsg);
          this.#socket.send(jsonMsg);
        } else if (encoding === "protobuf") {
          const protobufMsg = writeProtobufMessage(msg, ClientMsg2);
          this.#socket.send(protobufMsg);
        } else {
          throw impossible(encoding, "Impossible encoding");
        }
      }
      /** Get the protocol version negotiated with the server, possibly waiting until the socket is open. */
      getVersion() {
        return new Promise((versionCallback, errorCallback) => {
          this.#getVersionCalled = true;
          if (this.#closed !== void 0) {
            errorCallback(this.#closed);
          } else if (!this.#opened) {
            const openCallback = /* @__PURE__ */ __name(() => versionCallback(this.#subprotocol.version), "openCallback");
            this.#openCallbacks.push({ openCallback, errorCallback });
          } else {
            versionCallback(this.#subprotocol.version);
          }
        });
      }
      // Make sure that the negotiated version is at least `minVersion`.
      /** @private */
      _ensureVersion(minVersion, feature) {
        if (this.#subprotocol === void 0 || !this.#getVersionCalled) {
          throw new ProtocolVersionError(`${feature} is supported only on protocol version ${minVersion} and higher, but the version supported by the WebSocket server is not yet known. Use Client.getVersion() to wait until the version is available.`);
        } else if (this.#subprotocol.version < minVersion) {
          throw new ProtocolVersionError(`${feature} is supported on protocol version ${minVersion} and higher, but the WebSocket server only supports version ${this.#subprotocol.version}`);
        }
      }
      // Send a request to the server and invoke a callback when we get the response.
      /** @private */
      _sendRequest(request, callbacks) {
        if (this.#closed !== void 0) {
          callbacks.errorCallback(new ClosedError("Client is closed", this.#closed));
          return;
        }
        const requestId = this.#requestIdAlloc.alloc();
        this.#responseMap.set(requestId, { ...callbacks, type: request.type });
        this.#send({ type: "request", requestId, request });
      }
      // The socket encountered an error.
      #onSocketError(event) {
        const eventMessage = event.message;
        const message2 = eventMessage ?? "WebSocket was closed due to an error";
        this.#setClosed(new WebSocketError(message2));
      }
      // The socket was closed.
      #onSocketClose(event) {
        let message2 = `WebSocket was closed with code ${event.code}`;
        if (event.reason) {
          message2 += `: ${event.reason}`;
        }
        this.#setClosed(new WebSocketError(message2));
      }
      // Close the client with the given error.
      #setClosed(error) {
        if (this.#closed !== void 0) {
          return;
        }
        this.#closed = error;
        for (const callbacks of this.#openCallbacks) {
          callbacks.errorCallback(error);
        }
        this.#openCallbacks.length = 0;
        for (const [requestId, responseState] of this.#responseMap.entries()) {
          responseState.errorCallback(error);
          this.#requestIdAlloc.free(requestId);
        }
        this.#responseMap.clear();
        this.#socket.close();
      }
      // We received a message from the socket.
      #onSocketMessage(event) {
        if (this.#closed !== void 0) {
          return;
        }
        try {
          let msg;
          const encoding = this.#subprotocol.encoding;
          if (encoding === "json") {
            if (typeof event.data !== "string") {
              this.#socket.close(3003, "Only text messages are accepted with JSON encoding");
              this.#setClosed(new ProtoError("Received non-text message from server with JSON encoding"));
              return;
            }
            msg = readJsonObject(JSON.parse(event.data), ServerMsg);
          } else if (encoding === "protobuf") {
            if (!(event.data instanceof ArrayBuffer)) {
              this.#socket.close(3003, "Only binary messages are accepted with Protobuf encoding");
              this.#setClosed(new ProtoError("Received non-binary message from server with Protobuf encoding"));
              return;
            }
            msg = readProtobufMessage(new Uint8Array(event.data), ServerMsg2);
          } else {
            throw impossible(encoding, "Impossible encoding");
          }
          this.#handleMsg(msg);
        } catch (e) {
          this.#socket.close(3007, "Could not handle message");
          this.#setClosed(e);
        }
      }
      // Handle a message from the server.
      #handleMsg(msg) {
        if (msg.type === "none") {
          throw new ProtoError("Received an unrecognized ServerMsg");
        } else if (msg.type === "hello_ok" || msg.type === "hello_error") {
          if (this.#recvdHello) {
            throw new ProtoError("Received a duplicated hello response");
          }
          this.#recvdHello = true;
          if (msg.type === "hello_error") {
            throw errorFromProto(msg.error);
          }
          return;
        } else if (!this.#recvdHello) {
          throw new ProtoError("Received a non-hello message before a hello response");
        }
        if (msg.type === "response_ok") {
          const requestId = msg.requestId;
          const responseState = this.#responseMap.get(requestId);
          this.#responseMap.delete(requestId);
          if (responseState === void 0) {
            throw new ProtoError("Received unexpected OK response");
          }
          this.#requestIdAlloc.free(requestId);
          try {
            if (responseState.type !== msg.response.type) {
              console.dir({ responseState, msg });
              throw new ProtoError("Received unexpected type of response");
            }
            responseState.responseCallback(msg.response);
          } catch (e) {
            responseState.errorCallback(e);
            throw e;
          }
        } else if (msg.type === "response_error") {
          const requestId = msg.requestId;
          const responseState = this.#responseMap.get(requestId);
          this.#responseMap.delete(requestId);
          if (responseState === void 0) {
            throw new ProtoError("Received unexpected error response");
          }
          this.#requestIdAlloc.free(requestId);
          responseState.errorCallback(errorFromProto(msg.error));
        } else {
          throw impossible(msg, "Impossible ServerMsg type");
        }
      }
      /** Open a {@link WsStream}, a stream for executing SQL statements. */
      openStream() {
        return WsStream.open(this);
      }
      /** Cache a SQL text on the server. This requires protocol version 2 or higher. */
      storeSql(sql) {
        this._ensureVersion(2, "storeSql()");
        const sqlId = this.#sqlIdAlloc.alloc();
        const sqlObj = new Sql(this, sqlId);
        const responseCallback = /* @__PURE__ */ __name(() => void 0, "responseCallback");
        const errorCallback = /* @__PURE__ */ __name((e) => sqlObj._setClosed(e), "errorCallback");
        const request = { type: "store_sql", sqlId, sql };
        this._sendRequest(request, { responseCallback, errorCallback });
        return sqlObj;
      }
      /** @private */
      _closeSql(sqlId) {
        if (this.#closed !== void 0) {
          return;
        }
        const responseCallback = /* @__PURE__ */ __name(() => this.#sqlIdAlloc.free(sqlId), "responseCallback");
        const errorCallback = /* @__PURE__ */ __name((e) => this.#setClosed(e), "errorCallback");
        const request = { type: "close_sql", sqlId };
        this._sendRequest(request, { responseCallback, errorCallback });
      }
      /** Close the client and the WebSocket. */
      close() {
        this.#setClosed(new ClientError("Client was manually closed"));
      }
      /** True if the client is closed. */
      get closed() {
        return this.#closed !== void 0;
      }
    };
  }
});

// ../node_modules/cross-fetch/dist/browser-ponyfill.js
var require_browser_ponyfill = __commonJS({
  "../node_modules/cross-fetch/dist/browser-ponyfill.js"(exports, module) {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    var __global__ = typeof globalThis !== "undefined" && globalThis || typeof self !== "undefined" && self || typeof global !== "undefined" && global;
    var __globalThis__ = (function() {
      function F() {
        this.fetch = false;
        this.DOMException = __global__.DOMException;
      }
      __name(F, "F");
      F.prototype = __global__;
      return new F();
    })();
    (function(globalThis2) {
      var irrelevant = (function(exports2) {
        var g = typeof globalThis2 !== "undefined" && globalThis2 || typeof self !== "undefined" && self || // eslint-disable-next-line no-undef
        typeof global !== "undefined" && global || {};
        var support = {
          searchParams: "URLSearchParams" in g,
          iterable: "Symbol" in g && "iterator" in Symbol,
          blob: "FileReader" in g && "Blob" in g && (function() {
            try {
              new Blob();
              return true;
            } catch (e) {
              return false;
            }
          })(),
          formData: "FormData" in g,
          arrayBuffer: "ArrayBuffer" in g
        };
        function isDataView(obj) {
          return obj && DataView.prototype.isPrototypeOf(obj);
        }
        __name(isDataView, "isDataView");
        if (support.arrayBuffer) {
          var viewClasses = [
            "[object Int8Array]",
            "[object Uint8Array]",
            "[object Uint8ClampedArray]",
            "[object Int16Array]",
            "[object Uint16Array]",
            "[object Int32Array]",
            "[object Uint32Array]",
            "[object Float32Array]",
            "[object Float64Array]"
          ];
          var isArrayBufferView = ArrayBuffer.isView || function(obj) {
            return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
          };
        }
        function normalizeName(name) {
          if (typeof name !== "string") {
            name = String(name);
          }
          if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === "") {
            throw new TypeError('Invalid character in header field name: "' + name + '"');
          }
          return name.toLowerCase();
        }
        __name(normalizeName, "normalizeName");
        function normalizeValue(value) {
          if (typeof value !== "string") {
            value = String(value);
          }
          return value;
        }
        __name(normalizeValue, "normalizeValue");
        function iteratorFor(items) {
          var iterator = {
            next: /* @__PURE__ */ __name(function() {
              var value = items.shift();
              return { done: value === void 0, value };
            }, "next")
          };
          if (support.iterable) {
            iterator[Symbol.iterator] = function() {
              return iterator;
            };
          }
          return iterator;
        }
        __name(iteratorFor, "iteratorFor");
        function Headers3(headers) {
          this.map = {};
          if (headers instanceof Headers3) {
            headers.forEach(function(value, name) {
              this.append(name, value);
            }, this);
          } else if (Array.isArray(headers)) {
            headers.forEach(function(header) {
              if (header.length != 2) {
                throw new TypeError("Headers constructor: expected name/value pair to be length 2, found" + header.length);
              }
              this.append(header[0], header[1]);
            }, this);
          } else if (headers) {
            Object.getOwnPropertyNames(headers).forEach(function(name) {
              this.append(name, headers[name]);
            }, this);
          }
        }
        __name(Headers3, "Headers");
        Headers3.prototype.append = function(name, value) {
          name = normalizeName(name);
          value = normalizeValue(value);
          var oldValue = this.map[name];
          this.map[name] = oldValue ? oldValue + ", " + value : value;
        };
        Headers3.prototype["delete"] = function(name) {
          delete this.map[normalizeName(name)];
        };
        Headers3.prototype.get = function(name) {
          name = normalizeName(name);
          return this.has(name) ? this.map[name] : null;
        };
        Headers3.prototype.has = function(name) {
          return this.map.hasOwnProperty(normalizeName(name));
        };
        Headers3.prototype.set = function(name, value) {
          this.map[normalizeName(name)] = normalizeValue(value);
        };
        Headers3.prototype.forEach = function(callback, thisArg) {
          for (var name in this.map) {
            if (this.map.hasOwnProperty(name)) {
              callback.call(thisArg, this.map[name], name, this);
            }
          }
        };
        Headers3.prototype.keys = function() {
          var items = [];
          this.forEach(function(value, name) {
            items.push(name);
          });
          return iteratorFor(items);
        };
        Headers3.prototype.values = function() {
          var items = [];
          this.forEach(function(value) {
            items.push(value);
          });
          return iteratorFor(items);
        };
        Headers3.prototype.entries = function() {
          var items = [];
          this.forEach(function(value, name) {
            items.push([name, value]);
          });
          return iteratorFor(items);
        };
        if (support.iterable) {
          Headers3.prototype[Symbol.iterator] = Headers3.prototype.entries;
        }
        function consumed(body) {
          if (body._noBody) return;
          if (body.bodyUsed) {
            return Promise.reject(new TypeError("Already read"));
          }
          body.bodyUsed = true;
        }
        __name(consumed, "consumed");
        function fileReaderReady(reader) {
          return new Promise(function(resolve, reject) {
            reader.onload = function() {
              resolve(reader.result);
            };
            reader.onerror = function() {
              reject(reader.error);
            };
          });
        }
        __name(fileReaderReady, "fileReaderReady");
        function readBlobAsArrayBuffer(blob) {
          var reader = new FileReader();
          var promise = fileReaderReady(reader);
          reader.readAsArrayBuffer(blob);
          return promise;
        }
        __name(readBlobAsArrayBuffer, "readBlobAsArrayBuffer");
        function readBlobAsText(blob) {
          var reader = new FileReader();
          var promise = fileReaderReady(reader);
          var match2 = /charset=([A-Za-z0-9_-]+)/.exec(blob.type);
          var encoding = match2 ? match2[1] : "utf-8";
          reader.readAsText(blob, encoding);
          return promise;
        }
        __name(readBlobAsText, "readBlobAsText");
        function readArrayBufferAsText(buf) {
          var view = new Uint8Array(buf);
          var chars = new Array(view.length);
          for (var i = 0; i < view.length; i++) {
            chars[i] = String.fromCharCode(view[i]);
          }
          return chars.join("");
        }
        __name(readArrayBufferAsText, "readArrayBufferAsText");
        function bufferClone(buf) {
          if (buf.slice) {
            return buf.slice(0);
          } else {
            var view = new Uint8Array(buf.byteLength);
            view.set(new Uint8Array(buf));
            return view.buffer;
          }
        }
        __name(bufferClone, "bufferClone");
        function Body() {
          this.bodyUsed = false;
          this._initBody = function(body) {
            this.bodyUsed = this.bodyUsed;
            this._bodyInit = body;
            if (!body) {
              this._noBody = true;
              this._bodyText = "";
            } else if (typeof body === "string") {
              this._bodyText = body;
            } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
              this._bodyBlob = body;
            } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
              this._bodyFormData = body;
            } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
              this._bodyText = body.toString();
            } else if (support.arrayBuffer && support.blob && isDataView(body)) {
              this._bodyArrayBuffer = bufferClone(body.buffer);
              this._bodyInit = new Blob([this._bodyArrayBuffer]);
            } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
              this._bodyArrayBuffer = bufferClone(body);
            } else {
              this._bodyText = body = Object.prototype.toString.call(body);
            }
            if (!this.headers.get("content-type")) {
              if (typeof body === "string") {
                this.headers.set("content-type", "text/plain;charset=UTF-8");
              } else if (this._bodyBlob && this._bodyBlob.type) {
                this.headers.set("content-type", this._bodyBlob.type);
              } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
                this.headers.set("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
              }
            }
          };
          if (support.blob) {
            this.blob = function() {
              var rejected = consumed(this);
              if (rejected) {
                return rejected;
              }
              if (this._bodyBlob) {
                return Promise.resolve(this._bodyBlob);
              } else if (this._bodyArrayBuffer) {
                return Promise.resolve(new Blob([this._bodyArrayBuffer]));
              } else if (this._bodyFormData) {
                throw new Error("could not read FormData body as blob");
              } else {
                return Promise.resolve(new Blob([this._bodyText]));
              }
            };
          }
          this.arrayBuffer = function() {
            if (this._bodyArrayBuffer) {
              var isConsumed = consumed(this);
              if (isConsumed) {
                return isConsumed;
              } else if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
                return Promise.resolve(
                  this._bodyArrayBuffer.buffer.slice(
                    this._bodyArrayBuffer.byteOffset,
                    this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
                  )
                );
              } else {
                return Promise.resolve(this._bodyArrayBuffer);
              }
            } else if (support.blob) {
              return this.blob().then(readBlobAsArrayBuffer);
            } else {
              throw new Error("could not read as ArrayBuffer");
            }
          };
          this.text = function() {
            var rejected = consumed(this);
            if (rejected) {
              return rejected;
            }
            if (this._bodyBlob) {
              return readBlobAsText(this._bodyBlob);
            } else if (this._bodyArrayBuffer) {
              return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
            } else if (this._bodyFormData) {
              throw new Error("could not read FormData body as text");
            } else {
              return Promise.resolve(this._bodyText);
            }
          };
          if (support.formData) {
            this.formData = function() {
              return this.text().then(decode3);
            };
          }
          this.json = function() {
            return this.text().then(JSON.parse);
          };
          return this;
        }
        __name(Body, "Body");
        var methods = ["CONNECT", "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT", "TRACE"];
        function normalizeMethod(method) {
          var upcased = method.toUpperCase();
          return methods.indexOf(upcased) > -1 ? upcased : method;
        }
        __name(normalizeMethod, "normalizeMethod");
        function Request6(input, options) {
          if (!(this instanceof Request6)) {
            throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
          }
          options = options || {};
          var body = options.body;
          if (input instanceof Request6) {
            if (input.bodyUsed) {
              throw new TypeError("Already read");
            }
            this.url = input.url;
            this.credentials = input.credentials;
            if (!options.headers) {
              this.headers = new Headers3(input.headers);
            }
            this.method = input.method;
            this.mode = input.mode;
            this.signal = input.signal;
            if (!body && input._bodyInit != null) {
              body = input._bodyInit;
              input.bodyUsed = true;
            }
          } else {
            this.url = String(input);
          }
          this.credentials = options.credentials || this.credentials || "same-origin";
          if (options.headers || !this.headers) {
            this.headers = new Headers3(options.headers);
          }
          this.method = normalizeMethod(options.method || this.method || "GET");
          this.mode = options.mode || this.mode || null;
          this.signal = options.signal || this.signal || (function() {
            if ("AbortController" in g) {
              var ctrl = new AbortController();
              return ctrl.signal;
            }
          })();
          this.referrer = null;
          if ((this.method === "GET" || this.method === "HEAD") && body) {
            throw new TypeError("Body not allowed for GET or HEAD requests");
          }
          this._initBody(body);
          if (this.method === "GET" || this.method === "HEAD") {
            if (options.cache === "no-store" || options.cache === "no-cache") {
              var reParamSearch = /([?&])_=[^&]*/;
              if (reParamSearch.test(this.url)) {
                this.url = this.url.replace(reParamSearch, "$1_=" + (/* @__PURE__ */ new Date()).getTime());
              } else {
                var reQueryString = /\?/;
                this.url += (reQueryString.test(this.url) ? "&" : "?") + "_=" + (/* @__PURE__ */ new Date()).getTime();
              }
            }
          }
        }
        __name(Request6, "Request");
        Request6.prototype.clone = function() {
          return new Request6(this, { body: this._bodyInit });
        };
        function decode3(body) {
          var form = new FormData();
          body.trim().split("&").forEach(function(bytes) {
            if (bytes) {
              var split = bytes.split("=");
              var name = split.shift().replace(/\+/g, " ");
              var value = split.join("=").replace(/\+/g, " ");
              form.append(decodeURIComponent(name), decodeURIComponent(value));
            }
          });
          return form;
        }
        __name(decode3, "decode");
        function parseHeaders(rawHeaders) {
          var headers = new Headers3();
          var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, " ");
          preProcessedHeaders.split("\r").map(function(header) {
            return header.indexOf("\n") === 0 ? header.substr(1, header.length) : header;
          }).forEach(function(line) {
            var parts = line.split(":");
            var key = parts.shift().trim();
            if (key) {
              var value = parts.join(":").trim();
              try {
                headers.append(key, value);
              } catch (error) {
                console.warn("Response " + error.message);
              }
            }
          });
          return headers;
        }
        __name(parseHeaders, "parseHeaders");
        Body.call(Request6.prototype);
        function Response3(bodyInit, options) {
          if (!(this instanceof Response3)) {
            throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
          }
          if (!options) {
            options = {};
          }
          this.type = "default";
          this.status = options.status === void 0 ? 200 : options.status;
          if (this.status < 200 || this.status > 599) {
            throw new RangeError("Failed to construct 'Response': The status provided (0) is outside the range [200, 599].");
          }
          this.ok = this.status >= 200 && this.status < 300;
          this.statusText = options.statusText === void 0 ? "" : "" + options.statusText;
          this.headers = new Headers3(options.headers);
          this.url = options.url || "";
          this._initBody(bodyInit);
        }
        __name(Response3, "Response");
        Body.call(Response3.prototype);
        Response3.prototype.clone = function() {
          return new Response3(this._bodyInit, {
            status: this.status,
            statusText: this.statusText,
            headers: new Headers3(this.headers),
            url: this.url
          });
        };
        Response3.error = function() {
          var response = new Response3(null, { status: 200, statusText: "" });
          response.ok = false;
          response.status = 0;
          response.type = "error";
          return response;
        };
        var redirectStatuses = [301, 302, 303, 307, 308];
        Response3.redirect = function(url, status) {
          if (redirectStatuses.indexOf(status) === -1) {
            throw new RangeError("Invalid status code");
          }
          return new Response3(null, { status, headers: { location: url } });
        };
        exports2.DOMException = g.DOMException;
        try {
          new exports2.DOMException();
        } catch (err) {
          exports2.DOMException = function(message2, name) {
            this.message = message2;
            this.name = name;
            var error = Error(message2);
            this.stack = error.stack;
          };
          exports2.DOMException.prototype = Object.create(Error.prototype);
          exports2.DOMException.prototype.constructor = exports2.DOMException;
        }
        function fetch4(input, init) {
          return new Promise(function(resolve, reject) {
            var request = new Request6(input, init);
            if (request.signal && request.signal.aborted) {
              return reject(new exports2.DOMException("Aborted", "AbortError"));
            }
            var xhr = new XMLHttpRequest();
            function abortXhr() {
              xhr.abort();
            }
            __name(abortXhr, "abortXhr");
            xhr.onload = function() {
              var options = {
                statusText: xhr.statusText,
                headers: parseHeaders(xhr.getAllResponseHeaders() || "")
              };
              if (request.url.indexOf("file://") === 0 && (xhr.status < 200 || xhr.status > 599)) {
                options.status = 200;
              } else {
                options.status = xhr.status;
              }
              options.url = "responseURL" in xhr ? xhr.responseURL : options.headers.get("X-Request-URL");
              var body = "response" in xhr ? xhr.response : xhr.responseText;
              setTimeout(function() {
                resolve(new Response3(body, options));
              }, 0);
            };
            xhr.onerror = function() {
              setTimeout(function() {
                reject(new TypeError("Network request failed"));
              }, 0);
            };
            xhr.ontimeout = function() {
              setTimeout(function() {
                reject(new TypeError("Network request timed out"));
              }, 0);
            };
            xhr.onabort = function() {
              setTimeout(function() {
                reject(new exports2.DOMException("Aborted", "AbortError"));
              }, 0);
            };
            function fixUrl(url) {
              try {
                return url === "" && g.location.href ? g.location.href : url;
              } catch (e) {
                return url;
              }
            }
            __name(fixUrl, "fixUrl");
            xhr.open(request.method, fixUrl(request.url), true);
            if (request.credentials === "include") {
              xhr.withCredentials = true;
            } else if (request.credentials === "omit") {
              xhr.withCredentials = false;
            }
            if ("responseType" in xhr) {
              if (support.blob) {
                xhr.responseType = "blob";
              } else if (support.arrayBuffer) {
                xhr.responseType = "arraybuffer";
              }
            }
            if (init && typeof init.headers === "object" && !(init.headers instanceof Headers3 || g.Headers && init.headers instanceof g.Headers)) {
              var names = [];
              Object.getOwnPropertyNames(init.headers).forEach(function(name) {
                names.push(normalizeName(name));
                xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
              });
              request.headers.forEach(function(value, name) {
                if (names.indexOf(name) === -1) {
                  xhr.setRequestHeader(name, value);
                }
              });
            } else {
              request.headers.forEach(function(value, name) {
                xhr.setRequestHeader(name, value);
              });
            }
            if (request.signal) {
              request.signal.addEventListener("abort", abortXhr);
              xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                  request.signal.removeEventListener("abort", abortXhr);
                }
              };
            }
            xhr.send(typeof request._bodyInit === "undefined" ? null : request._bodyInit);
          });
        }
        __name(fetch4, "fetch");
        fetch4.polyfill = true;
        if (!g.fetch) {
          g.fetch = fetch4;
          g.Headers = Headers3;
          g.Request = Request6;
          g.Response = Response3;
        }
        exports2.Headers = Headers3;
        exports2.Request = Request6;
        exports2.Response = Response3;
        exports2.fetch = fetch4;
        return exports2;
      })({});
    })(__globalThis__);
    __globalThis__.fetch.ponyfill = true;
    delete __globalThis__.fetch.polyfill;
    var ctx = __global__.fetch ? __global__ : __globalThis__;
    exports = ctx.fetch;
    exports.default = ctx.fetch;
    exports.fetch = ctx.fetch;
    exports.Headers = ctx.Headers;
    exports.Request = ctx.Request;
    exports.Response = ctx.Response;
    module.exports = exports;
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/queue_microtask.js
var _queueMicrotask;
var init_queue_microtask = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/queue_microtask.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    if (typeof queueMicrotask !== "undefined") {
      _queueMicrotask = queueMicrotask;
    } else {
      const resolved = Promise.resolve();
      _queueMicrotask = /* @__PURE__ */ __name((callback) => {
        resolved.then(callback);
      }, "_queueMicrotask");
    }
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/byte_queue.js
var ByteQueue;
var init_byte_queue = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/byte_queue.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    ByteQueue = class {
      static {
        __name(this, "ByteQueue");
      }
      #array;
      #shiftPos;
      #pushPos;
      constructor(initialCap) {
        this.#array = new Uint8Array(new ArrayBuffer(initialCap));
        this.#shiftPos = 0;
        this.#pushPos = 0;
      }
      get length() {
        return this.#pushPos - this.#shiftPos;
      }
      data() {
        return this.#array.slice(this.#shiftPos, this.#pushPos);
      }
      push(chunk) {
        this.#ensurePush(chunk.byteLength);
        this.#array.set(chunk, this.#pushPos);
        this.#pushPos += chunk.byteLength;
      }
      #ensurePush(pushLength) {
        if (this.#pushPos + pushLength <= this.#array.byteLength) {
          return;
        }
        const filledLength = this.#pushPos - this.#shiftPos;
        if (filledLength + pushLength <= this.#array.byteLength && 2 * this.#pushPos >= this.#array.byteLength) {
          this.#array.copyWithin(0, this.#shiftPos, this.#pushPos);
        } else {
          let newCap = this.#array.byteLength;
          do {
            newCap *= 2;
          } while (filledLength + pushLength > newCap);
          const newArray = new Uint8Array(new ArrayBuffer(newCap));
          newArray.set(this.#array.slice(this.#shiftPos, this.#pushPos), 0);
          this.#array = newArray;
        }
        this.#pushPos = filledLength;
        this.#shiftPos = 0;
      }
      shift(length) {
        this.#shiftPos += length;
      }
    };
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/http/json_decode.js
function PipelineRespBody(obj) {
  const baton = stringOpt(obj["baton"]);
  const baseUrl = stringOpt(obj["base_url"]);
  const results = arrayObjectsMap(obj["results"], StreamResult);
  return { baton, baseUrl, results };
}
function StreamResult(obj) {
  const type = string(obj["type"]);
  if (type === "ok") {
    const response = StreamResponse(object(obj["response"]));
    return { type: "ok", response };
  } else if (type === "error") {
    const error = Error2(object(obj["error"]));
    return { type: "error", error };
  } else {
    throw new ProtoError("Unexpected type of StreamResult");
  }
}
function StreamResponse(obj) {
  const type = string(obj["type"]);
  if (type === "close") {
    return { type: "close" };
  } else if (type === "execute") {
    const result = StmtResult(object(obj["result"]));
    return { type: "execute", result };
  } else if (type === "batch") {
    const result = BatchResult(object(obj["result"]));
    return { type: "batch", result };
  } else if (type === "sequence") {
    return { type: "sequence" };
  } else if (type === "describe") {
    const result = DescribeResult(object(obj["result"]));
    return { type: "describe", result };
  } else if (type === "store_sql") {
    return { type: "store_sql" };
  } else if (type === "close_sql") {
    return { type: "close_sql" };
  } else if (type === "get_autocommit") {
    const isAutocommit = boolean(obj["is_autocommit"]);
    return { type: "get_autocommit", isAutocommit };
  } else {
    throw new ProtoError("Unexpected type of StreamResponse");
  }
}
function CursorRespBody(obj) {
  const baton = stringOpt(obj["baton"]);
  const baseUrl = stringOpt(obj["base_url"]);
  return { baton, baseUrl };
}
var init_json_decode3 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/http/json_decode.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_errors2();
    init_decode();
    init_json_decode();
    __name(PipelineRespBody, "PipelineRespBody");
    __name(StreamResult, "StreamResult");
    __name(StreamResponse, "StreamResponse");
    __name(CursorRespBody, "CursorRespBody");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/http/protobuf_decode.js
var PipelineRespBody2, StreamResult2, StreamResponse2, ExecuteStreamResp, BatchStreamResp, DescribeStreamResp, GetAutocommitStreamResp, CursorRespBody2;
var init_protobuf_decode3 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/http/protobuf_decode.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_protobuf_decode();
    PipelineRespBody2 = {
      default() {
        return { baton: void 0, baseUrl: void 0, results: [] };
      },
      1(r, msg) {
        msg.baton = r.string();
      },
      2(r, msg) {
        msg.baseUrl = r.string();
      },
      3(r, msg) {
        msg.results.push(r.message(StreamResult2));
      }
    };
    StreamResult2 = {
      default() {
        return { type: "none" };
      },
      1(r) {
        return { type: "ok", response: r.message(StreamResponse2) };
      },
      2(r) {
        return { type: "error", error: r.message(Error3) };
      }
    };
    StreamResponse2 = {
      default() {
        return { type: "none" };
      },
      1(r) {
        return { type: "close" };
      },
      2(r) {
        return r.message(ExecuteStreamResp);
      },
      3(r) {
        return r.message(BatchStreamResp);
      },
      4(r) {
        return { type: "sequence" };
      },
      5(r) {
        return r.message(DescribeStreamResp);
      },
      6(r) {
        return { type: "store_sql" };
      },
      7(r) {
        return { type: "close_sql" };
      },
      8(r) {
        return r.message(GetAutocommitStreamResp);
      }
    };
    ExecuteStreamResp = {
      default() {
        return { type: "execute", result: StmtResult2.default() };
      },
      1(r, msg) {
        msg.result = r.message(StmtResult2);
      }
    };
    BatchStreamResp = {
      default() {
        return { type: "batch", result: BatchResult2.default() };
      },
      1(r, msg) {
        msg.result = r.message(BatchResult2);
      }
    };
    DescribeStreamResp = {
      default() {
        return { type: "describe", result: DescribeResult2.default() };
      },
      1(r, msg) {
        msg.result = r.message(DescribeResult2);
      }
    };
    GetAutocommitStreamResp = {
      default() {
        return { type: "get_autocommit", isAutocommit: false };
      },
      1(r, msg) {
        msg.isAutocommit = r.bool();
      }
    };
    CursorRespBody2 = {
      default() {
        return { baton: void 0, baseUrl: void 0 };
      },
      1(r, msg) {
        msg.baton = r.string();
      },
      2(r, msg) {
        msg.baseUrl = r.string();
      }
    };
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/http/cursor.js
var HttpCursor;
var init_cursor3 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/http/cursor.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_byte_queue();
    init_cursor();
    init_decode();
    init_decode2();
    init_errors2();
    init_util3();
    init_json_decode3();
    init_protobuf_decode3();
    init_json_decode();
    init_protobuf_decode();
    HttpCursor = class extends Cursor {
      static {
        __name(this, "HttpCursor");
      }
      #stream;
      #encoding;
      #reader;
      #queue;
      #closed;
      #done;
      /** @private */
      constructor(stream, encoding) {
        super();
        this.#stream = stream;
        this.#encoding = encoding;
        this.#reader = void 0;
        this.#queue = new ByteQueue(16 * 1024);
        this.#closed = void 0;
        this.#done = false;
      }
      async open(response) {
        if (response.body === null) {
          throw new ProtoError("No response body for cursor request");
        }
        this.#reader = response.body[Symbol.asyncIterator]();
        const respBody = await this.#nextItem(CursorRespBody, CursorRespBody2);
        if (respBody === void 0) {
          throw new ProtoError("Empty response to cursor request");
        }
        return respBody;
      }
      /** Fetch the next entry from the cursor. */
      next() {
        return this.#nextItem(CursorEntry, CursorEntry2);
      }
      /** Close the cursor. */
      close() {
        this._setClosed(new ClientError("Cursor was manually closed"));
      }
      /** @private */
      _setClosed(error) {
        if (this.#closed !== void 0) {
          return;
        }
        this.#closed = error;
        this.#stream._cursorClosed(this);
        if (this.#reader !== void 0) {
          this.#reader.return();
        }
      }
      /** True if the cursor is closed. */
      get closed() {
        return this.#closed !== void 0;
      }
      async #nextItem(jsonFun, protobufDef) {
        for (; ; ) {
          if (this.#done) {
            return void 0;
          } else if (this.#closed !== void 0) {
            throw new ClosedError("Cursor is closed", this.#closed);
          }
          if (this.#encoding === "json") {
            const jsonData = this.#parseItemJson();
            if (jsonData !== void 0) {
              const jsonText = new TextDecoder().decode(jsonData);
              const jsonValue = JSON.parse(jsonText);
              return readJsonObject(jsonValue, jsonFun);
            }
          } else if (this.#encoding === "protobuf") {
            const protobufData = this.#parseItemProtobuf();
            if (protobufData !== void 0) {
              return readProtobufMessage(protobufData, protobufDef);
            }
          } else {
            throw impossible(this.#encoding, "Impossible encoding");
          }
          if (this.#reader === void 0) {
            throw new InternalError("Attempted to read from HTTP cursor before it was opened");
          }
          const { value, done } = await this.#reader.next();
          if (done && this.#queue.length === 0) {
            this.#done = true;
          } else if (done) {
            throw new ProtoError("Unexpected end of cursor stream");
          } else {
            this.#queue.push(value);
          }
        }
      }
      #parseItemJson() {
        const data = this.#queue.data();
        const newlineByte = 10;
        const newlinePos = data.indexOf(newlineByte);
        if (newlinePos < 0) {
          return void 0;
        }
        const jsonData = data.slice(0, newlinePos);
        this.#queue.shift(newlinePos + 1);
        return jsonData;
      }
      #parseItemProtobuf() {
        const data = this.#queue.data();
        let varintValue = 0;
        let varintLength = 0;
        for (; ; ) {
          if (varintLength >= data.byteLength) {
            return void 0;
          }
          const byte = data[varintLength];
          varintValue |= (byte & 127) << 7 * varintLength;
          varintLength += 1;
          if (!(byte & 128)) {
            break;
          }
        }
        if (data.byteLength < varintLength + varintValue) {
          return void 0;
        }
        const protobufData = data.slice(varintLength, varintLength + varintValue);
        this.#queue.shift(varintLength + varintValue);
        return protobufData;
      }
    };
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/http/json_encode.js
function PipelineReqBody(w, msg) {
  if (msg.baton !== void 0) {
    w.string("baton", msg.baton);
  }
  w.arrayObjects("requests", msg.requests, StreamRequest);
}
function StreamRequest(w, msg) {
  w.stringRaw("type", msg.type);
  if (msg.type === "close") {
  } else if (msg.type === "execute") {
    w.object("stmt", msg.stmt, Stmt2);
  } else if (msg.type === "batch") {
    w.object("batch", msg.batch, Batch2);
  } else if (msg.type === "sequence") {
    if (msg.sql !== void 0) {
      w.string("sql", msg.sql);
    }
    if (msg.sqlId !== void 0) {
      w.number("sql_id", msg.sqlId);
    }
  } else if (msg.type === "describe") {
    if (msg.sql !== void 0) {
      w.string("sql", msg.sql);
    }
    if (msg.sqlId !== void 0) {
      w.number("sql_id", msg.sqlId);
    }
  } else if (msg.type === "store_sql") {
    w.number("sql_id", msg.sqlId);
    w.string("sql", msg.sql);
  } else if (msg.type === "close_sql") {
    w.number("sql_id", msg.sqlId);
  } else if (msg.type === "get_autocommit") {
  } else {
    throw impossible(msg, "Impossible type of StreamRequest");
  }
}
function CursorReqBody(w, msg) {
  if (msg.baton !== void 0) {
    w.string("baton", msg.baton);
  }
  w.object("batch", msg.batch, Batch2);
}
var init_json_encode3 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/http/json_encode.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_json_encode();
    init_util3();
    __name(PipelineReqBody, "PipelineReqBody");
    __name(StreamRequest, "StreamRequest");
    __name(CursorReqBody, "CursorReqBody");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/http/protobuf_encode.js
function PipelineReqBody2(w, msg) {
  if (msg.baton !== void 0) {
    w.string(1, msg.baton);
  }
  for (const req of msg.requests) {
    w.message(2, req, StreamRequest2);
  }
}
function StreamRequest2(w, msg) {
  if (msg.type === "close") {
    w.message(1, msg, CloseStreamReq2);
  } else if (msg.type === "execute") {
    w.message(2, msg, ExecuteStreamReq);
  } else if (msg.type === "batch") {
    w.message(3, msg, BatchStreamReq);
  } else if (msg.type === "sequence") {
    w.message(4, msg, SequenceStreamReq);
  } else if (msg.type === "describe") {
    w.message(5, msg, DescribeStreamReq);
  } else if (msg.type === "store_sql") {
    w.message(6, msg, StoreSqlStreamReq);
  } else if (msg.type === "close_sql") {
    w.message(7, msg, CloseSqlStreamReq);
  } else if (msg.type === "get_autocommit") {
    w.message(8, msg, GetAutocommitStreamReq);
  } else {
    throw impossible(msg, "Impossible type of StreamRequest");
  }
}
function CloseStreamReq2(_w, _msg) {
}
function ExecuteStreamReq(w, msg) {
  w.message(1, msg.stmt, Stmt3);
}
function BatchStreamReq(w, msg) {
  w.message(1, msg.batch, Batch3);
}
function SequenceStreamReq(w, msg) {
  if (msg.sql !== void 0) {
    w.string(1, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(2, msg.sqlId);
  }
}
function DescribeStreamReq(w, msg) {
  if (msg.sql !== void 0) {
    w.string(1, msg.sql);
  }
  if (msg.sqlId !== void 0) {
    w.int32(2, msg.sqlId);
  }
}
function StoreSqlStreamReq(w, msg) {
  w.int32(1, msg.sqlId);
  w.string(2, msg.sql);
}
function CloseSqlStreamReq(w, msg) {
  w.int32(1, msg.sqlId);
}
function GetAutocommitStreamReq(_w, _msg) {
}
function CursorReqBody2(w, msg) {
  if (msg.baton !== void 0) {
    w.string(1, msg.baton);
  }
  w.message(2, msg.batch, Batch3);
}
var init_protobuf_encode3 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/http/protobuf_encode.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_protobuf_encode();
    init_util3();
    __name(PipelineReqBody2, "PipelineReqBody");
    __name(StreamRequest2, "StreamRequest");
    __name(CloseStreamReq2, "CloseStreamReq");
    __name(ExecuteStreamReq, "ExecuteStreamReq");
    __name(BatchStreamReq, "BatchStreamReq");
    __name(SequenceStreamReq, "SequenceStreamReq");
    __name(DescribeStreamReq, "DescribeStreamReq");
    __name(StoreSqlStreamReq, "StoreSqlStreamReq");
    __name(CloseSqlStreamReq, "CloseSqlStreamReq");
    __name(GetAutocommitStreamReq, "GetAutocommitStreamReq");
    __name(CursorReqBody2, "CursorReqBody");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/http/stream.js
function handlePipelineResponse(pipeline, respBody) {
  if (respBody.results.length !== pipeline.length) {
    throw new ProtoError("Server returned unexpected number of pipeline results");
  }
  for (let i = 0; i < pipeline.length; ++i) {
    const result = respBody.results[i];
    const entry = pipeline[i];
    if (result.type === "ok") {
      if (result.response.type !== entry.request.type) {
        throw new ProtoError("Received unexpected type of response");
      }
      entry.responseCallback(result.response);
    } else if (result.type === "error") {
      entry.errorCallback(errorFromProto(result.error));
    } else if (result.type === "none") {
      throw new ProtoError("Received unrecognized type of StreamResult");
    } else {
      throw impossible(result, "Received impossible type of StreamResult");
    }
  }
}
async function decodePipelineResponse(resp, encoding) {
  if (encoding === "json") {
    const respJson = await resp.json();
    return readJsonObject(respJson, PipelineRespBody);
  }
  if (encoding === "protobuf") {
    const respData = await resp.arrayBuffer();
    return readProtobufMessage(new Uint8Array(respData), PipelineRespBody2);
  }
  await resp.body?.cancel();
  throw impossible(encoding, "Impossible encoding");
}
async function errorFromResponse(resp) {
  const respType = resp.headers.get("content-type") ?? "text/plain";
  let message2 = `Server returned HTTP status ${resp.status}`;
  if (respType === "application/json") {
    const respBody = await resp.json();
    if ("message" in respBody) {
      return errorFromProto(respBody);
    }
    return new HttpServerError(message2, resp.status);
  }
  if (respType === "text/plain") {
    const respBody = (await resp.text()).trim();
    if (respBody !== "") {
      message2 += `: ${respBody}`;
    }
    return new HttpServerError(message2, resp.status);
  }
  await resp.body?.cancel();
  return new HttpServerError(message2, resp.status);
}
var import_cross_fetch, HttpStream;
var init_stream3 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/http/stream.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    import_cross_fetch = __toESM(require_browser_ponyfill(), 1);
    init_errors2();
    init_encoding();
    init_id_alloc();
    init_queue();
    init_queue_microtask();
    init_result();
    init_sql();
    init_stream();
    init_util3();
    init_cursor3();
    init_json_encode3();
    init_protobuf_encode3();
    init_json_encode3();
    init_protobuf_encode3();
    init_json_decode3();
    init_protobuf_decode3();
    HttpStream = class extends Stream {
      static {
        __name(this, "HttpStream");
      }
      #client;
      #baseUrl;
      #jwt;
      #fetch;
      #remoteEncryptionKey;
      #baton;
      #queue;
      #flushing;
      #cursor;
      #closing;
      #closeQueued;
      #closed;
      #sqlIdAlloc;
      /** @private */
      constructor(client, baseUrl, jwt, customFetch, remoteEncryptionKey) {
        super(client.intMode);
        this.#client = client;
        this.#baseUrl = baseUrl.toString();
        this.#jwt = jwt;
        this.#fetch = customFetch;
        this.#remoteEncryptionKey = remoteEncryptionKey;
        this.#baton = void 0;
        this.#queue = new Queue();
        this.#flushing = false;
        this.#closing = false;
        this.#closeQueued = false;
        this.#closed = void 0;
        this.#sqlIdAlloc = new IdAlloc();
      }
      /** Get the {@link HttpClient} object that this stream belongs to. */
      client() {
        return this.#client;
      }
      /** @private */
      _sqlOwner() {
        return this;
      }
      /** Cache a SQL text on the server. */
      storeSql(sql) {
        const sqlId = this.#sqlIdAlloc.alloc();
        this.#sendStreamRequest({ type: "store_sql", sqlId, sql }).then(() => void 0, (error) => this._setClosed(error));
        return new Sql(this, sqlId);
      }
      /** @private */
      _closeSql(sqlId) {
        if (this.#closed !== void 0) {
          return;
        }
        this.#sendStreamRequest({ type: "close_sql", sqlId }).then(() => this.#sqlIdAlloc.free(sqlId), (error) => this._setClosed(error));
      }
      /** @private */
      _execute(stmt) {
        return this.#sendStreamRequest({ type: "execute", stmt }).then((response) => {
          return response.result;
        });
      }
      /** @private */
      _batch(batch) {
        return this.#sendStreamRequest({ type: "batch", batch }).then((response) => {
          return response.result;
        });
      }
      /** @private */
      _describe(protoSql) {
        return this.#sendStreamRequest({
          type: "describe",
          sql: protoSql.sql,
          sqlId: protoSql.sqlId
        }).then((response) => {
          return response.result;
        });
      }
      /** @private */
      _sequence(protoSql) {
        return this.#sendStreamRequest({
          type: "sequence",
          sql: protoSql.sql,
          sqlId: protoSql.sqlId
        }).then((_response) => {
          return void 0;
        });
      }
      /** Check whether the SQL connection underlying this stream is in autocommit state (i.e., outside of an
       * explicit transaction). This requires protocol version 3 or higher.
       */
      getAutocommit() {
        this.#client._ensureVersion(3, "getAutocommit()");
        return this.#sendStreamRequest({
          type: "get_autocommit"
        }).then((response) => {
          return response.isAutocommit;
        });
      }
      #sendStreamRequest(request) {
        return new Promise((responseCallback, errorCallback) => {
          this.#pushToQueue({ type: "pipeline", request, responseCallback, errorCallback });
        });
      }
      /** @private */
      _openCursor(batch) {
        return new Promise((cursorCallback, errorCallback) => {
          this.#pushToQueue({ type: "cursor", batch, cursorCallback, errorCallback });
        });
      }
      /** @private */
      _cursorClosed(cursor) {
        if (cursor !== this.#cursor) {
          throw new InternalError("Cursor was closed, but it was not associated with the stream");
        }
        this.#cursor = void 0;
        _queueMicrotask(() => this.#flushQueue());
      }
      /** Immediately close the stream. */
      close() {
        this._setClosed(new ClientError("Stream was manually closed"));
      }
      /** Gracefully close the stream. */
      closeGracefully() {
        this.#closing = true;
        _queueMicrotask(() => this.#flushQueue());
      }
      /** True if the stream is closed. */
      get closed() {
        return this.#closed !== void 0 || this.#closing;
      }
      /** @private */
      _setClosed(error) {
        if (this.#closed !== void 0) {
          return;
        }
        this.#closed = error;
        if (this.#cursor !== void 0) {
          this.#cursor._setClosed(error);
        }
        this.#client._streamClosed(this);
        for (; ; ) {
          const entry = this.#queue.shift();
          if (entry !== void 0) {
            entry.errorCallback(error);
          } else {
            break;
          }
        }
        if ((this.#baton !== void 0 || this.#flushing) && !this.#closeQueued) {
          this.#queue.push({
            type: "pipeline",
            request: { type: "close" },
            responseCallback: /* @__PURE__ */ __name(() => void 0, "responseCallback"),
            errorCallback: /* @__PURE__ */ __name(() => void 0, "errorCallback")
          });
          this.#closeQueued = true;
          _queueMicrotask(() => this.#flushQueue());
        }
      }
      #pushToQueue(entry) {
        if (this.#closed !== void 0) {
          throw new ClosedError("Stream is closed", this.#closed);
        } else if (this.#closing) {
          throw new ClosedError("Stream is closing", void 0);
        } else {
          this.#queue.push(entry);
          _queueMicrotask(() => this.#flushQueue());
        }
      }
      #flushQueue() {
        if (this.#flushing || this.#cursor !== void 0) {
          return;
        }
        if (this.#closing && this.#queue.length === 0) {
          this._setClosed(new ClientError("Stream was gracefully closed"));
          return;
        }
        const endpoint = this.#client._endpoint;
        if (endpoint === void 0) {
          this.#client._endpointPromise.then(() => this.#flushQueue(), (error) => this._setClosed(error));
          return;
        }
        const firstEntry = this.#queue.shift();
        if (firstEntry === void 0) {
          return;
        } else if (firstEntry.type === "pipeline") {
          const pipeline = [firstEntry];
          for (; ; ) {
            const entry = this.#queue.first();
            if (entry !== void 0 && entry.type === "pipeline") {
              pipeline.push(entry);
              this.#queue.shift();
            } else if (entry === void 0 && this.#closing && !this.#closeQueued) {
              pipeline.push({
                type: "pipeline",
                request: { type: "close" },
                responseCallback: /* @__PURE__ */ __name(() => void 0, "responseCallback"),
                errorCallback: /* @__PURE__ */ __name(() => void 0, "errorCallback")
              });
              this.#closeQueued = true;
              break;
            } else {
              break;
            }
          }
          this.#flushPipeline(endpoint, pipeline);
        } else if (firstEntry.type === "cursor") {
          this.#flushCursor(endpoint, firstEntry);
        } else {
          throw impossible(firstEntry, "Impossible type of QueueEntry");
        }
      }
      #flushPipeline(endpoint, pipeline) {
        this.#flush(() => this.#createPipelineRequest(pipeline, endpoint), (resp) => decodePipelineResponse(resp, endpoint.encoding), (respBody) => respBody.baton, (respBody) => respBody.baseUrl, (respBody) => handlePipelineResponse(pipeline, respBody), (error) => pipeline.forEach((entry) => entry.errorCallback(error)));
      }
      #flushCursor(endpoint, entry) {
        const cursor = new HttpCursor(this, endpoint.encoding);
        this.#cursor = cursor;
        this.#flush(() => this.#createCursorRequest(entry, endpoint), (resp) => cursor.open(resp), (respBody) => respBody.baton, (respBody) => respBody.baseUrl, (_respBody) => entry.cursorCallback(cursor), (error) => entry.errorCallback(error));
      }
      #flush(createRequest, decodeResponse, getBaton, getBaseUrl, handleResponse, handleError) {
        let promise;
        try {
          const request = createRequest();
          const fetch4 = this.#fetch;
          promise = fetch4(request);
        } catch (error) {
          promise = Promise.reject(error);
        }
        this.#flushing = true;
        promise.then((resp) => {
          if (!resp.ok) {
            return errorFromResponse(resp).then((error) => {
              throw error;
            });
          }
          return decodeResponse(resp);
        }).then((r) => {
          this.#baton = getBaton(r);
          this.#baseUrl = getBaseUrl(r) ?? this.#baseUrl;
          handleResponse(r);
        }).catch((error) => {
          this._setClosed(error);
          handleError(error);
        }).finally(() => {
          this.#flushing = false;
          this.#flushQueue();
        });
      }
      #createPipelineRequest(pipeline, endpoint) {
        return this.#createRequest(new URL(endpoint.pipelinePath, this.#baseUrl), {
          baton: this.#baton,
          requests: pipeline.map((entry) => entry.request)
        }, endpoint.encoding, PipelineReqBody, PipelineReqBody2);
      }
      #createCursorRequest(entry, endpoint) {
        if (endpoint.cursorPath === void 0) {
          throw new ProtocolVersionError(`Cursors are supported only on protocol version 3 and higher, but the HTTP server only supports version ${endpoint.version}.`);
        }
        return this.#createRequest(new URL(endpoint.cursorPath, this.#baseUrl), {
          baton: this.#baton,
          batch: entry.batch
        }, endpoint.encoding, CursorReqBody, CursorReqBody2);
      }
      #createRequest(url, reqBody, encoding, jsonFun, protobufFun) {
        let bodyData;
        let contentType;
        if (encoding === "json") {
          bodyData = writeJsonObject(reqBody, jsonFun);
          contentType = "application/json";
        } else if (encoding === "protobuf") {
          bodyData = writeProtobufMessage(reqBody, protobufFun);
          contentType = "application/x-protobuf";
        } else {
          throw impossible(encoding, "Impossible encoding");
        }
        const headers = new import_cross_fetch.Headers();
        headers.set("content-type", contentType);
        if (this.#jwt !== void 0) {
          headers.set("authorization", `Bearer ${this.#jwt}`);
        }
        if (this.#remoteEncryptionKey !== void 0) {
          headers.set("x-turso-encryption-key", this.#remoteEncryptionKey);
        }
        return new import_cross_fetch.Request(url.toString(), { method: "POST", headers, body: bodyData });
      }
    };
    __name(handlePipelineResponse, "handlePipelineResponse");
    __name(decodePipelineResponse, "decodePipelineResponse");
    __name(errorFromResponse, "errorFromResponse");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/http/client.js
async function findEndpoint(customFetch, clientUrl) {
  const fetch4 = customFetch;
  for (const endpoint of checkEndpoints) {
    const url = new URL(endpoint.versionPath, clientUrl);
    const request = new import_cross_fetch2.Request(url.toString(), { method: "GET" });
    const response = await fetch4(request);
    await response.arrayBuffer();
    if (response.ok) {
      return endpoint;
    }
  }
  return fallbackEndpoint;
}
var import_cross_fetch2, checkEndpoints, fallbackEndpoint, HttpClient;
var init_client3 = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/http/client.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    import_cross_fetch2 = __toESM(require_browser_ponyfill(), 1);
    init_client();
    init_errors2();
    init_stream3();
    checkEndpoints = [
      {
        versionPath: "v3-protobuf",
        pipelinePath: "v3-protobuf/pipeline",
        cursorPath: "v3-protobuf/cursor",
        version: 3,
        encoding: "protobuf"
      }
      /*
      {
          versionPath: "v3",
          pipelinePath: "v3/pipeline",
          cursorPath: "v3/cursor",
          version: 3,
          encoding: "json",
      },
      */
    ];
    fallbackEndpoint = {
      versionPath: "v2",
      pipelinePath: "v2/pipeline",
      cursorPath: void 0,
      version: 2,
      encoding: "json"
    };
    HttpClient = class extends Client {
      static {
        __name(this, "HttpClient");
      }
      #url;
      #jwt;
      #fetch;
      #remoteEncryptionKey;
      #closed;
      #streams;
      /** @private */
      _endpointPromise;
      /** @private */
      _endpoint;
      /** @private */
      constructor(url, jwt, customFetch, remoteEncryptionKey, protocolVersion = 2) {
        super();
        this.#url = url;
        this.#jwt = jwt;
        this.#fetch = customFetch ?? import_cross_fetch2.fetch;
        this.#remoteEncryptionKey = remoteEncryptionKey;
        this.#closed = void 0;
        this.#streams = /* @__PURE__ */ new Set();
        if (protocolVersion == 3) {
          this._endpointPromise = findEndpoint(this.#fetch, this.#url);
          this._endpointPromise.then((endpoint) => this._endpoint = endpoint, (error) => this.#setClosed(error));
        } else {
          this._endpointPromise = Promise.resolve(fallbackEndpoint);
          this._endpointPromise.then((endpoint) => this._endpoint = endpoint, (error) => this.#setClosed(error));
        }
      }
      /** Get the protocol version supported by the server. */
      async getVersion() {
        if (this._endpoint !== void 0) {
          return this._endpoint.version;
        }
        return (await this._endpointPromise).version;
      }
      // Make sure that the negotiated version is at least `minVersion`.
      /** @private */
      _ensureVersion(minVersion, feature) {
        if (minVersion <= fallbackEndpoint.version) {
          return;
        } else if (this._endpoint === void 0) {
          throw new ProtocolVersionError(`${feature} is supported only on protocol version ${minVersion} and higher, but the version supported by the HTTP server is not yet known. Use Client.getVersion() to wait until the version is available.`);
        } else if (this._endpoint.version < minVersion) {
          throw new ProtocolVersionError(`${feature} is supported only on protocol version ${minVersion} and higher, but the HTTP server only supports version ${this._endpoint.version}.`);
        }
      }
      /** Open a {@link HttpStream}, a stream for executing SQL statements. */
      openStream() {
        if (this.#closed !== void 0) {
          throw new ClosedError("Client is closed", this.#closed);
        }
        const stream = new HttpStream(this, this.#url, this.#jwt, this.#fetch, this.#remoteEncryptionKey);
        this.#streams.add(stream);
        return stream;
      }
      /** @private */
      _streamClosed(stream) {
        this.#streams.delete(stream);
      }
      /** Close the client and all its streams. */
      close() {
        this.#setClosed(new ClientError("Client was manually closed"));
      }
      /** True if the client is closed. */
      get closed() {
        return this.#closed !== void 0;
      }
      #setClosed(error) {
        if (this.#closed !== void 0) {
          return;
        }
        this.#closed = error;
        for (const stream of Array.from(this.#streams)) {
          stream._setClosed(new ClosedError("Client was closed", error));
        }
      }
    };
    __name(findEndpoint, "findEndpoint");
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/libsql_url.js
var init_libsql_url = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/libsql_url.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_errors2();
  }
});

// ../node_modules/@libsql/hrana-client/lib-esm/index.js
function openWs(url, jwt, protocolVersion = 2) {
  if (typeof _WebSocket === "undefined") {
    throw new WebSocketUnsupportedError("WebSockets are not supported in this environment");
  }
  var subprotocols = void 0;
  if (protocolVersion == 3) {
    subprotocols = Array.from(subprotocolsV3.keys());
  } else {
    subprotocols = Array.from(subprotocolsV2.keys());
  }
  const socket = new _WebSocket(url, subprotocols);
  return new WsClient(socket, jwt);
}
function openHttp(url, jwt, customFetch, remoteEncryptionKey, protocolVersion = 2) {
  return new HttpClient(url instanceof URL ? url : new URL(url), jwt, customFetch, remoteEncryptionKey, protocolVersion);
}
var import_cross_fetch3;
var init_lib_esm = __esm({
  "../node_modules/@libsql/hrana-client/lib-esm/index.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_web();
    init_client2();
    init_errors2();
    init_client3();
    init_client2();
    init_web();
    import_cross_fetch3 = __toESM(require_browser_ponyfill(), 1);
    init_client();
    init_errors2();
    init_batch();
    init_libsql_url();
    init_sql();
    init_stmt();
    init_stream();
    init_client3();
    init_stream3();
    init_client2();
    init_stream2();
    __name(openWs, "openWs");
    __name(openHttp, "openHttp");
  }
});

// ../node_modules/@libsql/client/lib-esm/hrana.js
async function executeHranaBatch(mode, version2, batch, hranaStmts, disableForeignKeys = false) {
  if (disableForeignKeys) {
    batch.step().run("PRAGMA foreign_keys=off");
  }
  const beginStep = batch.step();
  const beginPromise = beginStep.run(transactionModeToBegin(mode));
  let lastStep = beginStep;
  const stmtPromises = hranaStmts.map((hranaStmt) => {
    const stmtStep = batch.step().condition(BatchCond.ok(lastStep));
    if (version2 >= 3) {
      stmtStep.condition(BatchCond.not(BatchCond.isAutocommit(batch)));
    }
    const stmtPromise = stmtStep.query(hranaStmt);
    lastStep = stmtStep;
    return stmtPromise;
  });
  const commitStep = batch.step().condition(BatchCond.ok(lastStep));
  if (version2 >= 3) {
    commitStep.condition(BatchCond.not(BatchCond.isAutocommit(batch)));
  }
  const commitPromise = commitStep.run("COMMIT");
  const rollbackStep = batch.step().condition(BatchCond.not(BatchCond.ok(commitStep)));
  rollbackStep.run("ROLLBACK").catch((_) => void 0);
  if (disableForeignKeys) {
    batch.step().run("PRAGMA foreign_keys=on");
  }
  await batch.execute();
  const resultSets = [];
  await beginPromise;
  for (let i = 0; i < stmtPromises.length; i++) {
    try {
      const hranaRows = await stmtPromises[i];
      if (hranaRows === void 0) {
        throw new LibsqlBatchError("Statement in a batch was not executed, probably because the transaction has been rolled back", i, "TRANSACTION_CLOSED");
      }
      resultSets.push(resultSetFromHrana(hranaRows));
    } catch (e) {
      if (e instanceof LibsqlBatchError) {
        throw e;
      }
      const mappedError = mapHranaError(e);
      if (mappedError instanceof LibsqlError) {
        throw new LibsqlBatchError(mappedError.message, i, mappedError.code, mappedError.extendedCode, mappedError.rawCode, mappedError.cause instanceof Error ? mappedError.cause : void 0);
      }
      throw mappedError;
    }
  }
  await commitPromise;
  return resultSets;
}
function stmtToHrana(stmt) {
  let sql;
  let args;
  if (Array.isArray(stmt)) {
    [sql, args] = stmt;
  } else if (typeof stmt === "string") {
    sql = stmt;
  } else {
    sql = stmt.sql;
    args = stmt.args;
  }
  const hranaStmt = new Stmt(sql);
  if (args) {
    if (Array.isArray(args)) {
      hranaStmt.bindIndexes(args);
    } else {
      for (const [key, value] of Object.entries(args)) {
        hranaStmt.bindName(key, value);
      }
    }
  }
  return hranaStmt;
}
function resultSetFromHrana(hranaRows) {
  const columns = hranaRows.columnNames.map((c) => c ?? "");
  const columnTypes = hranaRows.columnDecltypes.map((c) => c ?? "");
  const rows = hranaRows.rows;
  const rowsAffected = hranaRows.affectedRowCount;
  const lastInsertRowid = hranaRows.lastInsertRowid !== void 0 ? hranaRows.lastInsertRowid : void 0;
  return new ResultSetImpl(columns, columnTypes, rows, rowsAffected, lastInsertRowid);
}
function mapHranaError(e) {
  if (e instanceof ClientError) {
    const code = mapHranaErrorCode(e);
    return new LibsqlError(e.message, code, void 0, void 0, e);
  }
  return e;
}
function mapHranaErrorCode(e) {
  if (e instanceof ResponseError && e.code !== void 0) {
    return e.code;
  } else if (e instanceof ProtoError) {
    return "HRANA_PROTO_ERROR";
  } else if (e instanceof ClosedError) {
    return e.cause instanceof ClientError ? mapHranaErrorCode(e.cause) : "HRANA_CLOSED_ERROR";
  } else if (e instanceof WebSocketError) {
    return "HRANA_WEBSOCKET_ERROR";
  } else if (e instanceof HttpServerError) {
    return "SERVER_ERROR";
  } else if (e instanceof ProtocolVersionError) {
    return "PROTOCOL_VERSION_ERROR";
  } else if (e instanceof InternalError) {
    return "INTERNAL_ERROR";
  } else {
    return "UNKNOWN";
  }
}
var HranaTransaction;
var init_hrana = __esm({
  "../node_modules/@libsql/client/lib-esm/hrana.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_lib_esm();
    init_api();
    init_util();
    HranaTransaction = class {
      static {
        __name(this, "HranaTransaction");
      }
      #mode;
      #version;
      // Promise that is resolved when the BEGIN statement completes, or `undefined` if we haven't executed the
      // BEGIN statement yet.
      #started;
      /** @private */
      constructor(mode, version2) {
        this.#mode = mode;
        this.#version = version2;
        this.#started = void 0;
      }
      execute(stmt) {
        return this.batch([stmt]).then((results) => results[0]);
      }
      async batch(stmts) {
        const stream = this._getStream();
        if (stream.closed) {
          throw new LibsqlError("Cannot execute statements because the transaction is closed", "TRANSACTION_CLOSED");
        }
        try {
          const hranaStmts = stmts.map(stmtToHrana);
          let rowsPromises;
          if (this.#started === void 0) {
            this._getSqlCache().apply(hranaStmts);
            const batch = stream.batch(this.#version >= 3);
            const beginStep = batch.step();
            const beginPromise = beginStep.run(transactionModeToBegin(this.#mode));
            let lastStep = beginStep;
            rowsPromises = hranaStmts.map((hranaStmt) => {
              const stmtStep = batch.step().condition(BatchCond.ok(lastStep));
              if (this.#version >= 3) {
                stmtStep.condition(BatchCond.not(BatchCond.isAutocommit(batch)));
              }
              const rowsPromise = stmtStep.query(hranaStmt);
              rowsPromise.catch(() => void 0);
              lastStep = stmtStep;
              return rowsPromise;
            });
            this.#started = batch.execute().then(() => beginPromise).then(() => void 0);
            try {
              await this.#started;
            } catch (e) {
              this.close();
              throw e;
            }
          } else {
            if (this.#version < 3) {
              await this.#started;
            } else {
            }
            this._getSqlCache().apply(hranaStmts);
            const batch = stream.batch(this.#version >= 3);
            let lastStep = void 0;
            rowsPromises = hranaStmts.map((hranaStmt) => {
              const stmtStep = batch.step();
              if (lastStep !== void 0) {
                stmtStep.condition(BatchCond.ok(lastStep));
              }
              if (this.#version >= 3) {
                stmtStep.condition(BatchCond.not(BatchCond.isAutocommit(batch)));
              }
              const rowsPromise = stmtStep.query(hranaStmt);
              rowsPromise.catch(() => void 0);
              lastStep = stmtStep;
              return rowsPromise;
            });
            await batch.execute();
          }
          const resultSets = [];
          for (let i = 0; i < rowsPromises.length; i++) {
            try {
              const rows = await rowsPromises[i];
              if (rows === void 0) {
                throw new LibsqlBatchError("Statement in a transaction was not executed, probably because the transaction has been rolled back", i, "TRANSACTION_CLOSED");
              }
              resultSets.push(resultSetFromHrana(rows));
            } catch (e) {
              if (e instanceof LibsqlBatchError) {
                throw e;
              }
              const mappedError = mapHranaError(e);
              if (mappedError instanceof LibsqlError) {
                throw new LibsqlBatchError(mappedError.message, i, mappedError.code, mappedError.extendedCode, mappedError.rawCode, mappedError.cause instanceof Error ? mappedError.cause : void 0);
              }
              throw mappedError;
            }
          }
          return resultSets;
        } catch (e) {
          throw mapHranaError(e);
        }
      }
      async executeMultiple(sql) {
        const stream = this._getStream();
        if (stream.closed) {
          throw new LibsqlError("Cannot execute statements because the transaction is closed", "TRANSACTION_CLOSED");
        }
        try {
          if (this.#started === void 0) {
            this.#started = stream.run(transactionModeToBegin(this.#mode)).then(() => void 0);
            try {
              await this.#started;
            } catch (e) {
              this.close();
              throw e;
            }
          } else {
            await this.#started;
          }
          await stream.sequence(sql);
        } catch (e) {
          throw mapHranaError(e);
        }
      }
      async rollback() {
        try {
          const stream = this._getStream();
          if (stream.closed) {
            return;
          }
          if (this.#started !== void 0) {
          } else {
            return;
          }
          const promise = stream.run("ROLLBACK").catch((e) => {
            throw mapHranaError(e);
          });
          stream.closeGracefully();
          await promise;
        } catch (e) {
          throw mapHranaError(e);
        } finally {
          this.close();
        }
      }
      async commit() {
        try {
          const stream = this._getStream();
          if (stream.closed) {
            throw new LibsqlError("Cannot commit the transaction because it is already closed", "TRANSACTION_CLOSED");
          }
          if (this.#started !== void 0) {
            await this.#started;
          } else {
            return;
          }
          const promise = stream.run("COMMIT").catch((e) => {
            throw mapHranaError(e);
          });
          stream.closeGracefully();
          await promise;
        } catch (e) {
          throw mapHranaError(e);
        } finally {
          this.close();
        }
      }
    };
    __name(executeHranaBatch, "executeHranaBatch");
    __name(stmtToHrana, "stmtToHrana");
    __name(resultSetFromHrana, "resultSetFromHrana");
    __name(mapHranaError, "mapHranaError");
    __name(mapHranaErrorCode, "mapHranaErrorCode");
  }
});

// ../node_modules/@libsql/client/lib-esm/sql_cache.js
var SqlCache, Lru;
var init_sql_cache = __esm({
  "../node_modules/@libsql/client/lib-esm/sql_cache.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    SqlCache = class {
      static {
        __name(this, "SqlCache");
      }
      #owner;
      #sqls;
      capacity;
      constructor(owner, capacity) {
        this.#owner = owner;
        this.#sqls = new Lru();
        this.capacity = capacity;
      }
      // Replaces SQL strings with cached `hrana.Sql` objects in the statements in `hranaStmts`. After this
      // function returns, we guarantee that all `hranaStmts` refer to valid (not closed) `hrana.Sql` objects,
      // but _we may invalidate any other `hrana.Sql` objects_ (by closing them, thus removing them from the
      // server).
      //
      // In practice, this means that after calling this function, you can use the statements only up to the
      // first `await`, because concurrent code may also use the cache and invalidate those statements.
      apply(hranaStmts) {
        if (this.capacity <= 0) {
          return;
        }
        const usedSqlObjs = /* @__PURE__ */ new Set();
        for (const hranaStmt of hranaStmts) {
          if (typeof hranaStmt.sql !== "string") {
            continue;
          }
          const sqlText = hranaStmt.sql;
          if (sqlText.length >= 5e3) {
            continue;
          }
          let sqlObj = this.#sqls.get(sqlText);
          if (sqlObj === void 0) {
            while (this.#sqls.size + 1 > this.capacity) {
              const [evictSqlText, evictSqlObj] = this.#sqls.peekLru();
              if (usedSqlObjs.has(evictSqlObj)) {
                break;
              }
              evictSqlObj.close();
              this.#sqls.delete(evictSqlText);
            }
            if (this.#sqls.size + 1 <= this.capacity) {
              sqlObj = this.#owner.storeSql(sqlText);
              this.#sqls.set(sqlText, sqlObj);
            }
          }
          if (sqlObj !== void 0) {
            hranaStmt.sql = sqlObj;
            usedSqlObjs.add(sqlObj);
          }
        }
      }
    };
    Lru = class {
      static {
        __name(this, "Lru");
      }
      // This maps keys to the cache values. The entries are ordered by their last use (entires that were used
      // most recently are at the end).
      #cache;
      constructor() {
        this.#cache = /* @__PURE__ */ new Map();
      }
      get(key) {
        const value = this.#cache.get(key);
        if (value !== void 0) {
          this.#cache.delete(key);
          this.#cache.set(key, value);
        }
        return value;
      }
      set(key, value) {
        this.#cache.set(key, value);
      }
      peekLru() {
        for (const entry of this.#cache.entries()) {
          return entry;
        }
        return void 0;
      }
      delete(key) {
        this.#cache.delete(key);
      }
      get size() {
        return this.#cache.size;
      }
    };
  }
});

// ../node_modules/promise-limit/index.js
var require_promise_limit = __commonJS({
  "../node_modules/promise-limit/index.js"(exports, module) {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    function limiter(count) {
      var outstanding = 0;
      var jobs = [];
      function remove() {
        outstanding--;
        if (outstanding < count) {
          dequeue();
        }
      }
      __name(remove, "remove");
      function dequeue() {
        var job = jobs.shift();
        semaphore.queue = jobs.length;
        if (job) {
          run(job.fn).then(job.resolve).catch(job.reject);
        }
      }
      __name(dequeue, "dequeue");
      function queue(fn) {
        return new Promise(function(resolve, reject) {
          jobs.push({ fn, resolve, reject });
          semaphore.queue = jobs.length;
        });
      }
      __name(queue, "queue");
      function run(fn) {
        outstanding++;
        try {
          return Promise.resolve(fn()).then(function(result) {
            remove();
            return result;
          }, function(error) {
            remove();
            throw error;
          });
        } catch (err) {
          remove();
          return Promise.reject(err);
        }
      }
      __name(run, "run");
      var semaphore = /* @__PURE__ */ __name(function(fn) {
        if (outstanding >= count) {
          return queue(fn);
        } else {
          return run(fn);
        }
      }, "semaphore");
      return semaphore;
    }
    __name(limiter, "limiter");
    function map(items, mapper) {
      var failed = false;
      var limit = this;
      return Promise.all(items.map(function() {
        var args = arguments;
        return limit(function() {
          if (!failed) {
            return mapper.apply(void 0, args).catch(function(e) {
              failed = true;
              throw e;
            });
          }
        });
      }));
    }
    __name(map, "map");
    function addExtras(fn) {
      fn.queue = 0;
      fn.map = map;
      return fn;
    }
    __name(addExtras, "addExtras");
    module.exports = function(count) {
      if (count) {
        return addExtras(limiter(count));
      } else {
        return addExtras(function(fn) {
          return fn();
        });
      }
    };
  }
});

// ../node_modules/@libsql/client/lib-esm/ws.js
function _createClient(config) {
  if (config.scheme !== "wss" && config.scheme !== "ws") {
    throw new LibsqlError(`The WebSocket client supports only "libsql:", "wss:" and "ws:" URLs, got ${JSON.stringify(config.scheme + ":")}. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
  }
  if (config.encryptionKey !== void 0) {
    throw new LibsqlError("Encryption key is not supported by the remote client.", "ENCRYPTION_KEY_NOT_SUPPORTED");
  }
  if (config.scheme === "ws" && config.tls) {
    throw new LibsqlError(`A "ws:" URL cannot opt into TLS by using ?tls=1`, "URL_INVALID");
  } else if (config.scheme === "wss" && !config.tls) {
    throw new LibsqlError(`A "wss:" URL cannot opt out of TLS by using ?tls=0`, "URL_INVALID");
  }
  const url = encodeBaseUrl(config.scheme, config.authority, config.path);
  let client;
  try {
    client = openWs(url, config.authToken);
  } catch (e) {
    if (e instanceof WebSocketUnsupportedError) {
      const suggestedScheme = config.scheme === "wss" ? "https" : "http";
      const suggestedUrl = encodeBaseUrl(suggestedScheme, config.authority, config.path);
      throw new LibsqlError(`This environment does not support WebSockets, please switch to the HTTP client by using a "${suggestedScheme}:" URL (${JSON.stringify(suggestedUrl)}). For more information, please read ${supportedUrlLink}`, "WEBSOCKETS_NOT_SUPPORTED");
    }
    throw mapHranaError(e);
  }
  return new WsClient2(client, url, config.authToken, config.intMode, config.concurrency);
}
var import_promise_limit, maxConnAgeMillis, sqlCacheCapacity, WsClient2, WsTransaction;
var init_ws = __esm({
  "../node_modules/@libsql/client/lib-esm/ws.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_lib_esm();
    init_api();
    init_config();
    init_hrana();
    init_sql_cache();
    init_uri();
    init_util();
    import_promise_limit = __toESM(require_promise_limit(), 1);
    init_api();
    __name(_createClient, "_createClient");
    maxConnAgeMillis = 60 * 1e3;
    sqlCacheCapacity = 100;
    WsClient2 = class {
      static {
        __name(this, "WsClient");
      }
      #url;
      #authToken;
      #intMode;
      // State of the current connection. The `hrana.WsClient` inside may be closed at any moment due to an
      // asynchronous error.
      #connState;
      // If defined, this is a connection that will be used in the future, once it is ready.
      #futureConnState;
      closed;
      protocol;
      #isSchemaDatabase;
      #promiseLimitFunction;
      /** @private */
      constructor(client, url, authToken, intMode, concurrency) {
        this.#url = url;
        this.#authToken = authToken;
        this.#intMode = intMode;
        this.#connState = this.#openConn(client);
        this.#futureConnState = void 0;
        this.closed = false;
        this.protocol = "ws";
        this.#promiseLimitFunction = (0, import_promise_limit.default)(concurrency);
      }
      async limit(fn) {
        return this.#promiseLimitFunction(fn);
      }
      async execute(stmtOrSql, args) {
        let stmt;
        if (typeof stmtOrSql === "string") {
          stmt = {
            sql: stmtOrSql,
            args: args || []
          };
        } else {
          stmt = stmtOrSql;
        }
        return this.limit(async () => {
          const streamState = await this.#openStream();
          try {
            const hranaStmt = stmtToHrana(stmt);
            streamState.conn.sqlCache.apply([hranaStmt]);
            const hranaRowsPromise = streamState.stream.query(hranaStmt);
            streamState.stream.closeGracefully();
            const hranaRowsResult = await hranaRowsPromise;
            return resultSetFromHrana(hranaRowsResult);
          } catch (e) {
            throw mapHranaError(e);
          } finally {
            this._closeStream(streamState);
          }
        });
      }
      async batch(stmts, mode = "deferred") {
        return this.limit(async () => {
          const streamState = await this.#openStream();
          try {
            const normalizedStmts = stmts.map((stmt) => {
              if (Array.isArray(stmt)) {
                return {
                  sql: stmt[0],
                  args: stmt[1] || []
                };
              }
              return stmt;
            });
            const hranaStmts = normalizedStmts.map(stmtToHrana);
            const version2 = await streamState.conn.client.getVersion();
            streamState.conn.sqlCache.apply(hranaStmts);
            const batch = streamState.stream.batch(version2 >= 3);
            const resultsPromise = executeHranaBatch(mode, version2, batch, hranaStmts);
            const results = await resultsPromise;
            return results;
          } catch (e) {
            throw mapHranaError(e);
          } finally {
            this._closeStream(streamState);
          }
        });
      }
      async migrate(stmts) {
        return this.limit(async () => {
          const streamState = await this.#openStream();
          try {
            const hranaStmts = stmts.map(stmtToHrana);
            const version2 = await streamState.conn.client.getVersion();
            const batch = streamState.stream.batch(version2 >= 3);
            const resultsPromise = executeHranaBatch("deferred", version2, batch, hranaStmts, true);
            const results = await resultsPromise;
            return results;
          } catch (e) {
            throw mapHranaError(e);
          } finally {
            this._closeStream(streamState);
          }
        });
      }
      async transaction(mode = "write") {
        return this.limit(async () => {
          const streamState = await this.#openStream();
          try {
            const version2 = await streamState.conn.client.getVersion();
            return new WsTransaction(this, streamState, mode, version2);
          } catch (e) {
            this._closeStream(streamState);
            throw mapHranaError(e);
          }
        });
      }
      async executeMultiple(sql) {
        return this.limit(async () => {
          const streamState = await this.#openStream();
          try {
            const promise = streamState.stream.sequence(sql);
            streamState.stream.closeGracefully();
            await promise;
          } catch (e) {
            throw mapHranaError(e);
          } finally {
            this._closeStream(streamState);
          }
        });
      }
      sync() {
        throw new LibsqlError("sync not supported in ws mode", "SYNC_NOT_SUPPORTED");
      }
      async #openStream() {
        if (this.closed) {
          throw new LibsqlError("The client is closed", "CLIENT_CLOSED");
        }
        const now = /* @__PURE__ */ new Date();
        const ageMillis = now.valueOf() - this.#connState.openTime.valueOf();
        if (ageMillis > maxConnAgeMillis && this.#futureConnState === void 0) {
          const futureConnState = this.#openConn();
          this.#futureConnState = futureConnState;
          futureConnState.client.getVersion().then((_version) => {
            if (this.#connState !== futureConnState) {
              if (this.#connState.streamStates.size === 0) {
                this.#connState.client.close();
              } else {
              }
            }
            this.#connState = futureConnState;
            this.#futureConnState = void 0;
          }, (_e) => {
            this.#futureConnState = void 0;
          });
        }
        if (this.#connState.client.closed) {
          try {
            if (this.#futureConnState !== void 0) {
              this.#connState = this.#futureConnState;
            } else {
              this.#connState = this.#openConn();
            }
          } catch (e) {
            throw mapHranaError(e);
          }
        }
        const connState = this.#connState;
        try {
          if (connState.useSqlCache === void 0) {
            connState.useSqlCache = await connState.client.getVersion() >= 2;
            if (connState.useSqlCache) {
              connState.sqlCache.capacity = sqlCacheCapacity;
            }
          }
          const stream = connState.client.openStream();
          stream.intMode = this.#intMode;
          const streamState = { conn: connState, stream };
          connState.streamStates.add(streamState);
          return streamState;
        } catch (e) {
          throw mapHranaError(e);
        }
      }
      #openConn(client) {
        try {
          client ??= openWs(this.#url, this.#authToken);
          return {
            client,
            useSqlCache: void 0,
            sqlCache: new SqlCache(client, 0),
            openTime: /* @__PURE__ */ new Date(),
            streamStates: /* @__PURE__ */ new Set()
          };
        } catch (e) {
          throw mapHranaError(e);
        }
      }
      async reconnect() {
        try {
          for (const st of Array.from(this.#connState.streamStates)) {
            try {
              st.stream.close();
            } catch {
            }
          }
          this.#connState.client.close();
        } catch {
        }
        if (this.#futureConnState) {
          try {
            this.#futureConnState.client.close();
          } catch {
          }
          this.#futureConnState = void 0;
        }
        const next = this.#openConn();
        const version2 = await next.client.getVersion();
        next.useSqlCache = version2 >= 2;
        if (next.useSqlCache) {
          next.sqlCache.capacity = sqlCacheCapacity;
        }
        this.#connState = next;
        this.closed = false;
      }
      _closeStream(streamState) {
        streamState.stream.close();
        const connState = streamState.conn;
        connState.streamStates.delete(streamState);
        if (connState.streamStates.size === 0 && connState !== this.#connState) {
          connState.client.close();
        }
      }
      close() {
        this.#connState.client.close();
        this.closed = true;
        if (this.#futureConnState) {
          try {
            this.#futureConnState.client.close();
          } catch {
          }
          this.#futureConnState = void 0;
        }
        this.closed = true;
      }
    };
    WsTransaction = class extends HranaTransaction {
      static {
        __name(this, "WsTransaction");
      }
      #client;
      #streamState;
      /** @private */
      constructor(client, state, mode, version2) {
        super(mode, version2);
        this.#client = client;
        this.#streamState = state;
      }
      /** @private */
      _getStream() {
        return this.#streamState.stream;
      }
      /** @private */
      _getSqlCache() {
        return this.#streamState.conn.sqlCache;
      }
      close() {
        this.#client._closeStream(this.#streamState);
      }
      get closed() {
        return this.#streamState.stream.closed;
      }
    };
  }
});

// ../node_modules/@libsql/client/lib-esm/http.js
function _createClient2(config) {
  if (config.scheme !== "https" && config.scheme !== "http") {
    throw new LibsqlError(`The HTTP client supports only "libsql:", "https:" and "http:" URLs, got ${JSON.stringify(config.scheme + ":")}. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
  }
  if (config.encryptionKey !== void 0) {
    throw new LibsqlError("Encryption key is not supported by the remote client.", "ENCRYPTION_KEY_NOT_SUPPORTED");
  }
  if (config.scheme === "http" && config.tls) {
    throw new LibsqlError(`A "http:" URL cannot opt into TLS by using ?tls=1`, "URL_INVALID");
  } else if (config.scheme === "https" && !config.tls) {
    throw new LibsqlError(`A "https:" URL cannot opt out of TLS by using ?tls=0`, "URL_INVALID");
  }
  const url = encodeBaseUrl(config.scheme, config.authority, config.path);
  return new HttpClient2(url, config.authToken, config.intMode, config.fetch, config.concurrency, config.remoteEncryptionKey);
}
var import_promise_limit2, sqlCacheCapacity2, HttpClient2, HttpTransaction;
var init_http = __esm({
  "../node_modules/@libsql/client/lib-esm/http.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_lib_esm();
    init_api();
    init_config();
    init_hrana();
    init_sql_cache();
    init_uri();
    init_util();
    import_promise_limit2 = __toESM(require_promise_limit(), 1);
    init_api();
    __name(_createClient2, "_createClient");
    sqlCacheCapacity2 = 30;
    HttpClient2 = class {
      static {
        __name(this, "HttpClient");
      }
      #client;
      protocol;
      #url;
      #intMode;
      #customFetch;
      #concurrency;
      #authToken;
      #remoteEncryptionKey;
      #promiseLimitFunction;
      /** @private */
      constructor(url, authToken, intMode, customFetch, concurrency, remoteEncryptionKey) {
        this.#url = url;
        this.#authToken = authToken;
        this.#intMode = intMode;
        this.#customFetch = customFetch;
        this.#concurrency = concurrency;
        this.#remoteEncryptionKey = remoteEncryptionKey;
        this.#client = openHttp(this.#url, this.#authToken, this.#customFetch, remoteEncryptionKey);
        this.#client.intMode = this.#intMode;
        this.protocol = "http";
        this.#promiseLimitFunction = (0, import_promise_limit2.default)(this.#concurrency);
      }
      async limit(fn) {
        return this.#promiseLimitFunction(fn);
      }
      async execute(stmtOrSql, args) {
        let stmt;
        if (typeof stmtOrSql === "string") {
          stmt = {
            sql: stmtOrSql,
            args: args || []
          };
        } else {
          stmt = stmtOrSql;
        }
        return this.limit(async () => {
          try {
            const hranaStmt = stmtToHrana(stmt);
            let rowsPromise;
            const stream = this.#client.openStream();
            try {
              rowsPromise = stream.query(hranaStmt);
            } finally {
              stream.closeGracefully();
            }
            const rowsResult = await rowsPromise;
            return resultSetFromHrana(rowsResult);
          } catch (e) {
            throw mapHranaError(e);
          }
        });
      }
      async batch(stmts, mode = "deferred") {
        return this.limit(async () => {
          try {
            const normalizedStmts = stmts.map((stmt) => {
              if (Array.isArray(stmt)) {
                return {
                  sql: stmt[0],
                  args: stmt[1] || []
                };
              }
              return stmt;
            });
            const hranaStmts = normalizedStmts.map(stmtToHrana);
            const version2 = await this.#client.getVersion();
            let resultsPromise;
            const stream = this.#client.openStream();
            try {
              const sqlCache = new SqlCache(stream, sqlCacheCapacity2);
              sqlCache.apply(hranaStmts);
              const batch = stream.batch(false);
              resultsPromise = executeHranaBatch(mode, version2, batch, hranaStmts);
            } finally {
              stream.closeGracefully();
            }
            const results = await resultsPromise;
            return results;
          } catch (e) {
            throw mapHranaError(e);
          }
        });
      }
      async migrate(stmts) {
        return this.limit(async () => {
          try {
            const hranaStmts = stmts.map(stmtToHrana);
            const version2 = await this.#client.getVersion();
            let resultsPromise;
            const stream = this.#client.openStream();
            try {
              const batch = stream.batch(false);
              resultsPromise = executeHranaBatch("deferred", version2, batch, hranaStmts, true);
            } finally {
              stream.closeGracefully();
            }
            const results = await resultsPromise;
            return results;
          } catch (e) {
            throw mapHranaError(e);
          }
        });
      }
      async transaction(mode = "write") {
        return this.limit(async () => {
          try {
            const version2 = await this.#client.getVersion();
            return new HttpTransaction(this.#client.openStream(), mode, version2);
          } catch (e) {
            throw mapHranaError(e);
          }
        });
      }
      async executeMultiple(sql) {
        return this.limit(async () => {
          try {
            let promise;
            const stream = this.#client.openStream();
            try {
              promise = stream.sequence(sql);
            } finally {
              stream.closeGracefully();
            }
            await promise;
          } catch (e) {
            throw mapHranaError(e);
          }
        });
      }
      sync() {
        throw new LibsqlError("sync not supported in http mode", "SYNC_NOT_SUPPORTED");
      }
      close() {
        this.#client.close();
      }
      async reconnect() {
        try {
          if (!this.closed) {
            this.#client.close();
          }
        } finally {
          this.#client = openHttp(this.#url, this.#authToken, this.#customFetch, this.#remoteEncryptionKey);
          this.#client.intMode = this.#intMode;
        }
      }
      get closed() {
        return this.#client.closed;
      }
    };
    HttpTransaction = class extends HranaTransaction {
      static {
        __name(this, "HttpTransaction");
      }
      #stream;
      #sqlCache;
      /** @private */
      constructor(stream, mode, version2) {
        super(mode, version2);
        this.#stream = stream;
        this.#sqlCache = new SqlCache(stream, sqlCacheCapacity2);
      }
      /** @private */
      _getStream() {
        return this.#stream;
      }
      /** @private */
      _getSqlCache() {
        return this.#sqlCache;
      }
      close() {
        this.#stream.close();
      }
      get closed() {
        return this.#stream.closed;
      }
    };
  }
});

// ../node_modules/@libsql/client/lib-esm/web.js
function createClient(config) {
  return _createClient3(expandConfig(config, true));
}
function _createClient3(config) {
  if (config.scheme === "ws" || config.scheme === "wss") {
    return _createClient(config);
  } else if (config.scheme === "http" || config.scheme === "https") {
    return _createClient2(config);
  } else {
    throw new LibsqlError(`The client that uses Web standard APIs supports only "libsql:", "wss:", "ws:", "https:" and "http:" URLs, got ${JSON.stringify(config.scheme + ":")}. For more information, please read ${supportedUrlLink}`, "URL_SCHEME_NOT_SUPPORTED");
  }
}
var init_web2 = __esm({
  "../node_modules/@libsql/client/lib-esm/web.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_api();
    init_config();
    init_util();
    init_ws();
    init_http();
    init_api();
    __name(createClient, "createClient");
    __name(_createClient3, "_createClient");
  }
});

// lib/db.js
function createDatabase(env) {
  const tursoUrl = env.TURSO_CONNECTION_URL;
  const tursoToken = env.TURSO_AUTH_TOKEN;
  if (!tursoUrl || !tursoToken) {
    throw new Error("Missing TURSO_CONNECTION_URL or TURSO_AUTH_TOKEN environment variables");
  }
  return createClient({
    url: tursoUrl,
    authToken: tursoToken
  });
}
async function initializeSchema(database) {
  try {
    const result = await database.execute("SELECT name FROM sqlite_master WHERE type='table'");
    const existingTables = new Set(result.rows.map((r) => r.name));
    if (!existingTables.has("users")) {
      await database.execute(`
        CREATE TABLE users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    if (!existingTables.has("otp_codes")) {
      await database.execute(`
        CREATE TABLE otp_codes (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          code TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    if (!existingTables.has("links")) {
      await database.execute(`
        CREATE TABLE links (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          original_url TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          title TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);
    }
    if (!existingTables.has("channels")) {
      await database.execute(`
        CREATE TABLE channels (
          id TEXT PRIMARY KEY,
          link_id TEXT NOT NULL,
          name TEXT NOT NULL,
          short_url TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (link_id) REFERENCES links (id) ON DELETE CASCADE
        )
      `);
    }
    if (!existingTables.has("clicks")) {
      await database.execute(`
        CREATE TABLE clicks (
          id TEXT PRIMARY KEY,
          link_id TEXT NOT NULL,
          channel_name TEXT,
          referrer TEXT,
          user_agent TEXT,
          ip TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (link_id) REFERENCES links (id) ON DELETE CASCADE
        )
      `);
    }
    if (!existingTables.has("link_tags")) {
      await database.execute(`
        CREATE TABLE link_tags (
          id TEXT PRIMARY KEY,
          link_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (link_id) REFERENCES links (id) ON DELETE CASCADE
        )
      `);
    }
  } catch (error) {
    console.error("Schema initialization error:", error);
  }
}
var init_db = __esm({
  "lib/db.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_web2();
    __name(createDatabase, "createDatabase");
    __name(initializeSchema, "initializeSchema");
  }
});

// index.js
async function onRequest(context) {
  const { request, env } = context;
  console.log(`[API] ${request.method} ${request.url}`);
  try {
    const database = createDatabase(env);
    await initializeSchema(database);
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;
    console.log(`[API] Routing: ${method} ${path}`);
    if (method === "GET" && path === "/api/health") {
      return new Response(JSON.stringify({
        status: "ok",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (method === "POST" && path === "/api/auth/request-otp") {
      return await handleRequestOTP(request, database);
    }
    if (method === "POST" && path === "/api/auth/verify-otp") {
      return await handleVerifyOTP(request, database);
    }
    if (method === "GET" && path === "/api/auth/me") {
      return await handleAuthMe(request, database);
    }
    if (method === "POST" && path === "/api/links") {
      return await handleCreateLink(request, database);
    }
    if (method === "GET" && path === "/api/links") {
      return await handleGetLinks(request, database);
    }
    const linksMatch = path.match(/^\/api\/links\/([^\/]+)$/);
    if (linksMatch) {
      const linkId = linksMatch[1];
      if (method === "GET") {
        return await handleGetLink(request, linkId, database);
      }
      if (method === "PUT") {
        return await handleUpdateLink(request, linkId, database);
      }
      if (method === "DELETE") {
        return await handleDeleteLink(request, linkId, database);
      }
    }
    const analyticsMatch = path.match(/^\/api\/links\/([^\/]+)\/analytics$/);
    if (analyticsMatch && method === "GET") {
      const linkId = analyticsMatch[1];
      return await handleGetAnalytics(request, linkId, database);
    }
    const seoMatch = path.match(/^\/api\/links\/([^\/]+)\/analyze-seo$/);
    if (seoMatch && method === "POST") {
      const linkId = seoMatch[1];
      return await handleAnalyzeSEO(request, linkId, database);
    }
    if (method === "GET" && path !== "/" && !path.startsWith("/api/")) {
      const slug = path.substring(1);
      return await handleRedirect(request, slug, database);
    }
    if (path.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    return;
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function handleRequestOTP(request, database) {
  try {
    const body = await request.json();
    const email = (body.email || "").toString().trim().toLowerCase();
    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const code = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1e3).toISOString();
    const existingUser = await database.prepare("SELECT id FROM users WHERE email = ?").get(email);
    const userId = existingUser?.id || generateId();
    if (!existingUser) {
      await database.prepare("INSERT INTO users (id, email) VALUES (?, ?)").run(userId, email);
    }
    await database.prepare("INSERT INTO otp_codes (id, email, code, expires_at) VALUES (?, ?, ?, ?)").run(generateId(), email, code, expiresAt);
    console.log(`[OTP] ${email}: ${code}`);
    return new Response(JSON.stringify({ success: true, message: "OTP sent to email" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("POST /api/auth/request-otp error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function handleVerifyOTP(request, database) {
  try {
    const body = await request.json();
    const email = (body.email || "").toString().trim().toLowerCase();
    const code = (body.code || "").toString().trim();
    if (!email || !code || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const otpRecord = await database.prepare("SELECT id, expires_at FROM otp_codes WHERE email = ? AND code = ? ORDER BY created_at DESC LIMIT 1").get(email, code);
    if (!otpRecord) {
      console.log("[OTP] No OTP record found for email:", email);
      return new Response(JSON.stringify({ error: "Invalid code" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (new Date(otpRecord.expires_at).getTime() < Date.now()) {
      console.log("[OTP] OTP expired for email:", email);
      return new Response(JSON.stringify({ error: "OTP expired" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    await database.prepare("DELETE FROM otp_codes WHERE id = ?").run(otpRecord.id);
    const user = await database.prepare("SELECT id FROM users WHERE email = ?").get(email);
    if (!user) {
      console.log("[OTP] No user found after OTP verification for email:", email);
      return new Response(JSON.stringify({ error: "No user found" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("[OTP] Creating token for user:", user.id, "Email:", email);
    const token = await new SignJWT({ userId: user.id, email }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("30d").sign(JWT_SECRET);
    console.log("[OTP] Token created successfully");
    return new Response(JSON.stringify({ success: true, token, email }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("POST /api/auth/verify-otp error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function handleAuthMe(request, database) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    console.log("[AUTH] Authorization header:", authHeader ? "Present" : "Missing");
    if (!authHeader.startsWith("Bearer ")) {
      console.log("[AUTH] Failed: Missing or invalid Bearer token");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const token = authHeader.split(" ")[1];
    console.log("[AUTH] Token present:", !!token, "Length:", token?.length);
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      console.log("[AUTH] Token verified successfully. UserID:", payload.userId);
      const user = await database.prepare("SELECT id, email FROM users WHERE id = ?").get(payload.userId);
      if (!user) {
        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      return new Response(JSON.stringify({ user }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      console.log("[AUTH] Token verification failed:", err.message);
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function handleCreateLink(request, database) {
  try {
    const body = await request.json();
    const { original_url, slug: slugInput, title } = body;
    console.log("[POST /api/links] Creating link - URL:", original_url);
    if (!isValidUrl(original_url)) {
      return new Response(JSON.stringify({ error: "Invalid URL" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    let userId = null;
    const authHeader = request.headers.get("authorization") || "";
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
        console.log("[POST /api/links] Authenticated user:", userId);
      } catch (err) {
        console.log("[POST /api/links] Token verification failed, proceeding as guest");
      }
    }
    const id = generateId();
    const slug = slugInput || generateShortId();
    await database.prepare(
      "INSERT INTO links (id, user_id, original_url, slug, title) VALUES (?, ?, ?, ?, ?)"
    ).run(id, userId, original_url, slug, title || null);
    console.log("[POST /api/links] Link inserted - ID:", id, "Slug:", slug, "UserID:", userId || "GUEST");
    const directChannelId = generateId();
    await database.prepare(
      "INSERT INTO channels (id, link_id, name, short_url) VALUES (?, ?, ?, ?)"
    ).run(directChannelId, id, "Direct", slug);
    const qrUrl = `${slug}-qr`;
    const qrChannelId = generateId();
    await database.prepare(
      "INSERT INTO channels (id, link_id, name, short_url) VALUES (?, ?, ?, ?)"
    ).run(qrChannelId, id, "QR", qrUrl);
    console.log("[POST /api/links] Returning response - ID:", id, "Slug:", slug);
    return new Response(JSON.stringify({ id, slug, original_url }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("POST /api/links error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function handleGetLinks(request, database) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    let userId = null;
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const links = await database.prepare(
      "SELECT id, original_url, slug, title FROM links WHERE user_id = ? ORDER BY created_at DESC"
    ).all(userId);
    const linksWithTags = await Promise.all(
      links.map(async (link) => {
        const tags = await database.prepare("SELECT tag FROM link_tags WHERE link_id = ?").all(link.id);
        return {
          ...link,
          tags: tags.map((t) => t.tag)
        };
      })
    );
    return new Response(JSON.stringify(linksWithTags), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("GET /api/links error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function handleGetLink(request, linkId, database) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    let userId = null;
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const link = await database.prepare("SELECT id, original_url, slug, title FROM links WHERE id = ? AND user_id = ?").get(linkId, userId);
    if (!link) {
      return new Response(JSON.stringify({ error: "Link not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const tags = await database.prepare("SELECT tag FROM link_tags WHERE link_id = ?").all(linkId);
    const channels = await database.prepare("SELECT id, name, short_url FROM channels WHERE link_id = ?").all(linkId);
    return new Response(JSON.stringify({
      ...link,
      tags: tags.map((t) => t.tag),
      channels
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("GET /api/links/:id error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function handleUpdateLink(request, linkId, database) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    let userId = null;
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const body = await request.json();
    const { original_url, title, tags } = body;
    const existingLink = await database.prepare("SELECT id FROM links WHERE id = ? AND user_id = ?").get(linkId, userId);
    if (!existingLink) {
      return new Response(JSON.stringify({ error: "Link not found or not owned by user" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    await database.prepare("UPDATE links SET original_url = ?, title = ? WHERE id = ?").run(original_url, title || null, linkId);
    if (tags && Array.isArray(tags)) {
      await database.prepare("DELETE FROM link_tags WHERE link_id = ?").run(linkId);
      for (const tag2 of tags) {
        await database.prepare("INSERT INTO link_tags (id, link_id, tag) VALUES (?, ?, ?)").run(generateId(), linkId, tag2);
      }
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("PUT /api/links/:id error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function handleDeleteLink(request, linkId, database) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    let userId = null;
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const existingLink = await database.prepare("SELECT id FROM links WHERE id = ? AND user_id = ?").get(linkId, userId);
    if (!existingLink) {
      return new Response(JSON.stringify({ error: "Link not found or not owned by user" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    await database.prepare("DELETE FROM links WHERE id = ?").run(linkId);
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("DELETE /api/links/:id error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function handleGetAnalytics(request, linkId, database) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    let userId = null;
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const link = await database.prepare("SELECT id FROM links WHERE id = ? AND user_id = ?").get(linkId, userId);
    if (!link) {
      return new Response(JSON.stringify({ error: "Link not found or not owned by user" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const clicks = await database.prepare("SELECT COUNT(*) as total FROM clicks WHERE link_id = ?").get(linkId);
    const recentClicks = await database.prepare("SELECT created_at, referrer, user_agent FROM clicks WHERE link_id = ? ORDER BY created_at DESC LIMIT 10").all(linkId);
    return new Response(JSON.stringify({
      totalClicks: clicks.total,
      recentClicks
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("GET /api/links/:id/analytics error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function handleAnalyzeSEO(request, linkId, database) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    let userId = null;
    if (authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const { payload } = await jwtVerify(token, JWT_SECRET);
        userId = payload.userId;
      } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid token" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const link = await database.prepare("SELECT id, original_url FROM links WHERE id = ? AND user_id = ?").get(linkId, userId);
    if (!link) {
      return new Response(JSON.stringify({ error: "Link not found or not owned by user" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const seoData = await analyzeUrlSEO(link.original_url);
    return new Response(JSON.stringify(seoData), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("POST /api/links/:id/analyze-seo error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
async function handleRedirect(request, slug, database) {
  try {
    console.log("[REDIRECT] Looking up slug:", slug);
    const channel = await database.prepare("SELECT link_id, name FROM channels WHERE short_url = ?").get(slug);
    if (!channel) {
      console.log("[REDIRECT] Channel not found for slug:", slug);
      return new Response("Link not found", { status: 404 });
    }
    const link = await database.prepare("SELECT original_url FROM links WHERE id = ?").get(channel.link_id);
    if (!link) {
      console.log("[REDIRECT] Link not found for channel:", channel.link_id);
      return new Response("Link not found", { status: 404 });
    }
    const clickId = generateId();
    const referrer = request.headers.get("referer") || null;
    const userAgent = request.headers.get("user-agent") || null;
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || null;
    await database.prepare("INSERT INTO clicks (id, link_id, channel_name, referrer, user_agent, ip) VALUES (?, ?, ?, ?, ?, ?)").run(clickId, channel.link_id, channel.name, referrer, userAgent, ip);
    console.log("[REDIRECT] Redirecting to:", link.original_url);
    return new Response(null, {
      status: 302,
      headers: {
        "Location": link.original_url,
        "Cache-Control": "no-cache"
      }
    });
  } catch (error) {
    console.error("[REDIRECT] Error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
function generateId() {
  const array2 = new Uint8Array(8);
  crypto.getRandomValues(array2);
  return Array.from(array2, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function generateShortId() {
  const array2 = new Uint8Array(4);
  crypto.getRandomValues(array2);
  return Array.from(array2, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function analyzeUrlSEO(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; live.fyi/1.0)"
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const html = await response.text();
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || null;
    const description = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)?.[1]?.trim() || null;
    return {
      title,
      description,
      url
    };
  } catch (error) {
    console.error("SEO analysis error:", error);
    return {
      title: null,
      description: null,
      url
    };
  }
}
var JWT_SECRET;
var init_functions = __esm({
  "index.js"() {
    init_functionsRoutes_0_19109827689537706();
    init_checked_fetch();
    init_browser();
    init_db();
    JWT_SECRET = new TextEncoder().encode("CHANGE_ME_SECRET");
    __name(onRequest, "onRequest");
    __name(handleRequestOTP, "handleRequestOTP");
    __name(handleVerifyOTP, "handleVerifyOTP");
    __name(handleAuthMe, "handleAuthMe");
    __name(handleCreateLink, "handleCreateLink");
    __name(handleGetLinks, "handleGetLinks");
    __name(handleGetLink, "handleGetLink");
    __name(handleUpdateLink, "handleUpdateLink");
    __name(handleDeleteLink, "handleDeleteLink");
    __name(handleGetAnalytics, "handleGetAnalytics");
    __name(handleAnalyzeSEO, "handleAnalyzeSEO");
    __name(handleRedirect, "handleRedirect");
    __name(isValidEmail, "isValidEmail");
    __name(isValidUrl, "isValidUrl");
    __name(generateId, "generateId");
    __name(generateShortId, "generateShortId");
    __name(analyzeUrlSEO, "analyzeUrlSEO");
  }
});

// ../.wrangler/tmp/pages-99jTUL/functionsRoutes-0.19109827689537706.mjs
var routes;
var init_functionsRoutes_0_19109827689537706 = __esm({
  "../.wrangler/tmp/pages-99jTUL/functionsRoutes-0.19109827689537706.mjs"() {
    init_functions();
    routes = [
      {
        routePath: "/",
        mountPath: "/",
        method: "",
        middlewares: [],
        modules: [onRequest]
      }
    ];
  }
});

// ../.wrangler/tmp/bundle-DLCn7T/middleware-loader.entry.ts
init_functionsRoutes_0_19109827689537706();
init_checked_fetch();

// ../.wrangler/tmp/bundle-DLCn7T/middleware-insertion-facade.js
init_functionsRoutes_0_19109827689537706();
init_checked_fetch();

// C:/Users/admin/AppData/Roaming/npm/node_modules/wrangler/templates/pages-template-worker.ts
init_functionsRoutes_0_19109827689537706();
init_checked_fetch();

// C:/Users/admin/AppData/Roaming/npm/node_modules/wrangler/node_modules/path-to-regexp/dist.es2015/index.js
init_functionsRoutes_0_19109827689537706();
init_checked_fetch();
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse2, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode3 = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode3(value, key);
        });
      } else {
        params[key.name] = decode3(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse2(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode3 = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode3(token));
    } else {
      var prefix = escapeString(encode3(token.prefix));
      var suffix = escapeString(encode3(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// C:/Users/admin/AppData/Roaming/npm/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// C:/Users/admin/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
init_functionsRoutes_0_19109827689537706();
init_checked_fetch();
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/admin/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
init_functionsRoutes_0_19109827689537706();
init_checked_fetch();
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-DLCn7T/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// C:/Users/admin/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
init_functionsRoutes_0_19109827689537706();
init_checked_fetch();
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-DLCn7T/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.8453337813851143.mjs.map
