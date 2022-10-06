package file

import (
	"os"
	"path/filepath"
)

// GetCwd Get the current file directory
func GetCwd() string {
	dir, err := os.Getwd()
	if err != nil {
		return ""
	}
	return dir
}

// GetTempDir Get the system temporary directory
func GetTempDir() string {
	return os.TempDir()
}

// GetAbsPath Get absolute path
func GetAbsPath(base, path string) string {
	if base == "" {
		base = GetCwd()
	}
	if !filepath.IsAbs(path) {
		path = filepath.Join(base, path)
	}
	return path
}

// IsDir Determine if it is a directory
func IsDir(path string) bool {
	s, err := os.Stat(path)
	if err != nil {
		return false
	}
	return s.IsDir()
}

// ExistPath Whether the path exists
func ExistPath(p string) (bool, error) {
	_, err := os.Stat(p)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
}
