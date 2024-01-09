export function parse(arraybuffer: ArrayBuffer): ({ vsn: BigInt, dat: ArrayBuffer })[] {
    const ENDIAN = false;  // big endian
    const dataview = new DataView(arraybuffer);

    const result: ({ vsn: BigInt, dat: ArrayBuffer })[] = [];
    let i = 0;

    // # Magic number (8 bytes)
    const magic = dataview.getBigUint64(i, ENDIAN);
    i += 8;
    if (magic !== 0x5662207738999eccn) {
        throw new Error('Invalid magic number');
    }

    // # Protocol version (8 bytes)
    const protovsn = dataview.getBigUint64(i, ENDIAN);
    i += 8;
    if (protovsn !== 0x00000001n) {
        throw new Error('Invalid protocol version number');
    }

    while (i < arraybuffer.byteLength) {
        const size = dataview.getBigUint64(i, ENDIAN);
        i += 8;
        const vsn = dataview.getBigUint64(i, ENDIAN);
        i += 8;
        const dat = arraybuffer.slice(i, i + Number(size) - 8);
        i += Number(size) - 8;
        result.push({ vsn, dat });
    }

    return result;
}
