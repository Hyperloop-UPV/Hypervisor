package presentation_test

import (
	"bytes"
	"encoding/binary"
	"io"
	"math"
	"reflect"
	"testing"
	"time"

	"github.com/HyperloopUPV-H8/h9-backend/pkg/abstraction"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/transport/packet/data"
	"github.com/HyperloopUPV-H8/h9-backend/pkg/transport/presentation"
	"github.com/rs/zerolog"
)

func TestDecoder(t *testing.T) {
	type testcase struct {
		name   string
		input  io.Reader
		output []abstraction.Packet
	}

	endianness := binary.LittleEndian

	testcases := []testcase{
		{
			name: "data",
			input: bytes.NewReader(join(
				[]byte{0x09, 0x00},
				toBinary(uint8(8), endianness),
				toBinary(uint16(8), endianness),
				toBinary(uint32(8), endianness),
				toBinary(uint64(8), endianness),
				[]byte{0x0a, 0x00},
				toBinary(int8(8), endianness),
				toBinary(int16(8), endianness),
				toBinary(int32(8), endianness),
				toBinary(int64(8), endianness),
				[]byte{0x0b, 0x00},
				toBinary(float32(8), endianness),
				toBinary(float64(8), endianness),
				[]byte{0x0c, 0x00},
				[]byte{0x01},
				[]byte{0x0d, 0x00},
				toBinary(uint8(2), endianness),
				[]byte{0x0e, 0x00},
				toBinary(uint8(8), endianness),
				toBinary(uint8(8), endianness),
				toBinary(float64(8), endianness),
				[]byte{0x01},
				toBinary(uint8(0), endianness),
				[]byte{0x0f, 0x00},
				[]byte{0x01},
				[]byte{0x00},
				[]byte{0x00},
				[]byte{0x10, 0x00},
				toBinary(uint8(1), endianness),
				toBinary(uint8(0), endianness),
				toBinary(uint8(3), endianness),
				toBinary(uint8(2), endianness),
				toBinary(uint8(7), endianness),
				[]byte{0x11, 0x00},
				toBinary(uint8(8), endianness),
				toBinary(uint8(8), endianness),
				toBinary(uint8(8), endianness),
				toBinary(uint8(8), endianness),
				toBinary(uint8(8), endianness),
				toBinary(uint8(8), endianness),
				toBinary(uint8(8), endianness),
				toBinary(uint8(8), endianness),
				toBinary(uint8(8), endianness),
				toBinary(uint8(8), endianness),
				[]byte{0x12, 0x00},
				toBinary(uint64(8), endianness),
				toBinary(int64(8), endianness),
				toBinary(float64(8), endianness),
				toBinary(uint64(8), endianness),
				toBinary(int64(8), endianness),
				toBinary(float64(8), endianness),
				toBinary(uint64(8), endianness),
				toBinary(int64(8), endianness),
				toBinary(float64(8), endianness),
				toBinary(uint64(8), endianness),
				toBinary(int64(8), endianness),
				toBinary(float64(8), endianness),
				toBinary(uint64(8), endianness),
				toBinary(int64(8), endianness),
				toBinary(float64(8), endianness),
				toBinary(uint64(8), endianness),
				toBinary(int64(8), endianness),
				toBinary(float64(8), endianness),
			)),
			output: []abstraction.Packet{
				data.NewPacketWithValues(9, map[data.ValueName]data.Value{
					"uint8":  data.NewNumericValue[uint8](8),
					"uint16": data.NewNumericValue[uint16](8),
					"uint32": data.NewNumericValue[uint32](8),
					"uint64": data.NewNumericValue[uint64](8),
				}, map[data.ValueName]bool{
					"uint8":  true,
					"uint16": true,
					"uint32": true,
					"uint64": true,
				}),
				data.NewPacketWithValues(10, map[data.ValueName]data.Value{
					"int8":  data.NewNumericValue[int8](8),
					"int16": data.NewNumericValue[int16](8),
					"int32": data.NewNumericValue[int32](8),
					"int64": data.NewNumericValue[int64](8),
				}, map[data.ValueName]bool{
					"int8":  true,
					"int16": true,
					"int32": true,
					"int64": true,
				}),
				data.NewPacketWithValues(11, map[data.ValueName]data.Value{
					"float32": data.NewNumericValue[float32](8),
					"float64": data.NewNumericValue[float64](8),
				}, map[data.ValueName]bool{
					"float32": true,
					"float64": true,
				}),
				data.NewPacketWithValues(12, map[data.ValueName]data.Value{
					"bool": data.NewBooleanValue(true),
				}, map[data.ValueName]bool{
					"bool": true,
				}),
				data.NewPacketWithValues(13, map[data.ValueName]data.Value{
					"enum": data.NewEnumValue("c"),
				}, map[data.ValueName]bool{
					"enum": true,
				}),
				data.NewPacketWithValues(14, map[data.ValueName]data.Value{
					"uint8_1": data.NewNumericValue[uint8](8),
					"uint8_2": data.NewNumericValue[uint8](8),
					"float64": data.NewNumericValue[float64](8),
					"bool":    data.NewBooleanValue(true),
					"enum":    data.NewEnumValue("a"),
				}, map[data.ValueName]bool{
					"uint8_1": true,
					"uint8_2": true,
					"float64": true,
					"bool":    true,
					"enum":    true,
				}),
				data.NewPacketWithValues(15, map[data.ValueName]data.Value{
					"bool_1": data.NewBooleanValue(true),
					"bool_2": data.NewBooleanValue(false),
					"bool_3": data.NewBooleanValue(false),
				}, map[data.ValueName]bool{
					"bool_1": true,
					"bool_2": true,
					"bool_3": true,
				}),
				data.NewPacketWithValues(16, map[data.ValueName]data.Value{
					"enum_1": data.NewEnumValue("b"),
					"enum_2": data.NewEnumValue("a"),
					"enum_3": data.NewEnumValue("d"),
					"enum_4": data.NewEnumValue("c"),
					"enum_5": data.NewEnumValue("h"),
				}, map[data.ValueName]bool{
					"enum_1": true,
					"enum_2": true,
					"enum_3": true,
					"enum_4": true,
					"enum_5": true,
				}),
				data.NewPacketWithValues(17, map[data.ValueName]data.Value{
					"uint8_1":  data.NewNumericValue[uint8](8),
					"uint8_2":  data.NewNumericValue[uint8](8),
					"uint8_3":  data.NewNumericValue[uint8](8),
					"uint8_4":  data.NewNumericValue[uint8](8),
					"uint8_5":  data.NewNumericValue[uint8](8),
					"uint8_6":  data.NewNumericValue[uint8](8),
					"uint8_7":  data.NewNumericValue[uint8](8),
					"uint8_8":  data.NewNumericValue[uint8](8),
					"uint8_9":  data.NewNumericValue[uint8](8),
					"uint8_10": data.NewNumericValue[uint8](8),
				}, map[data.ValueName]bool{
					"uint8_1":  true,
					"uint8_2":  true,
					"uint8_3":  true,
					"uint8_4":  true,
					"uint8_5":  true,
					"uint8_6":  true,
					"uint8_7":  true,
					"uint8_8":  true,
					"uint8_9":  true,
					"uint8_10": true,
				}),
				data.NewPacketWithValues(18, map[data.ValueName]data.Value{
					"uint64_1":  data.NewNumericValue[uint64](8),
					"int64_1":   data.NewNumericValue[int64](8),
					"float64_1": data.NewNumericValue[float64](8),
					"uint64_2":  data.NewNumericValue[uint64](8),
					"int64_2":   data.NewNumericValue[int64](8),
					"float64_2": data.NewNumericValue[float64](8),
					"uint64_3":  data.NewNumericValue[uint64](8),
					"int64_3":   data.NewNumericValue[int64](8),
					"float64_3": data.NewNumericValue[float64](8),
					"uint64_4":  data.NewNumericValue[uint64](8),
					"int64_4":   data.NewNumericValue[int64](8),
					"float64_4": data.NewNumericValue[float64](8),
					"uint64_5":  data.NewNumericValue[uint64](8),
					"int64_5":   data.NewNumericValue[int64](8),
					"float64_5": data.NewNumericValue[float64](8),
					"uint64_6":  data.NewNumericValue[uint64](8),
					"int64_6":   data.NewNumericValue[int64](8),
					"float64_6": data.NewNumericValue[float64](8),
				}, map[data.ValueName]bool{
					"uint64_1":  true,
					"int64_1":   true,
					"float64_1": true,
					"uint64_2":  true,
					"int64_2":   true,
					"float64_2": true,
					"uint64_3":  true,
					"int64_3":   true,
					"float64_3": true,
					"uint64_4":  true,
					"int64_4":   true,
					"float64_4": true,
					"uint64_5":  true,
					"int64_5":   true,
					"float64_5": true,
					"uint64_6":  true,
					"int64_6":   true,
					"float64_6": true,
				}),
			},
		},
	}

	for _, test := range testcases {
		t.Run(test.name, func(t *testing.T) {
			decoder := getDecoder(endianness)

			for i := 0; i < len(test.output); i++ {
				packet, err := decoder.DecodeNext(test.input)
				if err != nil {
					t.Fatalf("\nError decoding next (%d) packet: %s\n", i+1, err)
				}

				if data, ok := test.output[i].(*data.Packet); ok {
					data.SetTimestamp(time.Date(0, 0, 0, 0, 0, 0, 0, time.UTC))
				}

				if data, ok := packet.(*data.Packet); ok {
					data.SetTimestamp(time.Date(0, 0, 0, 0, 0, 0, 0, time.UTC))
				}

				if !reflect.DeepEqual(packet, test.output[i]) {
					t.Fatalf("\npacket %d:\nGot %#v\nExpected %#v\n", i+1, packet, test.output[i])
				}
			}
		})
	}
}

// getDecoder generates a mock Decoder with the following packet IDs:
// 1 - blcuAck
// 3 - add state order
// 4 - remove state order
// 5 - protection warning
// 6 - protection fault
// 8 - state space
// 9:=18 - data
func getDecoder(endianness binary.ByteOrder) *presentation.Decoder {
	nullLogger := zerolog.New(io.Discard)
	decoder := presentation.NewDecoder(endianness, nullLogger)

	dataDecoder := data.NewDecoder(endianness)
	dataDecoder.SetDescriptor(9, data.Descriptor{
		data.NewNumericDescriptor[uint8]("uint8", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint16]("uint16", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint32]("uint32", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint64]("uint64", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
	})
	dataDecoder.SetDescriptor(10, data.Descriptor{
		data.NewNumericDescriptor[int8]("int8", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[int16]("int16", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[int32]("int32", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[int64]("int64", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
	})
	dataDecoder.SetDescriptor(11, data.Descriptor{
		data.NewNumericDescriptor[float32]("float32", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[float64]("float64", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
	})
	dataDecoder.SetDescriptor(12, data.Descriptor{
		data.NewBooleanDescriptor("bool"),
	})
	dataDecoder.SetDescriptor(13, data.Descriptor{
		data.NewEnumDescriptor("enum", data.EnumDescriptor{"a", "b", "c", "d"}),
	})
	dataDecoder.SetDescriptor(14, data.Descriptor{
		data.NewNumericDescriptor[uint8]("uint8_1", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint8]("uint8_2", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[float64]("float64", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewBooleanDescriptor("bool"),
		data.NewEnumDescriptor("enum", data.EnumDescriptor{"a", "b", "c"}),
	})
	dataDecoder.SetDescriptor(15, data.Descriptor{
		data.NewBooleanDescriptor("bool_1"),
		data.NewBooleanDescriptor("bool_2"),
		data.NewBooleanDescriptor("bool_3"),
	})
	dataDecoder.SetDescriptor(16, data.Descriptor{
		data.NewEnumDescriptor("enum_1", data.EnumDescriptor{"a", "b", "c"}),
		data.NewEnumDescriptor("enum_2", data.EnumDescriptor{"a", "b"}),
		data.NewEnumDescriptor("enum_3", data.EnumDescriptor{"a", "b", "c", "d", "e"}),
		data.NewEnumDescriptor("enum_4", data.EnumDescriptor{"a", "b", "c", "d"}),
		data.NewEnumDescriptor("enum_5", data.EnumDescriptor{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j"}),
	})
	dataDecoder.SetDescriptor(17, data.Descriptor{
		data.NewNumericDescriptor[uint8]("uint8_1", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint8]("uint8_2", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint8]("uint8_3", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint8]("uint8_4", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint8]("uint8_5", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint8]("uint8_6", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint8]("uint8_7", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint8]("uint8_8", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint8]("uint8_9", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint8]("uint8_10", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
	})
	dataDecoder.SetDescriptor(18, data.Descriptor{
		data.NewNumericDescriptor[uint64]("uint64_1", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[int64]("int64_1", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[float64]("float64_1", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint64]("uint64_2", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[int64]("int64_2", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[float64]("float64_2", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint64]("uint64_3", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[int64]("int64_3", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[float64]("float64_3", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint64]("uint64_4", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[int64]("int64_4", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[float64]("float64_4", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint64]("uint64_5", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[int64]("int64_5", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[float64]("float64_5", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[uint64]("uint64_6", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[int64]("int64_6", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
		data.NewNumericDescriptor[float64]("float64_6", make(data.ConversionDescriptor, 0), make(data.ConversionDescriptor, 0)),
	})
	decoder.SetPacketDecoder(9, dataDecoder)
	decoder.SetPacketDecoder(10, dataDecoder)
	decoder.SetPacketDecoder(11, dataDecoder)
	decoder.SetPacketDecoder(12, dataDecoder)
	decoder.SetPacketDecoder(13, dataDecoder)
	decoder.SetPacketDecoder(14, dataDecoder)
	decoder.SetPacketDecoder(15, dataDecoder)
	decoder.SetPacketDecoder(16, dataDecoder)
	decoder.SetPacketDecoder(17, dataDecoder)
	decoder.SetPacketDecoder(18, dataDecoder)

	return decoder
}

func join[T any](data ...[]T) []T {
	output := make([]T, 0)
	for _, d := range data {
		output = append(output, d...)
	}
	return output
}

func toBinary(n any, order binary.ByteOrder) []byte {
	switch num := n.(type) {
	case uint8:
		return []byte{uint8(num)}
	case uint16:
		output := make([]byte, 2)
		order.PutUint16(output, uint16(num))
		return output
	case uint32:
		output := make([]byte, 4)
		order.PutUint32(output, uint32(num))
		return output
	case uint64:
		output := make([]byte, 8)
		order.PutUint64(output, uint64(num))
		return output
	case int8:
		return []byte{uint8(num)}
	case int16:
		output := make([]byte, 2)
		order.PutUint16(output, uint16(num))
		return output
	case int32:
		output := make([]byte, 4)
		order.PutUint32(output, uint32(num))
		return output
	case int64:
		output := make([]byte, 8)
		order.PutUint64(output, uint64(num))
		return output
	case float32:
		output := make([]byte, 4)
		order.PutUint32(output, math.Float32bits(num))
		return output
	case float64:
		output := make([]byte, 8)
		order.PutUint64(output, math.Float64bits(num))
		return output
	case bool:
		if num {
			return []byte{0x01}
		} else {
			return []byte{0x00}
		}
	default:
		panic("must be a number or boolean")
	}
}
