package client

import (
	"strings"

	"google.golang.org/grpc/metadata"
)

func ParseMds(mds []Metadata) metadata.MD {
	metadata := metadata.Pairs()
	for _, m := range mds {
		if strings.HasSuffix(m.Key, "-bin") {
			metadata.Append(m.Key, m.Value)
		} else {
			metadata.Append(m.Key, m.Value)
		}
	}
	return metadata
}

func ParseMetadata(metadata metadata.MD) []Metadata {
	mds := []Metadata{}
	for key, values := range metadata {
		for _, v := range values {
			mds = append(mds, Metadata{
				Id:    int8(len(mds)),
				Key:   key,
				Value: v,
			})
		}
	}

	return mds
}
