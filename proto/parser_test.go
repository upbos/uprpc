package proto

import (
	"encoding/json"
	"fmt"
	"testing"
)

func TestParse(t *testing.T) {
	fileName := "../test/helloworld.proto"
	includeDirs := []string{}
	files, _ := Parse([]string{fileName}, includeDirs)
	if str, err := json.Marshal(&files); err == nil {
		fmt.Println(string(str))
	}
}

func TestLookupFile(t *testing.T) {
	filename := "/Users/jason/dev/grpc/proto/fee_model.proto"
	includeDirs := []string{"/Users/jason/dev/grpc/proto/"}
	path := lookupFile(filename, includeDirs)
	fmt.Println(path)
}
