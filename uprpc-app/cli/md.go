package cli

import (
	"strconv"

	gmd "google.golang.org/grpc/metadata"
)

func buildPairs(mds []Metadata) gmd.MD {
	md := gmd.Pairs()
	for _, m := range mds {
		md.Append(m.Key, string(m.Value))
	}
	return md
}

func parsePairs(gMD gmd.MD) []Metadata {
	var mds []Metadata
	for key, values := range gMD {
		for i, v := range values {
			mds = append(mds, Metadata{
				Id:    key + "_" + strconv.Itoa(i),
				Key:   key,
				Value: []byte(v),
			})
		}
	}

	return mds
}
