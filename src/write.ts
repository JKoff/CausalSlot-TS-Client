export function makeRequestBody(versions, payload): Uint8Array {
    const ENDIAN = false;  // big endian
    const result = new Uint8Array(8 * 4 + 8 * versions.length + payload.length);
    const dataview = new DataView(result.buffer);
    let i = 0;

    // # Magic number (8 bytes)
    dataview.setBigUint64(i, 0x5662207738999eccn, ENDIAN);
    i += 8;

    // # Protocol version (8 bytes)
    dataview.setBigUint64(i, 0x00000001n, ENDIAN);
    i += 8;

    // # Version count (8 bytes)
    dataview.setBigUint64(i, BigInt(versions.length), ENDIAN);
    i += 8;

    for (const version of versions) {
        // # Version (8 bytes)
        dataview.setBigUint64(i, version, ENDIAN);
        i += 8;
    }

    // # Size (8 bytes)
    dataview.setBigUint64(i, BigInt(payload.length), ENDIAN);
    i += 8;

    // # Data (variable)
    result.set(payload, i);
    i += payload.length;
    
    if (i !== result.length) {
        console.log('Unexpected result length: ', result.length, ", expected ", i);
    }

    return result;
};

export function parseResponse(arraybuffer: ArrayBuffer): BigInt {
    const ENDIAN = false;  // big endian
    const dataview = new DataView(arraybuffer);

    // # New version (8 bytes)
    return dataview.getBigUint64(0, ENDIAN);
}
