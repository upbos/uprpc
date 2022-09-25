import {ParseType} from "@/types/types";

export function encode(value: any, parseType: number) {
    if (ParseType.Text == parseType) {
        return new TextEncoder().encode(value);
    }

    let view = new DataView(new ArrayBuffer(16));
    switch (parseType) {
        // case ParseType.IntLE:
        // case ParseType.IntBE:
        case ParseType.Int8:
            view.setInt8(0, value);
            break;
        case ParseType.Int16LE:
            view.setInt16(0, value, true);
            break;
        case ParseType.Int16BE:
            view.setInt16(0, value, false);
            break;
        case ParseType.Int32LE:
            view.setInt32(0, value, true);
            break;
        case ParseType.Int32BE:
            view.setInt32(0, value, false);
            break;
        case ParseType.FloatLE:
            view.setFloat32(0, value, true);
            break;
        case ParseType.FloatBE:
            view.setFloat32(0, value, false);
            break;
        case ParseType.DoubleLE:
            view.setFloat64(0, value, true);
            break;
        case ParseType.DoubleBE:
            view.setFloat64(0, value, false);
            break;
        // case ParseType.UintLE:
        // case ParseType.UintBE:
        case ParseType.Uint8:
            view.setUint8(0, value);
            break;
        case ParseType.Uint16LE:
            view.setUint16(0, value, true);
            break;
        case ParseType.Uint16BE:
            view.setUint16(0, value, false);
            break;
        case ParseType.Uint32LE:
            view.setUint32(0, value, true);
            break;
        case ParseType.Uint32BE:
            view.setUint32(0, value, false);
            break;
        case ParseType.BigInt64LE:
            view.setBigInt64(0, value, true);
            break;
        case ParseType.BigInt64BE:
            view.setBigInt64(0, value, false);
            break;
        case ParseType.BigUint64LE:
            view.setBigUint64(0, value, true);
            break;
        case ParseType.BigUint64BE:
            view.setBigInt64(0, value, false);
            break;
    }
    return view;
}

export function decode(value: any, parseType: number): any {
    if (ParseType.Text == parseType) {
        return new TextDecoder().decode(value);
    }

    const view = new DataView(value.buffer, value.byteOffset, value.byteLength);
    try {
        switch (parseType) {
            // case ParseType.IntLE:
            // case ParseType.IntBE:
            case ParseType.Int8:
                return view.getInt8(0).toString();
            case ParseType.Int16LE:
                return view.getInt16(0, true).toString();
            case ParseType.Int16BE:
                return view.getInt16(0, false).toString();
            case ParseType.Int32LE:
                return view.getInt32(0, true).toString();
            case ParseType.Int32BE:
                return view.getInt32(0, false).toString();
            case ParseType.FloatLE:
                return view.getFloat32(0, true).toString();
            case ParseType.FloatBE:
                return view.getFloat32(0, false).toString();
            case ParseType.DoubleLE:
                return view.getFloat64(0, true).toString();
            case ParseType.DoubleBE:
                return view.getFloat64(0, false).toString();
            // case ParseType.UintLE:
            // case ParseType.UintBE:
            case ParseType.Uint8:
                return view.getUint8(0).toString();
            case ParseType.Uint16LE:
                return view.getUint16(0, true).toString();
            case ParseType.Uint16BE:
                return view.getUint16(0, false).toString();
            case ParseType.Uint32LE:
                return view.getUint32(0, true).toString();
            case ParseType.Uint32BE:
                return view.getUint32(0, false).toString();
            case ParseType.BigInt64LE:
                return view.getBigInt64(0, true).toString().toString();
            case ParseType.BigInt64BE:
                return view.getBigInt64(0, false).toString();
            case ParseType.BigUint64LE:
                return view.getBigUint64(0, true).toString();
            case ParseType.BigUint64BE:
                return view.getBigInt64(0, false).toString();
            default:
                return "[Buffer ... " + value.length + " bytes]";
        }
    } catch (e) {
        return "decode error";
    }
}
