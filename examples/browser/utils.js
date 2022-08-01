export async function deriveKey(password, salt = new Uint8Array(0), extractable = false) {
    const keyMaterial = await getKeyMaterial(password);

    return await window.crypto.subtle.deriveKey(
        {
            "name": "PBKDF2",
            salt: (salt === new Uint8Array(0) ? new TextEncoder().encode('') : salt),
            "iterations": 1000000,
            "hash": "SHA-256"
        },
        keyMaterial,
        { "name": "AES-CTR", "length": 256},
        extractable,
        [ "encrypt", "decrypt" ]
    );
}

export function encryptMessage(key, counter, message) {
    // counter will be needed for decryption
    return window.crypto.subtle.encrypt(
        {
            name: "AES-CTR",
            counter,
            length: 64
        },
        key,
        message
    );
}

export function decryptMessage(key, counter, ciphertext) {
  return window.crypto.subtle.decrypt(
    {
      name: "AES-CTR",
      counter,
      length: 64
    },
    key,
    ciphertext
  );
}

export async function getKeyMaterial(password) {

    return await window.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
    );
}

const counter = new Uint8Array([
    248,
    255,
    58,
    185,
    239,
    243,
    194,
    187,
    251,
    25,
    62,
    37,
    136,
    45,
    242,
    73
]);

export class EncryptionStream extends TransformStream {
    constructor(key) {
        super({
            start() {},
            async transform(chunk, controller) {
                
                if (chunk === null) {
                    controller.terminate();
                }
                chunk = await chunk;
                chunk = await encryptMessage(key, counter, chunk);
                chunk = new Uint8Array(chunk);

                controller.enqueue(chunk);
            },
            flush() {}
        });
    }
}

export class DecryptionStream extends TransformStream {
    constructor(key) {
        super({
            start() {},
            async transform(chunk, controller) {
                
                if (chunk === null) {
                    controller.terminate();
                }
                chunk = await chunk;
                chunk = await decryptMessage(key, counter, chunk);
                chunk = new Uint8Array(chunk);

                controller.enqueue(chunk);
            },
            flush() {}
        });
    }
}

export {counter};