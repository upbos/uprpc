package logger

import (
	"bytes"
	"io"
	"os"
	"path"
	"runtime"
	"strconv"
	"strings"
	"uprpc/pkg/file"

	nested "github.com/antonfisher/nested-logrus-formatter"
	"github.com/sirupsen/logrus"
	"gopkg.in/natefinch/lumberjack.v2"
)

type Logger struct {
	Level       string
	Target      string
	RollingFile RollingFile
}
type RollingFile struct {
	FileName   string `yaml:"file-name"`   // 文件路径
	MaxSize    int    `yaml:"max-size"`    // 每个日志文件保存的最大尺寸 单位：M
	MaxBackups int    `yaml:"max-backups"` // 日志文件最多保存多少个备份
	MaxAge     int    `yaml:"max-age"`     // 文件最多保存多少天
	Compress   bool   `yaml:"compress"`    // 是否压缩
}

func Setup() {
	var (
		writer   io.Writer = os.Stdout
		noColors           = false
	)
	logger := Logger{
		Level:  "DEBUG",
		Target: "file",
		RollingFile: RollingFile{
			FileName:   path.Join(file.GetHomeDir(), ".uprpc/uprpc.log"),
			MaxSize:    100,
			MaxBackups: 3,
			MaxAge:     15,
			Compress:   true,
		},
	}

	if logger.Target == "file" {
		file := logger.RollingFile
		writer = &lumberjack.Logger{
			Filename:   file.FileName,
			MaxSize:    file.MaxSize,
			MaxBackups: file.MaxBackups,
			MaxAge:     file.MaxAge,
			Compress:   file.Compress,
		}
		noColors = true
	}

	formatter := nested.Formatter{
		TimestampFormat: "2006-01-02 15:04:05",
		NoColors:        noColors,
		ShowFullLevel:   true,
		CallerFirst:     true,
		CustomCallerFormatter: func(frame *runtime.Frame) string {
			b := &bytes.Buffer{}
			b.WriteString(" ")
			b.WriteString(frame.File)
			b.WriteString(":")

			b.WriteString(strconv.Itoa(frame.Line))
			return b.String()
		},
	}

	logrus.SetOutput(writer)
	logrus.SetLevel(getLevel(&logger))
	logrus.SetReportCaller(true)
	logrus.SetFormatter(&formatter)
}

func getLevel(logger *Logger) logrus.Level {
	level := strings.ToLower(logger.Level)
	switch level {
	case "trace":
		return logrus.TraceLevel
	case "debug":
		return logrus.DebugLevel
	case "info":
		return logrus.InfoLevel
	case "warn":
		return logrus.WarnLevel
	default:
		return logrus.ErrorLevel
	}
}
