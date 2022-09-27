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
	//fmt.Println("--------", err.Error())

}
