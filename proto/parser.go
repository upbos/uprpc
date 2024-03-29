package proto

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path"
	"path/filepath"
	"syscall"
	"uprpc/pkg/file"

	osruntime "runtime"

	dpb "github.com/golang/protobuf/protoc-gen-go/descriptor"
	"github.com/jhump/protoreflect/desc"
	"github.com/jhump/protoreflect/desc/protoparse"
	uuid "github.com/satori/go.uuid"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var b2i = map[bool]int8{false: 0, true: 1}

type File struct {
	Id      string    `json:"id"`
	Host    string    `json:"host"`
	Name    string    `json:"name"`
	Path    string    `json:"path"`
	Methods []*Method `json:"methods"`
}

type Method struct {
	Id               string     `json:"id,omitempty"`
	ServiceName      string     `json:"serviceName,omitempty"`
	ServiceFullyName string     `json:"serviceFullyName,omitempty"`
	Name             string     `json:"name,omitempty"`
	Mode             int8       `json:"mode"`
	RequestBody      string     `json:"requestBody,omitempty"`
	RequestMds       []Metadata `json:"requestMds,omitempty"`
	ResponseMds      []Metadata `json:"responseMds,omitempty"`
}

type Metadata struct {
	Id        string `json:"id,omitempty"`
	Key       string `json:"key,omitempty"`
	Value     string `json:"value,omitempty"`
	ParseType int8   `json:"parseType,omitempty"`
}

func OpenIncludeDir(ctx context.Context) string {
	selection, _ := runtime.OpenDirectoryDialog(ctx, runtime.OpenDialogOptions{
		Title: "Import IncludeDirs",
	})
	return selection
}

func ImportFile(ctx context.Context) []string {
	selection, _ := runtime.OpenMultipleFilesDialog(ctx, runtime.OpenDialogOptions{
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

func Parse(fileNames, includeDirs []string) ([]*File, error) {
	var files []*File
	for _, fileName := range fileNames {
		file, err := parseFile(fileName, includeDirs)
		if err != nil {
			return nil, err
		}
		if len(file.Methods) > 0 {
			files = append(files, file)
		}
	}
	return files, nil
}

func parseFile(protoPath string, includeDirs []string) (*File, error) {
	fmt.Printf("parse proto file name: %+v, include dirs: %+v\n", protoPath, includeDirs)

	// 创建parser对象
	parser := protoparse.Parser{}
	parser.Accessor = func(filename string) (io.ReadCloser, error) {
		fmt.Printf("Accessor filename: %v \n", filename)
		lookupFile := lookupFile(filename, append(includeDirs, path.Dir(protoPath)))
		return os.OpenFile(lookupFile, syscall.O_RDONLY, 0)
	}

	// 使用path的方式解析得到一些列文件描述对象，这里只有一个文件描述对象
	fileDescs, err := parser.ParseFiles(protoPath)
	if err != nil {
		fmt.Printf("parse proto file failed, error:  %s\n", err.Error())
		return nil, err
	}

	if osruntime.GOOS == "windows" {
		protoPath = filepath.ToSlash(protoPath)
	}

	file := File{Id: uuid.NewV4().String(), Host: "127.0.0.1:9000", Name: path.Base(protoPath), Path: protoPath}
	services := fileDescs[0].GetServices()
	file.Methods = parseMethod(services)

	return &file, nil
}

func lookupFile(fileName string, includeDirs []string) string {
	fmt.Printf("lookupFile includeDirs: %v\n", includeDirs)
	for _, dir := range includeDirs {
		joinFile := path.Join(dir, fileName)
		if ok, _ := file.ExistPath(joinFile); ok {
			return joinFile
		}
	}
	return fileName
}

func parseMethod(services []*desc.ServiceDescriptor) []*Method {
	var methods = []*Method{}
	for _, service := range services {
		for _, method := range service.GetMethods() {
			fieldValue := parseMessageFields(method.GetInputType())
			str, err := json.MarshalIndent(&fieldValue, "", "\t")
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

	if field.GetOneOf() != nil && getValue(field.GetType()) == nil {
		return parseField(field.GetOneOf().GetChoices()[0])
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
