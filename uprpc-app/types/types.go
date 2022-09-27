package types

type RequestData struct {
	Id          string `json:"id"`
	ProtoPath   string `json:"protoPath"`
	Namespace   string `json:"namespace"`
	ServiceName string `json:"serviceName"`
	MethodName  string `json:"methodName"`
	MethodMode  Mode   `json:"methodMode"`
	Host        string `json:"host"`
	Body        string `json:"body"`
	Mds         string `json:"mds"`
	IncludeDirs string `json:"IncludeDirs"`
}

type ResponseData struct {
	Id   string `json:"id"`
	Body string `json:"body"`
	Mds  string `json:"mds"`
}

type Mode int

const (
	Unary Mode = iota
	ClientStream
	ServerStream
	BidirectionalStream
)
