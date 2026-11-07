// VPN + Security additions, and drag-and-drop style order/match items.
Q.push(
["v","Refer to the exhibit. R2 has no LDP neighbor toward R3 on Gi0/2. Why?",["mpls ip isn't enabled on Gi0/2","The LDP router ID of R2 is unreachable","Gi0/2 is administratively down","R3 uses TDP instead of LDP on that link"],0,"The IP column shows 'No' for Gi0/2, so LDP isn't running there. An unreachable LDP router ID would still show 'Yes (ldp)' with discovery but no session, and Operational 'Yes' rules out a down interface. (OCG)","2.1",
`R2# show mpls interfaces
Interface              IP            Tunnel   BGP Static Operational
GigabitEthernet0/1     Yes (ldp)     No       No  No     Yes
GigabitEthernet0/2     No            No       No  No     Yes`],
["v","Refer to the exhibit. Why is there no label on the last hop?",["R3 popped the label (PHP) before R4","LDP failed between R3 and R4","R4 is outside the MPLS domain","The TTL expired and the packet left the LSP"],0,"R4 advertised implicit null for its own loopback, so R3 (the penultimate hop) pops the label and R4 receives a plain IP packet. That's normal PHP, not an LDP failure. (OCG)","2.1",
`R1# traceroute 4.4.4.4
  1 10.0.12.2 [MPLS: Label 17 Exp 0] 2 msec
  2 10.0.23.3 [MPLS: Label 22 Exp 0] 2 msec
  3 10.0.34.4 3 msec`],
["v","Which statement about LDP neighbor discovery is true?",["Hellos go to 224.0.0.2 on UDP 646; the session uses TCP 646","Hellos go to 224.0.0.5 on UDP 646; the session uses TCP 179","LDP neighbors must be configured statically, like BGP peers","Labels are flooded inside OSPF opaque LSAs, so no session is needed"],0,"LDP finds neighbors with UDP 646 hellos to 224.0.0.2 and then opens a TCP 646 session. 224.0.0.5 is OSPF and TCP 179 is BGP. (OCG)","2.1"],
["v","An LSR receives a packet with label 22. Its LFIB entry for label 22 says 'outgoing label 18'. What does it do?",["Swaps 22 for 18 and forwards the packet","Pushes 18 on top of 22 and forwards it","Pops 22 and does an IP lookup instead","Drops it because the outgoing label is lower"],0,"A transit LSR swaps the incoming label for the outgoing one from its LFIB. Pushing a second label happens on the ingress PE in L3VPN; popping happens with 'Pop Label'. (OCG)","2.1"],
["v","Refer to the exhibit. CE routes from PE1's site never appear in VRF CUST-A on PE2. Why?",["PE2 imports RT 65000:200, but PE1 exports 65000:100","The RDs 65000:1 and 65000:2 must be equal","PE1 must also import RT 65000:200 for this to work","The VRF IDs must differ between the two PEs"],0,"PE2 only imports routes carrying RT 65000:200, but PE1 tags them with 65000:100. RDs may differ per PE, and VRF IDs are local. (OCG)","2.2",
`PE1# show vrf detail CUST-A | include RD|RT
VRF CUST-A (VRF Id = 1); default RD 65000:1
  Export VPN route-target communities
    RT:65000:100
  Import VPN route-target communities
    RT:65000:100
PE2# show vrf detail CUST-A | include RD|RT
VRF CUST-A (VRF Id = 1); default RD 65000:2
  Export VPN route-target communities
    RT:65000:100
  Import VPN route-target communities
    RT:65000:200`],
["v","Refer to the exhibit from PE1. What's the correct conclusion?",["10.20.0.1 is only in VRF CUST-A, as expected","MP-BGP to the remote PE is down","The remote CE blocks ICMP from the global table","LDP labels are missing for 10.20.0.1"],0,"The VRF ping works, so MP-BGP, labels and the remote CE are fine. The global ping fails because customer routes live only in the VRF. (OCG)","2.2",
`PE1# ping 10.20.0.1
.....
Success rate is 0 percent (0/5)
PE1# ping vrf CUST-A 10.20.0.1
!!!!!
Success rate is 100 percent (5/5)`],
["v","Where is the customer VRF configured in an MPLS L3VPN?",["On the PE interfaces facing the customer","On every P router along the path","On the CE router facing the provider","Only on the route reflector"],0,"VRFs live on the PEs, on the customer-facing interfaces. P routers have no VRFs, and the CE usually runs plain routing. (OCG)","2.2"],
["v","Which label does the egress PE use to choose the customer VRF?",["The inner VPN label learned via MP-BGP","The outer transport label learned via LDP","The MPLS TTL field of the top label","The route target carried in the packet"],0,"The outer label gets the packet to the PE (and is often popped one hop earlier). The inner VPN label tells the PE which VRF/prefix to use. RTs are only in BGP updates, never in packets. (OCG)","2.2"],
["v","Two customers use overlapping 10.0.0.0/8 over one provider. Which TWO things keep their routes apart? (Choose two.)",["A separate VRF per customer on each PE","An RD per VRF, making VPNv4 prefixes unique","The same RT for both customers on every PE","One OSPF area per customer inside the core","A GRE tunnel per customer between the PEs"],[0,1],"VRFs separate the tables on the PE and RDs keep the prefixes unique in MP-BGP. Sharing one RT would leak routes between the customers. (OCG)","2.2"],
["v","Refer to the exhibit from the hub. Why isn't spoke 31 fully up?",["IKE is up, but no IPsec SA exists yet","Spoke 31 hasn't sent an NHRP registration yet","The tunnel key on spoke 31 doesn't match","Spoke 31 is behind NAT, which DMVPN can't use"],0,"In show dmvpn, state 'IPsec' means IKE completed but the IPsec SA didn't: check the transform set and IPsec profile. 'NHRP' would mean registration is missing. DMVPN supports NAT-T. (OCG)","2.3",
`Hub# show dmvpn
Type:Hub, NHRP Peers:2,
 # Ent  Peer NBMA Addr  Peer Tunnel Add  State  UpDn Tm  Attrb
 ----- --------------- ---------------- ----- -------- -----
     1 172.16.21.1     192.168.100.21      UP 00:12:01     D
     1 172.16.31.1     192.168.100.31   IPsec 00:00:41     D`],
["v","Refer to the exhibit. Spoke 21 is registered, but no EIGRP neighbor forms over the tunnel. What's missing on the hub?",["ip nhrp map multicast dynamic","ip nhrp shortcut","no ip split-horizon eigrp 100","tunnel protection ipsec profile"],0,"EIGRP hellos are multicast. Without ip nhrp map multicast dynamic, the hub doesn't replicate multicast to registered spokes, so no neighbor forms. Split horizon affects routes, not adjacencies. (OCG)","2.3",
`Hub# show run interface Tunnel100
interface Tunnel100
 ip address 192.168.100.11 255.255.255.0
 ip nhrp network-id 100
 ip nhrp redirect
 tunnel source GigabitEthernet0/1
 tunnel mode gre multipoint
 tunnel key 100
Hub# show dmvpn | include UP
     1 172.16.21.1     192.168.100.21      UP 00:12:01     D
Hub# show ip eigrp neighbors
EIGRP-IPv4 Neighbors for AS(100)
Hub#`],
["v","Refer to the exhibit. Why doesn't the spoke's registration succeed?",["The tunnel keys differ (100 vs 101)","The NHRP network IDs must differ between hub and spoke","The NHS address must be the hub's NBMA address","The spoke needs tunnel mode gre ip instead"],0,"Tunnel keys must match, or the GRE packets are dropped. The NHRP network-id is only locally significant, and the NHS address is the hub's tunnel IP with the NBMA given separately. (OCG)","2.3",
`Hub:   interface Tunnel100 ... tunnel key 100
Spoke: interface Tunnel100
 ip nhrp network-id 100
 ip nhrp nhs 192.168.100.11 nbma 172.16.11.1 multicast
 tunnel mode gre multipoint
 tunnel key 101`],
["v","Refer to the exhibit from the hub. How did the hub learn spoke 31's NBMA address?",["Spoke 31 registered with the hub (NHS)","A static ip nhrp map entry on the hub","An NHRP resolution request from spoke 41","The hub's EIGRP topology table"],0,"'Type: dynamic, Flags: unique registered' shows a registration from the spoke. Static maps show 'Type: static', and resolution entries are learned on the spokes. (OCG)","2.3",
`Hub# show ip nhrp
192.168.100.31/32 via 192.168.100.31
  Tunnel100 created 23:04:04, expire 01:37:26
  Type: dynamic, Flags: unique registered used nhop
  NBMA address: 172.16.31.1`],
["v","Refer to the exhibit. What changed between the two traceroutes?",["A shortcut was built after the redirect","EIGRP converged on a new feasible successor via spoke 41","The hub's tunnel went down, so traffic rerouted","IPsec phase 2 finished, which removed the hub hop"],0,"The first trace hairpins through the hub (192.168.100.11); the second goes straight to spoke 41. That's Phase 3: hub redirect, then a spoke shortcut. (OCG)","2.3",
`Spoke31# traceroute 10.4.4.1 source 10.3.3.1
  1 192.168.100.11 1 msec
  2 192.168.100.41 1 msec
Spoke31# traceroute 10.4.4.1 source 10.3.3.1
  1 192.168.100.41 1 msec`],
["v","In DMVPN, what is the NBMA address of a spoke?",["Its public/transport IP address","Its tunnel interface IP address","The NHRP network ID it uses","The loopback used as router ID"],0,"NBMA = the transport (underlay) address, such as the internet-facing IP. The tunnel IP is the overlay address that NHRP maps to it. (OCG)","2.3"],
["v","A spoke behind a NAT firewall registers, but IPsec never comes up. UDP 500 is allowed. What else must pass?",["UDP 4500 (NAT traversal)","TCP 179 for the routing protocol","IP protocol 47 only, never ESP","UDP 646 for NHRP"],0,"Behind NAT, IKE moves to UDP 4500 and ESP is encapsulated in UDP 4500 (NAT-T). TCP 179 is BGP and UDP 646 is LDP; NHRP rides inside GRE. (OCG)","2.3"],
["v","Which TWO settings must match on every router in one DMVPN cloud? (Choose two.)",["tunnel key","The IPsec transform set (with tunnel protection)","ip nhrp network-id value","tunnel source interface name","ip mtu value on the tunnel"],[0,1],"The tunnel key travels in the GRE header and IPsec proposals must match for SAs to form. The NHRP network-id is only locally significant, and interface names and MTU can differ. (OCG)","2.3"],
["v","Why can a Phase 3 hub advertise only a summary to the spokes?",["NHRP redirect/shortcut gives specific next hops","Phase 3 spokes run BGP instead of EIGRP","Summaries are carried inside NHRP registrations","Phase 3 uses static NHRP maps on every spoke"],0,"NHRP installs more specific shortcut routes on demand, so the routing protocol only needs a summary. Phase 2 relies on each spoke prefix with its original next hop. (OCG)","2.3"],
["v","Put the MPLS L3VPN route propagation steps in order.",["CE advertises the prefix to PE1","PE1 places it in the VRF and adds the RD and export RT","PE1 sends it to PE2 over MP-iBGP (VPNv4)","PE2 imports it into the customer VRF by RT","PE2 advertises it to the remote CE"],"order","The route goes CE → VRF on PE1 → VPNv4 over MP-iBGP → import by RT on PE2 → remote CE. P routers never see it. (OCG)","2.2"],
["v","Put the DMVPN Phase 3 spoke-to-spoke steps in order.",["Spoke 1 sends traffic to the hub","The hub forwards it and sends an NHRP redirect","Spoke 1 sends an NHRP resolution request","Spoke 2 replies with its NBMA address","Spoke 1 installs the shortcut and sends directly"],"order","Hairpin, redirect, resolution, reply, shortcut. The shortcut appears as an H route on the spoke. (OCG)","2.3"],
["v","Match each DMVPN phase to its behavior.",[["Phase 1","spokes use p2p GRE, all traffic via the hub"],["Phase 2","spoke-to-spoke, but the hub can't summarize"],["Phase 3","redirect + shortcut, summaries allowed"]],"match","Phase 1 is hub-and-spoke only. Phase 2 adds spoke-to-spoke with full routes. Phase 3 keeps spoke-to-spoke and allows summaries. (OCG)","2.3"],
["s","Refer to the exhibit. The RADIUS server listens only on UDP 1812/1813 and logs no requests from R1. Logins fall back to local. Most likely cause?",["IOS uses 1645/1646; the server uses 1812/1813","The shared key doesn't match the server","RADIUS needs TCP 49 to be open","The server rejected the user's password"],0,"R1 sends to 1645/1646, so the server never sees the requests and R1 marks it DEAD after timeouts. A key mismatch would still show requests in the server log, and a reject is an answer, so it wouldn't mark the server dead. (OCG)","3.1",
`R1# show aaa servers
RADIUS: id 1, priority 1, host 10.0.10.52, auth-port 1645, acct-port 1646
     State: current DEAD, duration 312s, previous duration 0s
     Dead: total time 312s, count 3`],
["s","Refer to the exhibit. The TACACS+ server goes down. What happens to new VTY logins?",["They fail: no fallback method is listed","They fall back to the local database automatically","They use the enable secret automatically","They're allowed without authentication"],0,"The list has only one method. When it errors, there's nothing else to try, so logins fail. Add local (or another method) as a fallback. (OCG)","3.1",
`aaa new-model
username admin privilege 15 secret L0calBackup
aaa authentication login default group tacacs+
line vty 0 4
 transport input ssh`],
["s","Refer to the exhibit. What happened during this login?",["Server error, so AAA moved on to local","The server rejected the user, then local was tried anyway","Local was tried first and TACACS+ second","The method list is applied to the wrong line"],0,"Status ERROR (not FAIL) lets AAA move to the next method, here LOCAL. A FAIL (reject) would end the login. (OCG)","3.1",
`AAA/AUTHEN/LOGIN (0000001A): Pick method list 'VTY_ACCESS'
AAA/AUTHEN/LOGIN (0000001A): Method=TACGROUP (tacacs+)
TPLUS: Received authen response status ERROR (7)
AAA/AUTHEN/LOGIN (0000001A): Method=LOCAL`],
["s","Console logins must keep working when TACACS+ is down, but use TACACS+ when it's up. Which method list?",["group tacacs+ local","group tacacs+ only","group radius group tacacs+","local only, without TACACS+"],0,"TACACS+ first, local when the server doesn't answer. 'local' alone never uses TACACS+, and 'group tacacs+' alone fails when the server is down. (OCG)","3.1"],
["s","A TACACS+ user authenticates over SSH but lands at privilege level 1 instead of 15. Why?",["Exec authorization isn't applied","The local fallback user has privilege 15","TACACS+ can't assign privilege levels","transport input on the VTY lines is wrong"],0,"The privilege level comes from TACACS+ exec authorization. Without aaa authorization exec (applied to the line), the user gets the default level 1. (OCG)","3.1"],
["s","Refer to the exhibit. Host 10.1.1.50 can't reach HTTPS sites. Why?",["Entry 10 matches it first, so entry 20 is never reached","Entry 20 needs the established keyword","Extended ACLs check the most specific entry first","Entry 30 overrides entry 20 because it's broader"],0,"ACLs are processed top-down and stop at the first match. 10.1.1.50 is inside 10.1.0.0/16, so entry 10 denies it. Move the host permit above the deny. (OCG)","3.2",
`R1# show access-lists 110
Extended IP access list 110
    10 deny   ip 10.1.0.0 0.0.255.255 any (980 matches)
    20 permit tcp host 10.1.1.50 any eq 443
    30 permit ip any any (12034 matches)`],
["s","Refer to the exhibit. ACL 110 is meant to filter traffic from the LAN on Gi0/0, but it never matches. Why?",["It's applied outbound on the LAN interface","It's really a standard ACL, so it can't match ports","Numbered ACLs can't be applied to GigabitEthernet ports","Inbound ACLs can't use extended entries"],0,"Traffic from the LAN enters Gi0/0, so it must be filtered inbound there. Outbound on Gi0/0 only sees traffic going to the LAN. (OCG)","3.2",
`R1# show ip interface GigabitEthernet0/0 | include access list|Internet
  Internet address is 10.1.1.1/24
  Outgoing access list is 110
  Inbound  access list is not set`],
["s","Refer to the exhibit. After applying V6-IN inbound, IPv6 neighbors become unreachable. What's the fix?",["Permit nd-na/nd-ns before the deny","Apply it with ipv6 access-group instead","Use a /128 prefix for the SSH entry","Move the deny entry to sequence 5"],0,"The explicit deny comes before the implicit ND permits, so NS/NA are dropped. Permit them above the deny. (OCG)","3.2",
`R1# show ipv6 access-list V6-IN
IPv6 access list V6-IN
    permit tcp 2001:DB8:99::/64 any eq 22 sequence 10
    deny ipv6 any any log sequence 20`],
["s","Refer to the exhibit. Packets from 192.0.2.10 arriving on Gi0/1 are dropped. Why?",["Strict uRPF: best path back is Gi0/2","Loose uRPF drops all sources learned via BGP","The route to 192.0.2.0/24 is missing from CEF","uRPF needs allow-self-ping for transit traffic"],0,"Strict mode (rx) requires the best path back to the source to use the arrival interface. CEF says Gi0/2. Loose mode or an exception ACL would allow this asymmetric path. (CSLG · PCG)","3.2",
`R1# show ip cef 192.0.2.10
192.0.2.0/24
  nexthop 198.51.100.1 GigabitEthernet0/2
R1# show ip interface Gi0/1 | include verify
  IP verify source reachable-via RX`],
["s","Which ACL type can't match on destination addresses?",["Standard IPv4 ACL","Extended IPv4 ACL","IPv6 access list","Time-based extended ACL"],0,"Standard ACLs match the source address only, which is why they go near the destination. Extended and IPv6 ACLs match source, destination and ports. (OCG)","3.2"],
["s","Refer to the exhibit. CM-ROUTING never matches any packets. Why?",["match-all needs both ACLs; use match-any","OSPF and BGP can't be policed by CoPP","The class needs a police action before it can match","class-default is evaluated before CM-ROUTING"],0,"With match-all, a packet must match every match statement. No packet is both OSPF and BGP, so nothing matches and everything falls to class-default. (OCG · CSLG)","3.3",
`class-map match-all CM-ROUTING
 match access-group name COPP-OSPF
 match access-group name COPP-BGP
R1# show policy-map control-plane | include Class-map|packets
    Class-map: CM-ROUTING (match-all)
      0 packets, 0 bytes
    Class-map: class-default (match-any)
      48210 packets, 3982110 bytes`],
["s","In which order does a CoPP policy evaluate its classes?",["Top-down as listed, class-default last","Most specific ACL first, regardless of order","Alphabetically by class-map name","class-default first, then the others"],0,"Classes are checked top-down as configured; the first match wins and class-default catches the rest. (OCG)","3.3"],
["s","What traffic does CoPP protect?",["Traffic destined to the router's route processor","All transit traffic through the router","Only traffic leaving the management interface","Only IPv6 control traffic"],0,"CoPP polices packets punted to the control plane (routing protocols, management, ICMP to the router). Transit traffic is handled by interface ACLs and QoS. (OCG)","3.3"],
["s","Refer to the exhibit. Hosts on VLAN 10 lose their IPv6 default gateway. Why?",["A host-role policy is on the router's port","RA Guard needs DHCPv6 Guard on the same port","CDP blocks router advertisements on trunk ports","The policy must be attached per VLAN, not per port"],0,"A host-role policy drops RAs. Gi1/0/1 connects to router R1, so the legitimate RAs are dropped there. That port needs a router-role policy (or none). (CSLG · PS)","3.4",
`SW1# show ipv6 nd raguard policy HOSTS
Policy HOSTS configuration:
  device-role host
Policy HOSTS is applied on the following targets:
Target      Type  Policy   Feature    Target range
Gi1/0/1     PORT  HOSTS    RA guard   vlan all
Gi1/0/10    PORT  HOSTS    RA guard   vlan all
SW1# show cdp neighbors Gi1/0/1 | include R1
R1          Gig 1/0/1   150   R B S I  ISR4331   Gig 0/0/0`],
["s","Which IPv6 first hop feature is the counterpart of DHCP snooping's rogue-server protection?",["DHCPv6 Guard","RA Guard","ND inspection","IPv6 Source Guard"],0,"DHCPv6 Guard blocks DHCPv6 Advertise/Reply from non-server ports, like DHCP snooping's untrusted ports. RA Guard handles router advertisements. (CSLG)","3.4"],
["s","Which TWO IPv6 first hop features depend on the binding table? (Choose two.)",["ND inspection","IPv6 Source Guard","RA Guard","DHCPv6 Guard device roles","uRPF loose mode"],[0,1],"ND inspection and Source Guard check traffic against the binding table. RA Guard and DHCPv6 Guard work on port roles; uRPF uses the FIB. (CSLG)","3.4"],
["s","Which ICMPv6 message does RA Guard inspect?",["Router Advertisement (type 134)","Neighbor Solicitation (type 135)","Echo Request (type 128)","Redirect (type 137)"],0,"RA Guard filters Router Advertisements (134). NS/NA (135/136) are checked by ND inspection. (CSLG · PS)","3.4"],
["s","Match each IPv6 ICMP type to its message.",[["133","Router Solicitation"],["134","Router Advertisement"],["135","Neighbor Solicitation"],["136","Neighbor Advertisement"]],"match","133 RS, 134 RA, 135 NS, 136 NA (137 is Redirect). (CSLG)","3.4"],
["s","Match each uRPF option to its meaning.",[["reachable-via rx","best path back must use the arrival interface"],["reachable-via any","any route to the source is enough"],["allow-default","a default route counts as a match"]],"match","rx = strict, any = loose, allow-default lets the default route satisfy the check. (PCG · CSLG)","3.2"],
["s","Match each AAA source to its property.",[["TACACS+","TCP 49, encrypts the whole body"],["RADIUS","UDP 1812/1813, encrypts only the password"],["local","usernames stored on the router itself"]],"match","TACACS+ for device admin, RADIUS for network access, local as the fallback. (OCG)","3.1"],
["l","Put the OSPF neighbor states in order.",["Down","Init","2-Way","ExStart","Exchange","Loading","Full"],"order","Down → Init (hello seen) → 2-Way (own RID in neighbor's hello) → ExStart → Exchange (DBDs) → Loading (LSR/LSU) → Full. (OCG)","1.10"],
["l","Match each OSPF LSA type to its description.",[["Type 1","router LSA, inside one area"],["Type 3","summary from an ABR"],["Type 5","external route from an ASBR"],["Type 7","NSSA external, translated to 5"]],"match","1 router, 2 network (DR), 3 summary, 4 ASBR summary, 5 external, 7 NSSA external. (OCG)","1.10"],
["l","Match each BGP attribute to its category.",[["AS_PATH","well-known mandatory"],["LOCAL_PREF","well-known discretionary"],["COMMUNITY","optional transitive"],["MED","optional non-transitive"]],"match","AS_PATH, NEXT_HOP and ORIGIN are mandatory; LOCAL_PREF stays inside the AS; COMMUNITY passes through; MED doesn't go beyond the neighbor AS. (OCG)","1.11"],
["i","Match each syslog level to its name.",[["0","emergencies"],["3","errors"],["4","warnings"],["6","informational"],["7","debugging"]],"match","0 emerg, 1 alert, 2 crit, 3 err, 4 warn, 5 notif, 6 info, 7 debug. (OCG)","4.3"],
["i","Match each SNMPv3 security level to what it provides.",[["noAuthNoPriv","username only"],["authNoPriv","MD5/SHA authentication"],["authPriv","authentication + encryption"]],"match","Only authPriv encrypts. The group's level and the NMS's level must match. (OCG)","4.2"],
["i","Put the DHCPv6 stateful exchange in order.",["SOLICIT","ADVERTISE","REQUEST","REPLY"],"order","SOLICIT → ADVERTISE → REQUEST → REPLY, the DHCPv6 counterpart of DORA. (OCG)","4.4"]
);
