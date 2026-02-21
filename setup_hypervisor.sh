#!/usr/bin/env bash
set -euo pipefail

# Require root
if [[ "$EUID" -ne 0 ]]; then
    echo "This script must be run as root."
    exit 1
fi

# Get interfaces excluding loopback
mapfile -t interfaces < <(ip -o link show | awk -F': ' '{print $2}' | grep -v "^lo$")

echo "Available network interfaces:"
echo "-----------------------------"

for i in "${!interfaces[@]}"; do
    printf "%d) %s\n" "$((i+1))" "${interfaces[$i]}"
done

########################################
# FIRST INTERFACE (POD)
########################################

echo
read -rp "Which interface will be connected to POD? (Enter number) " choice1

if ! [[ "$choice1" =~ ^[0-9]+$ ]] || (( choice1 < 1 || choice1 > ${#interfaces[@]} )); then
    echo "Invalid selection."
    exit 1
fi

POD_INTERFACE="${interfaces[$((choice1-1))]}"

echo
read -rp "Enter IP address with CIDR mask for POD (e.g., 192.168.1.10/24): " POD_IP

if ! [[ "$POD_IP" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}/([0-9]|[12][0-9]|3[0-2])$ ]]; then
    echo "Invalid IP format."
    exit 1
fi

echo
echo "Configuring POD interface: $POD_INTERFACE"

ip addr flush dev "$POD_INTERFACE"
ip addr add "$POD_IP" dev "$POD_INTERFACE"
ip link set "$POD_INTERFACE" promisc on
ip link set "$POD_INTERFACE" up

########################################
# SECOND INTERFACE (HYPERVISOR-ROUTER / NAP)
########################################

echo
read -rp "Which interface will be connected to Hypervisor-Router/NAP? (Enter number) " choice2

if ! [[ "$choice2" =~ ^[0-9]+$ ]] || (( choice2 < 1 || choice2 > ${#interfaces[@]} )); then
    echo "Invalid selection."
    exit 1
fi

SECOND_INTERFACE="${interfaces[$((choice2-1))]}"

echo
read -rp "Enter IP address with CIDR mask for Hypervisor-Router/NAP: " SECOND_IP

if ! [[ "$SECOND_IP" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}/([0-9]|[12][0-9]|3[0-2])$ ]]; then
    echo "Invalid IP format."
    exit 1
fi

echo
echo "Configuring Hypervisor-Router/NAP interface: $SECOND_INTERFACE"

ip addr flush dev "$SECOND_INTERFACE"
ip addr add "$SECOND_IP" dev "$SECOND_INTERFACE"
ip link set "$SECOND_INTERFACE" up

echo
echo "Network configuration completed successfully."