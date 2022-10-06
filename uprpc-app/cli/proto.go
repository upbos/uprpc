package cli

import (
	"github.com/jhump/protoreflect/desc"
	"github.com/jhump/protoreflect/desc/protoparse"
)

func findMethodDesc(path string, serviceFullyName string, methodName string) (*desc.MethodDescriptor, error) {
	//  parse proto
	p := protoparse.Parser{}
	protoDesc, err := p.ParseFiles(path)
	if err != nil {
		return nil, err
	}
	return protoDesc[0].FindService(serviceFullyName).FindMethodByName(methodName), nil
}
