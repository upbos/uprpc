package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	dpb "github.com/golang/protobuf/protoc-gen-go/descriptor"
	"github.com/jhump/protoreflect/desc"
	"github.com/jhump/protoreflect/desc/protoparse"
	uuid "github.com/satori/go.uuid"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"path"
)

var b2i = map[bool]int8{false: 0, true: 1}

type File struct {
	Id      string    `json:"id"`
	Name    string    `json:"name"`
	Path    string    `json:"path"`
	Methods []*Method `json:"methods"`
}

type Method struct {
	Id               string     `json:"id,omitempty"`
	ServiceName      string     `json:"serviceName,omitempty"`
	ServiceFullyName string     `json:"serviceFullyName,omitempty"`
	Name             string     `json:"name,omitempty"`
	Mode             int8       `json:"mode,omitempty"`
	RequestBody      string     `json:"requestBody,omitempty"`
	RequestMds       []Metadata `json:"requestMds,omitempty"`
	ResponseMds      []Metadata `json:"responseMds,omitempty"`
}

type Metadata struct {
	Id        int8   `json:"id,omitempty"`
	Key       string `json:"key,omitempty"`
	Value     string `json:"value,omitempty"`
	ParseType int8   `json:"parseType,omitempty"`
}

type Parser struct {
	ctx context.Context
}

func NewParser() *Parser {
	return &Parser{}
}

func (p *Parser) startup(ctx context.Context) {
	p.ctx = ctx
}

func (p *Parser) ImportFile() []string {
	selection, _ := runtime.OpenMultipleFilesDialog(p.ctx, runtime.OpenDialogOptions{
		Title: "Import File",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "proto (*.proto)",
				Pattern:     "*.proto",
			},
		},
	})

	return selection
}

func (p *Parser) Parse(fileNames []string) []*File {
	// 创建parser对象
	parser := protoparse.Parser{}
	// 使用path的方式解析得到一些列文件描述对象，这里只有一个文件描述对象
	fileDescs, err := parser.ParseFiles(fileNames...)
	if err != nil {
		fmt.Printf("parse proto file failed, err = %s", err.Error())
		return nil
	}

	var files []*File
	for i, fileDesc := range fileDescs {
		file := File{Id: uuid.NewV4().String(), Name: path.Base(fileNames[i]), Path: fileNames[i]}
		services := fileDesc.GetServices()
		file.Methods = parseMethod(services)
		files = append(files, &file)
	}
	return files
}

func parseMethod(services []*desc.ServiceDescriptor) []*Method {
	var methods []*Method
	for _, service := range services {
		for _, method := range service.GetMethods() {
			fieldValue := parseMessageFields(method.GetInputType())
			str, err := json.Marshal(&fieldValue)
			if err != nil {
				fmt.Println(err)
			}

			m := &Method{
				Id:               uuid.NewV4().String(),
				ServiceName:      service.GetName(),
				ServiceFullyName: service.GetFullyQualifiedName(),
				Name:             method.GetName(),
				Mode:             b2i[method.IsServerStreaming()]<<1 | b2i[method.IsClientStreaming()],
				RequestBody:      string(str),
				RequestMds:       nil,
				ResponseMds:      nil,
			}
			methods = append(methods, m)
		}
	}
	return methods
}

func parseMessageFields(messageDesc *desc.MessageDescriptor) interface{} {
	fieldsData := map[string]interface{}{}
	for _, field := range messageDesc.GetFields() {
		if field.IsRepeated() && !field.IsMap() {
			fieldsData[field.GetName()] = []interface{}{parseField(field)}
		} else {
			fieldsData[field.GetName()] = parseField(field)
		}
	}
	return fieldsData
}

func parseField(field *desc.FieldDescriptor) interface{} {
	if field.GetOneOf() != nil {
		return parseField(field.GetOneOf().GetChoices()[0])
	}

	if field.IsMap() {
		var v interface{}
		if field.GetMapValueType().GetType() == dpb.FieldDescriptorProto_TYPE_MESSAGE {
			v = parseMessageFields(field.GetMapValueType().GetMessageType())
		} else {
			v = parseField(field.GetMapValueType())
		}
		if field.GetMapKeyType().GetType() == dpb.FieldDescriptorProto_TYPE_STRING {
			return map[string]interface{}{"key": v}
		} else {
			return map[int]interface{}{32: v}
		}
	}

	switch field.GetType() {
	case dpb.FieldDescriptorProto_TYPE_MESSAGE:
		return parseMessageFields(field.GetMessageType())
	case dpb.FieldDescriptorProto_TYPE_ENUM:
		return field.GetEnumType().GetValues()[0].GetNumber()
	default:
		return getValue(field.GetType())
	}
}

func getValue(fieldType dpb.FieldDescriptorProto_Type) interface{} {
	switch fieldType {
	case dpb.FieldDescriptorProto_TYPE_DOUBLE:
		return 3.141592
	case dpb.FieldDescriptorProto_TYPE_FLOAT:
		return 5.512322
	case dpb.FieldDescriptorProto_TYPE_INT64:
		return 6400
	case dpb.FieldDescriptorProto_TYPE_UINT64:
		return 64000
	case dpb.FieldDescriptorProto_TYPE_INT32:
		return 3200
	case dpb.FieldDescriptorProto_TYPE_FIXED32:
		return 3200
	case dpb.FieldDescriptorProto_TYPE_FIXED64:
		return 6400
	case dpb.FieldDescriptorProto_TYPE_BOOL:
		return true
	case dpb.FieldDescriptorProto_TYPE_STRING:
		return ""
	case dpb.FieldDescriptorProto_TYPE_UINT32:
		return 32000
	case dpb.FieldDescriptorProto_TYPE_BYTES:
		return bytes.Buffer{}
	case dpb.FieldDescriptorProto_TYPE_SFIXED32:
		return 320
	case dpb.FieldDescriptorProto_TYPE_SFIXED64:
		return 640
	case dpb.FieldDescriptorProto_TYPE_SINT32:
		return 320
	case dpb.FieldDescriptorProto_TYPE_SINT64:
		return 640
	default:
		return nil
	}
}
