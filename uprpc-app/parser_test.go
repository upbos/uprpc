package main

import (
	"encoding/json"
	"fmt"
	"testing"
)

func TestParse(t *testing.T) {
	fileName := "./test/helloworld.proto"

	parser := Parser{}
	files := parser.Parse([]string{fileName})
	if str, err := json.Marshal(&files); err == nil {
		fmt.Println(string(str))
	}
	//fmt.Println("--------", err.Error())

}
