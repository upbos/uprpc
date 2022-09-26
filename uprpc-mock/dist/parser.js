"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protobufjs_1 = require("protobufjs");
const uuid_1 = require("uuid");
const path = require("path");
var PROTO_PATH = path.join(__dirname, '../proto/user.proto');
main();
async function main() {
    console.log("Parse proto path: ", PROTO_PATH);
    let root = await (0, protobufjs_1.load)(PROTO_PATH, new protobufjs_1.Root());
    let services = parser(root, "", root.nested);
    console.log("-----------------------");
    console.log(JSON.stringify(services));
    console.log("-----------------------");
}
function parser(root, namespaceName, children) {
    let services = [];
    for (let key in children) {
        let node = children[key];
        if (isNamespace(node)) {
            services.push(...parser(root, namespaceName == "" ? key : namespaceName + '.' + key, node.nested));
        }
        else if (node instanceof protobufjs_1.Service) {
            services.push(parseService(root, namespaceName, node));
        }
    }
    return services;
}
function parseService(root, namespaceName, service) {
    let parsedMethods = [];
    for (let methodName in service.methods) {
        let method = service.methods[methodName];
        let reqType = root.lookupType(method.requestType);
        parsedMethods.push({
            id: (0, uuid_1.v4)(),
            name: methodName,
            requestStream: !!method.requestStream,
            requestBody: parseTypeFields(reqType),
            responseStream: !!method.responseStream,
        });
    }
    return {
        id: (0, uuid_1.v4)(),
        name: service.name,
        namespace: namespaceName,
        methods: parsedMethods
    };
}
function parseTypeFields(type) {
    const fieldsData = {};
    for (let field of type.fieldsArray) {
        fieldsData[field.name] = field.repeated ? [parseField(field)] : parseField(field);
    }
    return fieldsData;
}
function parseField(field) {
    if (field instanceof protobufjs_1.MapField) {
        let v;
        if (field.resolvedType instanceof protobufjs_1.Type) {
            v = parseTypeFields(field.resolvedType);
        }
        else if (field.resolvedType instanceof protobufjs_1.Enum) {
            v = parseEnum(field.resolvedType);
        }
        else {
            v = parseScalar(field.type);
        }
        return { [parseScalar(field.keyType)]: v };
    }
    if (field.resolvedType instanceof protobufjs_1.Type) {
        if (field.resolvedType.oneofs) {
            return pickOneOf(field.resolvedType.oneofsArray);
        }
        return parseTypeFields(field.resolvedType);
    }
    else if (field.resolvedType instanceof protobufjs_1.Enum) {
        return parseEnum(field.resolvedType);
    }
    const propertyValue = parseScalar(field.type);
    if (propertyValue == null) {
        const resolvedField = field.resolve();
        return parseField(resolvedField);
    }
    else {
        return propertyValue;
    }
}
function parseEnum(enumType) {
    const enumKey = Object.keys(enumType.values)[0];
    return enumType.values[enumKey];
}
function pickOneOf(oneofs) {
    return oneofs.reduce((fields, oneOf) => {
        fields[oneOf.name] = parseField(oneOf.fieldsArray[0]);
        return fields;
    }, {});
}
function parseScalar(type) {
    let map = {
        'string': '',
        'number': 1,
        'bool': true,
        'int32': 3200,
        'int64': 6400,
        'uint32': 32000,
        'uint64': 64000,
        'sint32': 320,
        'sint64': 640,
        'fixed32': 3200,
        'fixed64': 64000,
        'sfixed32': 320,
        'sfixed64': 640,
        'double': 3.141592,
        'float': 5.512322,
        'bytes': Buffer.from([])
    };
    return map[type];
}
function isNamespace(lookupType) {
    return (lookupType instanceof protobufjs_1.Namespace) &&
        !(lookupType instanceof protobufjs_1.Method) &&
        !(lookupType instanceof protobufjs_1.Service) &&
        !(lookupType instanceof protobufjs_1.Type) &&
        !(lookupType instanceof protobufjs_1.Enum) &&
        !(lookupType instanceof protobufjs_1.Field) &&
        !(lookupType instanceof protobufjs_1.MapField) &&
        !(lookupType instanceof protobufjs_1.OneOf);
}
//# sourceMappingURL=parser.js.map