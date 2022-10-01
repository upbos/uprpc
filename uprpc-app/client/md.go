package client

import (
	"google.golang.org/grpc/metadata"
)

func ParseMds(mds []Metadata) metadata.MD {
	metadata := metadata.Pairs()
	for _, m := range mds {
		metadata.Append(m.Key, string(m.Value))
	}
	return metadata
}

func ParseMetadata(metadata metadata.MD) []Metadata {
	mds := []Metadata{}
	for key, values := range metadata {
		for _, v := range values {
			mds = append(mds, Metadata{
				Id:    int8(len(mds) + 1),
				Key:   key,
				Value: []byte(v),
			})
		}
	}

	return mds
}
