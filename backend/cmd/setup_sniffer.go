package main

import (
	"fmt"
	"log"
	"net"
	"strings"

	"github.com/google/gopacket/layers"
	"github.com/google/gopacket/pcap"
	trace "github.com/rs/zerolog/log"
	adj_module "github.comHyperloop-UPV/Hypervisor/internal/adj"
	"github.comHyperloop-UPV/Hypervisor/internal/common"
	"github.comHyperloop-UPV/Hypervisor/internal/config"
	"github.comHyperloop-UPV/Hypervisor/pkg/transport"
	"github.comHyperloop-UPV/Hypervisor/pkg/transport/network/sniffer"
)

func configureSnifferTransport(
	adj adj_module.ADJ,
	transp *transport.Transport,
	config config.Config,
) {
	dev := getDev(config, adj)

	// Production mode: Use packet sniffer
	source, err := pcap.OpenLive(dev.Name, 1500, true, pcap.BlockForever)
	if err != nil {
		panic("failed to obtain sniffer source: " + err.Error())
	}

	boardIps := make([]net.IP, 0, len(adj.Info.BoardIds))
	for boardName := range adj.Info.BoardIds {
		boardIps = append(boardIps, net.ParseIP(adj.Info.Addresses[boardName]))
	}

	filter := getFilter(boardIps, net.ParseIP(adj.Info.Addresses[BACKEND]), adj.Info.Ports[UDP])
	trace.Warn().Str("filter", filter).Msg("filter")
	err = source.SetBPFFilter(filter)
	if err != nil {
		panic("failed to compile bpf filter")
	}
	go transp.HandleSniffer(sniffer.New(source, &layers.LayerTypeEthernet, trace.Logger))
}

func getDev(config config.Config, adj adj_module.ADJ) pcap.Interface {

	var dev pcap.Interface
	var err error
	if !config.Network.DevMode {
		// Only select device if not in dev mode (sniffer requires device selection)
		if *networkDevice != -1 {
			devs, err := pcap.FindAllDevs()
			if err != nil {
				trace.Fatal().Err(err).Msg("Getting devices")
			}

			dev = devs[*networkDevice]
		} else {
			dev, err = selectDev(adj.Info.Addresses, config)
			if err != nil {
				trace.Fatal().Err(err).Msg("Error selecting device")
			}
		}
	}

	return dev

}

func selectDev(adjAddr map[string]string, conf config.Config) (pcap.Interface, error) {
	devs, err := pcap.FindAllDevs()
	if err != nil {
		return pcap.Interface{}, err
	}

	for _, dev := range devs {
		for _, addr := range dev.Addresses {
			if addr.IP.String() == adjAddr["backend"] {
				return dev, nil
			}
		}
	}

	log.Fatal("backend address not found in any device")
	return pcap.Interface{}, nil

}

func getFilter(boardAddrs []net.IP, backendAddr net.IP, udpPort uint16) string {
	ipipFilter := getIPIPfilter()
	udpFilter := getUDPFilter(boardAddrs, backendAddr, udpPort)

	filter := fmt.Sprintf("(%s) or (%s)", ipipFilter, udpFilter)

	trace.Trace().Any("addrs", boardAddrs).Str("filter", filter).Msg("new filter")
	return filter
}

func getIPIPfilter() string {
	return "ip[9] == 4"
}

func getUDPFilter(addrs []net.IP, backendAddr net.IP, port uint16) string {
	udpPort := fmt.Sprintf("udp port %d", port) // TODO use proper ports for the filter
	srcUdpAddrs := common.Map(addrs, func(addr net.IP) string {
		return fmt.Sprintf("(src host %s)", addr)
	})
	dstUdpAddrs := common.Map(addrs, func(addr net.IP) string {
		return fmt.Sprintf("(dst host %s)", addr)
	})

	srcUdpAddrsStr := strings.Join(srcUdpAddrs, " or ")
	dstUdpAddrsStr := strings.Join(dstUdpAddrs, " or ")

	return fmt.Sprintf("(%s) and (%s) and (%s or (dst host %s))", udpPort, srcUdpAddrsStr, dstUdpAddrsStr, backendAddr)
}
