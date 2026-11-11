# Hypervisor Network Configuration


## Diagram

![](INSERT NETWORK DIAGRAM HERE)

## Router Configuration

The router must be configured with a series of rules to enable the captive portal upon connecting to the network.
To do this, you must connect to the router via SSH or configure it visually by connecting to the IP `172.16.100.1` while on the same network.
The default username is ubnt.
```
ssh ubnt@172.16.100.1
```

By default, the router starts a standard tty session. The current configuration can be viewed using the `show configuration` command, while `show configuration commands` allows exporting the current settings as a list of individual commands.
To modify the settings, enter configuration mode by typing `configure`.
In this mode, you can execute the relevant configuration commands to define the router's behavior.

For the Hypervisor setup, a series of rules must be configured to force users through a local captive portal. To achieve this:

1. NAT Rule 1
All port `80` (HTTP) traffic originating from the local network must be redirected to the server at `172.16.100.3:80`.

2. Exceptions
Devices with the IPs `172.16.100.1` (router), `172.16.100.2` (NAP), and `172.16.100.3` (portal) must be exempt from this redirection rule.

3. HTTPS Blocking
A rule must be applied to reject HTTPS traffic on the internal network (`switch0`), except for the exempt users defined in step 2.

4. DNS Forwarding
The router is configured so that any local DNS query is ultimately resolved or redirected to the Hypervisor/Portal IP (`172.16.100.3`).

5. Hairpin NAT
Allows internal users to access the portal using its public IP address if necessary.

6. DHCP Server
Distributes IP addresses within the `172.16.100.31-240` range and sets the primary DNS server as `172.16.100.1`.

7. Static NAP IP
Binds a static IP address to the NAP (`172.16.100.2`).
You can use the configuration provided in `docs/config-router.txt` by copying and pasting the commands into the router's tty after entering config mode, or via the Web UI by opening the CLI console from the top right corner.

Details

It is mandatory for the portal page to be exposed on port `80`. Mobile devices block automatic connection/detection to any port other than `80` or `443`.
The recommended architectural options are:

1. Hypervisor on the Portal
Maintain the current Hypervisor configuration so that it opens automatically as soon as a user connects to the network.

2. Hypervisor Behind a Proxy
A reverse proxy like Nginx or Caddy can be configured to filter traffic based on domain, subdomain, or path. This ensures only ports `80`/`443` are exposed externally and optionally allows configuring local domains for a more professional look.

3. Hypervisor on a Different Port
The Hypervisor can be hosted on a separate port. This is a more direct solution that requires no additional proxy configuration.

The portal must accept both `GET` and `POST` requests. `GET /portal`. You can find an example of a basic portal implementation in `basic-server.py`.
