package main

import (
	"fmt"
	"log"
	"net"
	"strings"

	adj_module "github.com/Hyperloop-UPV/Hypervisor/internal/adj"
	"github.com/Hyperloop-UPV/Hypervisor/internal/common"
	"github.com/Hyperloop-UPV/Hypervisor/internal/config"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/transport"
	"github.com/Hyperloop-UPV/Hypervisor/pkg/transport/network/sniffer"
	"github.com/google/gopacket/layers"
	"github.com/google/gopacket/pcap"
	trace "github.com/rs/zerolog/log"
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

	// Parse all posible boards of the

	ipsToSniff := make([]net.IP, 0, len(config.Network.SnifferIPs))

	for _, backIP := range config.Network.SnifferIPs {
		ip := net.ParseIP(backIP)
		if ip != nil {
			ipsToSniff = append(ipsToSniff, ip)
		} else {
			trace.Fatal().Str("ip", backIP).Msg("invalid IP address in sniffer_ips")
		}
	}
	filter := getFilter(boardIps, ipsToSniff, adj.Info.Ports[UDP])
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
			if addr.IP.String() == conf.App.HypervisorAddr {
				return dev, nil
			}
		}
	}

	log.Fatal("backend address not found in any device")
	return pcap.Interface{}, nil

}

func getFilter(boardAddrs []net.IP, backendAddrs []net.IP, udpPort uint16) string {
	ipipFilter := getIPIPfilter()
	udpFilter := getUDPFilter(boardAddrs, backendAddrs, udpPort)

	filter := fmt.Sprintf("(%s) or (%s)", ipipFilter, udpFilter)

	trace.Trace().Any("addrs", boardAddrs).Str("filter", filter).Msg("new filter")
	return filter
}

func getIPIPfilter() string {
	return "ip[9] == 4"
}

func getUDPFilter(addrs []net.IP, backendAddrs []net.IP, port uint16) string {
	udpPort := fmt.Sprintf("udp port %d", port)

	// Source addresses
	srcUdpAddrs := common.Map(addrs, func(addr net.IP) string {
		return fmt.Sprintf("(src host %s)", addr.String())
	})

	// Destination addresses (frontend)
	dstUdpAddrs := common.Map(addrs, func(addr net.IP) string {
		return fmt.Sprintf("(dst host %s)", addr.String())
	})

	// Backend destination addresses
	backendDstAddrs := common.Map(backendAddrs, func(addr net.IP) string {
		return fmt.Sprintf("(dst host %s)", addr.String())
	})

	srcUdpAddrsStr := strings.Join(srcUdpAddrs, " or ")
	dstUdpAddrsStr := strings.Join(dstUdpAddrs, " or ")
	backendDstAddrsStr := strings.Join(backendDstAddrs, " or ")

	return fmt.Sprintf(
		"(%s) and (%s) and (%s or %s)",
		udpPort,
		srcUdpAddrsStr,
		dstUdpAddrsStr,
		backendDstAddrsStr,
	)

	//return fmt.Sprintf("(%s) and (%s) and (%s or (dst host %s))", udpPort, srcUdpAddrsStr, dstUdpAddrsStr, backendAddr)

	//
	/*return fmt.Sprintf(
		"(%s) and (%s) and (%s or (dst host %s) or (dst host %s))",
		udpPort,
		srcUdpAddrsStr,
		dstUdpAddrsStr,
		"192.168.0.9",
		"192.168.0.10",
	)

	*/
}
