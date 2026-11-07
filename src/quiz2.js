// Exhibit and choose-two questions. 7th field = exhibit (CLI output shown with the question).
Q.push(
["l","Refer to the exhibit. Why does R1 use EIGRP for 10.1.1.0/24 even though OSPF also knows it as an O E2 route?",["EIGRP external routes use AD 90, like internal ones","OSPF external AD was raised to 171, so 170 wins","EIGRP always wins over OSPF for external routes","The EIGRP metric 2816 is lower than OSPF's cost"],1,"show ip protocols shows OSPF External 171. EIGRP external is 170, so the EIGRP route is installed. Metrics are never compared across protocols. (OCG · NETACAD)","1.1",
`R1# show ip route 10.1.1.0
Routing entry for 10.1.1.0/24
  Known via "eigrp 100", distance 170, metric 2816, type external
R1# show ip protocols | include Routing Protocol|Distance
Routing Protocol is "eigrp 100"
  Distance: internal 90 external 170
Routing Protocol is "ospf 1"
  Distance: (default is 110)  External: 171`],
["l","Refer to the exhibit. No EIGRP routes are redistributed into OSPF. Why?",["Prefix list LAN never matches","Sequence 10 denies everything because it has no set clause","The route map is missing a match tag line in sequence 20","OSPF needs metric-type type-2 instead of type-1"],0,"The hit count of 0 on LAN shows sequence 20 never matches, and there's no catch-all permit sequence, so the implicit deny drops the rest. (OCG)","1.2",
`R1# show route-map EIGRP-TO-OSPF
route-map EIGRP-TO-OSPF, deny, sequence 10
  Match clauses:
    tag 110
route-map EIGRP-TO-OSPF, permit, sequence 20
  Match clauses:
    ip address prefix-lists: LAN
  Set clauses:
    metric-type type-1
R1# show ip prefix-list detail LAN
ip prefix-list LAN:
   seq 5 permit 10.1.0.0/16 (hit count: 0, refcount: 1)
R1# show ip eigrp topology | include 10.1.
P 10.1.1.0/24, 1 successors, FD is 2816
P 10.1.2.0/24, 1 successors, FD is 2816`],
["l","Refer to the exhibit. Why doesn't prefix-list LAN match 10.1.1.0/24 and 10.1.2.0/24?",["Without ge/le it only matches exactly 10.1.0.0/16","Prefix lists can't be used inside route maps","The sequence number 5 is reserved for deny entries","The list must also permit 0.0.0.0/0 le 32"],0,"With no ge/le, the length must equal /16. Add le 24 to include the /24s. (OCG)","1.2",
`ip prefix-list LAN seq 5 permit 10.1.0.0/16
R1# show ip eigrp topology | include 10.1.
P 10.1.1.0/24, 1 successors, FD is 2816
P 10.1.2.0/24, 1 successors, FD is 2816`],
["l","Route map RM sets values during redistribution. Which TWO statements about route maps are true? (Choose two.)",["Separate match lines in one sequence must all match","An ACL deny entry inside the route map drops the route immediately","A sequence with no match statement matches everything","Routes that match no sequence at all are permitted by default","set commands run even when the sequence is a deny"],[0,2],"Separate match lines are ANDed and an empty match matches all routes. An ACL deny just means 'no match', and the route map ends with an implicit deny. (OCG)","1.2"],
["l","Refer to the exhibit from the DMVPN hub. Spokes still can't reach each other's LANs over EIGRP. What's the cause?",["Split horizon is still enabled on Tunnel0","The hello interval is too short for DMVPN","The hub has no EIGRP peers on Tunnel0","The hold time must be three times longer"],0,"Split horizon stops the hub from advertising spoke 1's route back out Tunnel0 to spoke 2. Use no ip split-horizon eigrp 100 on Tunnel0. (OCG)","1.3",
`Hub# show ip eigrp interfaces detail Tunnel0
EIGRP-IPv4 Interfaces for AS(100)
Interface  Peers  Xmit Queue  Mean SRTT
Tu0          2       0/0         12
  Hello-interval is 5, Hold-time is 15
  Split-horizon is enabled
  Next xmit serial <none>`],
["l","Two routers redistribute between OSPF and EIGRP in both directions. Which TWO measures prevent routing loops and route feedback? (Choose two.)",["Tag routes on redistribution and deny that tag at the other boundary","Raise the AD of re-learned external routes on the boundary routers","Enable auto-summary on both boundary routers","Use identical seed metrics on both boundary routers for all redistributed routes","Configure both boundary routers as receive-only EIGRP stubs"],[0,1],"Tags stop routes from being re-injected; AD changes keep the boundary routers from preferring the looped copy. (OCG · NETACAD)","1.3"],
["l","Refer to the exhibit from R1. EIGRP neighbors don't learn 10.9.0.0/16 from OSPF. What's missing?",["A seed metric on the redistribute ospf command","The subnets keyword on redistribute ospf","bgp redistribute-internal under router bgp","A route map with set tag on the redistribution"],0,"The route is in the RIB from OSPF, but EIGRP redistribution without a metric uses infinity, so it never reaches the topology table. (OCG · NETACAD)","1.4",
`R1# show run | section router eigrp
router eigrp 100
 network 10.0.0.0
 redistribute ospf 1
R1# show ip route 10.9.0.0
Routing entry for 10.9.0.0/16
  Known via "ospf 1", distance 110, metric 2, type intra area
R1# show ip eigrp topology 10.9.0.0/16
% Route not in topology table`],
["l","Refer to the exhibit. What does the output tell you about 10.9.0.0/16?",["R1 redistributed it from OSPF into EIGRP","R1 learned it from an EIGRP neighbor in AS 1","It's an internal EIGRP route with metric 258560","It came from BGP with a MED of 2"],0,"'from Redistributed', 'this system' and 'External protocol is OSPF' mean R1 is the boundary router that injected it. (OCG)","1.4",
`R1# show ip eigrp topology 10.9.0.0/16
EIGRP-IPv4 Topology Entry for AS(100)/ID(1.1.1.1) for 10.9.0.0/16
  State is Passive, Query origin flag is 1, 1 Successor(s), FD is 258560
  Descriptor Blocks:
  10.0.13.3, from Redistributed, Send flag is 0x0
      Composite metric is (258560/0), route is External
      External data:
        Originating router is 1.1.1.1 (this system)
        AS number of route is 1
        External protocol is OSPF, external metric is 2`],
["l","Refer to the exhibit. Why does the router show a route to Null0?",["It's the discard route created by the EIGRP summary","A static route to Null0 was configured by mistake","10.1.0.0/16 is unreachable and was poisoned","OSPF created it for an NSSA default route"],0,"A local EIGRP summary installs a Null0 route (AD 5) to drop traffic for missing components and prevent loops. (OCG)","1.5",
`R1# show ip route | include 10.1.
D     10.1.0.0/16 is a summary, 00:05:12, Null0
D     10.1.1.0/24 [90/2816] via 10.0.12.2, 00:05:15, Gi0/2
D     10.1.2.0/24 [90/2816] via 10.0.12.2, 00:05:15, Gi0/2`],
["l","Refer to the exhibit. The aggregate is configured, but what are neighbors receiving?",["Only 192.168.0.0/22, because the /24s are suppressed","All three prefixes, because summary-only is missing","Only the /24s, because the aggregate has no next hop","Nothing, because aggregates need a Null0 route"],0,"The 's' code marks suppressed components, so summary-only is in effect and only the /22 is sent. (OCG)","1.5",
`R1# show bgp ipv4 unicast | begin Network
     Network          Next Hop      Metric LocPrf Weight Path
 *>   192.168.0.0/22   0.0.0.0                        32768 i
 s>   192.168.0.0/24   0.0.0.0           0         32768 i
 s>   192.168.1.0/24   0.0.0.0           0         32768 i`],
["l","Where can OSPF summarize routes? (Choose two.)",["On an ABR, for inter-area routes (area range)","On an ASBR, for external routes (summary-address)","On any internal router, per interface (summary-address)","On the DR, for the whole broadcast segment (area range)","On a virtual link endpoint only"],[0,1],"OSPF summarizes only at area borders (ABR) and redistribution points (ASBR). Per-interface summarization is EIGRP. (OCG)","1.5"],
["l","Refer to the exhibit. Traffic from 10.1.1.0/24 still goes out ISP 1. Why?",["The policy is on the ISP interface, not the LAN","ACL 101 matches the wrong source subnet","set ip next-hop needs verify-availability to work","PBR doesn't work for traffic to a default route"],0,"PBR acts on packets entering an interface. LAN traffic enters Gi0/0, but the policy sits on Gi0/1, so the counter stays at 0. (OCG)","1.6",
`R1# show ip policy
Interface      Route map
Gi0/1          PBR-ISP2
R1# show route-map PBR-ISP2
route-map PBR-ISP2, permit, sequence 10
  Match clauses:
    ip address (access-lists): 101
  Set clauses:
    ip next-hop 203.0.113.2
  Policy routing matches: 0 packets, 0 bytes
R1# show ip interface brief | include Gi0
GigabitEthernet0/0   10.1.1.1      YES manual up   up   (LAN)
GigabitEthernet0/1   198.51.100.1  YES manual up   up   (ISP 1)`],
["l","Refer to the exhibit. What does the debug show about the packet from 10.1.1.20?",["Matched and policy routed to 203.0.113.2","The packet matched no sequence and was forwarded normally","The next hop was unreachable, so the packet was dropped","The packet was policy routed out the default route"],0,"'FIB policy match' followed by 'policy routed' with g=203.0.113.2 means PBR forwarded it to the set next hop. (OCG)","1.6",
`R1# debug ip policy
IP: s=10.1.1.20 (Gi0/0), d=8.8.8.8, len 100, FIB policy match
IP: s=10.1.1.20 (Gi0/0), d=8.8.8.8, g=203.0.113.2, len 100, FIB policy routed`],
["l","Refer to the exhibit. After assigning Gi0/0.10 to VRF RED, OSPF in VRF RED doesn't come up. Why?",["vrf forwarding removed the IP address","OSPF can't run on 802.1Q subinterfaces","The VRF needs an RD before OSPF can start","The OSPF process must be numbered 1"],0,"Applying vrf forwarding removes the IP address. Re-enter it so the network statement matches. (OCG)","1.7",
`R1# show ip interface brief | include 0/0.10
GigabitEthernet0/0.10  unassigned   YES manual up   up
R1# show run interface Gi0/0.10
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 vrf forwarding RED
R1# show run | section router ospf 2
router ospf 2 vrf RED
 network 10.0.12.0 0.0.0.3 area 0`],
["l","Refer to the exhibit. A user says 10.20.0.0/16 is missing on R1. What's the best conclusion?",["It's in VRF RED; the global table was checked","OSPF in VRF RED isn't running","The route was filtered by a distribute list","R1 has no route to 10.20.0.0/16 anywhere"],0,"show ip route only shows the global table. The route is present in VRF RED. (OCG)","1.7",
`R1# show ip route 10.20.0.0
% Network not in table
R1# show ip route vrf RED 10.20.0.0
Routing Table: RED
Routing entry for 10.20.0.0/16
  Known via "ospf 2", distance 110, metric 2, type intra area`],
["l","Refer to the exhibit. BGP to 203.0.113.1 still takes 180 s to detect a failure on this link. Why?",["BGP isn't a registered BFD client","The BFD session to 10.0.12.2 is down","BFD can't be used with eBGP sessions","Echo mode prevents BGP from using BFD"],0,"Only OSPF and CEF are registered. Add neighbor 203.0.113.1 fall-over bfd so BGP reacts to BFD. (OCG)","1.8",
`R1# show bfd neighbors details
IPv4 Sessions
NeighAddr        LD/RD   RH/RS   State   Int
10.0.12.2         1/1    Up      Up      Gi0/1
  Session state is UP and using echo function with 50 ms interval.
  Registered protocols: OSPF CEF`],
["l","Which TWO protocols can register as BFD clients to get fast failure detection? (Choose two.)",["OSPF","BGP","SNMP","DHCP","NTP"],[0,1],"OSPF, EIGRP, BGP, static routes and HSRP can use BFD. Management protocols can't. (OCG)","1.8"],
["l","Refer to the exhibit. Which statement about 10.4.4.0/24 is true?",["10.0.13.3 is a feasible successor (RD 2621440 < FD 3276800)","10.0.13.3 isn't a feasible successor because its FD is higher","Both paths are successors and share traffic equally","The route is Active and waiting for replies"],0,"The feasibility condition compares the neighbor's RD (2621440) with the current FD (3276800). It passes, so 10.0.13.3 is a feasible successor. (OCG · PS)","1.9",
`R1# show ip eigrp topology 10.4.4.0/24
EIGRP-IPv4 Topology Entry for AS(100)/ID(1.1.1.1) for 10.4.4.0/24
  State is Passive, Query origin flag is 1, 1 Successor(s), FD is 3276800
  Descriptor Blocks:
  10.0.12.2 (GigabitEthernet0/1), from 10.0.12.2, Send flag is 0x0
      Composite metric is (3276800/1310720), route is Internal
  10.0.13.3 (GigabitEthernet0/2), from 10.0.13.3, Send flag is 0x0
      Composite metric is (3932160/2621440), route is Internal`],
["l","Refer to the exhibit. What does R2 know about neighbor 10.0.23.3?",["A default stub: connected + summary, never queried","It's a stub that receives routes only, so R2 won't learn anything from it","It's a normal neighbor that suppresses its own queries","It's down because stub routers can't form adjacencies"],0,"'Stub Peer Advertising (CONNECTED SUMMARY)' and 'Suppressing queries' describe the default eigrp stub. (NETACAD · OCG)","1.9",
`R2# show ip eigrp neighbors detail
EIGRP-IPv4 Neighbors for AS(100)
H   Address       Interface  Hold Uptime    SRTT  RTO  Q   Seq
0   10.0.23.3     Gi0/2        12 00:10:02     2  100  0   18
   Version 23.0/2.0, Retrans: 0, Retries: 0, Prefixes: 2
   Stub Peer Advertising (CONNECTED SUMMARY ) Routes
   Suppressing queries`],
["l","Refer to the exhibit. R1 and R2 keep dropping their EIGRP adjacency. What should you check?",["The K values on both routers","The hello and hold timers on both routers","The EIGRP router IDs on both routers","The interface MTU on both routers"],0,"The log names a K-value mismatch. Timers and MTU don't stop an EIGRP adjacency. (OCG · CSLG)","1.9",
`%DUAL-5-NBRCHANGE: EIGRP-IPv4 100: Neighbor 10.0.12.2 (Gi0/1) is down: K-value mismatch
R1# show ip protocols | include K
  EIGRP metric weight K1=1, K2=0, K3=1, K4=0, K5=0
R2# show ip protocols | include K
  EIGRP metric weight K1=1, K2=1, K3=1, K4=0, K5=0`],
["l","Which TWO parameters must match for two EIGRP routers to become neighbors? (Choose two.)",["Autonomous system number","K values","Hello timer value","Hold timer value","Router ID (must be equal)"],[0,1],"AS, K values, subnet and authentication must match. Timers don't, and router IDs must differ. (OCG)","1.9"],
["l","Refer to the exhibit. What's the most likely problem between R1 and 3.3.3.3?",["MTU mismatch on Gi0/2","Hello/dead timer mismatch on Gi0/2","Area ID mismatch on Gi0/2","Duplicate router ID 3.3.3.3"],0,"The neighbor is seen (so hellos, area and timers match) but stuck in EXSTART. That's the classic MTU symptom. (OCG · NETACAD)","1.10",
`R1# show ip ospf neighbor
Neighbor ID   Pri  State          Dead Time   Address      Interface
2.2.2.2         0  FULL/  -       00:00:35    10.0.12.2    Gi0/1
3.3.3.3         1  EXSTART/DR     00:00:38    10.0.13.3    Gi0/2`],
["l","Refer to the exhibit. Why doesn't R1 form an adjacency with 10.1.12.2?",["Hello and dead timers don't match","The subnet masks don't match","The neighbor uses a different area","Authentication types don't match"],0,"'Dead R 44 C 40, Hello R 11 C 10': received (R) and configured (C) timers differ. The masks are equal. (OCG)","1.10",
`R1# debug ip ospf hello
OSPF-1 HELLO Gi1/0: Rcv hello from 2.2.2.2 area 1 10.1.12.2
OSPF-1 HELLO Gi1/0: Mismatched hello parameters from 10.1.12.2
OSPF-1 HELLO Gi1/0: Dead R 44 C 40, Hello R 11 C 10 Mask R 255.255.255.0 C 255.255.255.0`],
["l","Refer to the exhibit. What does 0/1 in the Nbrs F/C column on Gi1/0 mean?",["One neighbor seen, none Full","One Full neighbor and no DR elected","The interface is passive with one neighbor","Zero neighbors and one failed hello"],0,"F/C = Full/Count. One neighbor exists but none is Full, which points to an MTU or similar database-exchange problem. (OCG)","1.10",
`R1# show ip ospf interface brief
Interface    PID   Area     IP Address/Mask    Cost  State Nbrs F/C
Gi1/0         1      1      10.1.12.1/24       1     BDR        0/1
Gi0/0         1      1      10.1.1.1/24        1     DR         0/0`],
["l","Refer to the exhibit. Which routes can routers inside Area 2 receive?",["Intra-area routes and a default route only","Intra-area, inter-area and a default route","All routes except type 5 externals","Intra-area routes and type 7 externals"],0,"'stub area, no summary LSA' = totally stubby: types 3, 4 and 5 are blocked, and the ABR sends a default. (OCG)","1.10",
`ABR# show ip ospf | begin Area 2
    Area 2
        Number of interfaces in this area is 1
        It is a stub area, no summary LSA in this area
        generates stub default route with cost 1`],
["l","Refer to the exhibit. Which route will R1 use to reach 172.21.0.0/16 if it's also learned as O E2 with metric 20?",["The O E1 route, because E1 beats E2","The O E2 route, because 20 < 23","Both, as equal-cost paths","Neither until the external metrics match"],0,"OSPF prefers E1 over E2 regardless of the metric; 20 < 23 only matters between routes of the same type. (OCG)","1.10",
`R1# show ip route ospf | include 172.21
O E1     172.21.0.0/16 [110/23] via 10.0.12.2, 00:04:02, Gi0/1`],
["l","Which TWO conditions are required for a virtual link? (Choose two.)",["The transit area is not a stub or NSSA","It's configured on both ABRs using router IDs","The transit area is Area 0","Both ABRs use the same interface IP address","The virtual link is configured only on one ABR"],[0,1],"A virtual link runs through a non-stub transit area and is configured on both ends with the remote router ID. (OCG)","1.10"],
["l","Refer to the exhibit. Why is neighbor 192.0.2.9 stuck in Idle?",["No route to 192.0.2.9 for the multihop session","The neighbor's AS number is wrong","The TCP session is refused by an ACL","The hold timer of 90 s is too low"],0,"Idle with 'may be up to 2 hops away' and no route to the peer: BGP can't even start TCP. Add a route to the peer's loopback. (OCG · INE)","1.11",
`R1# show bgp ipv4 unicast summary | include 192.0.2.9
192.0.2.9     4 65200        0       0       1   0    0 never    Idle
R1# show bgp ipv4 unicast neighbors 192.0.2.9 | include state|hops
  BGP state = Idle
  External BGP neighbor may be up to 2 hops away.
R1# show ip route 192.0.2.9
% Network not in table`],
["l","Refer to the exhibit. Why is 172.16.0.0/16 not used by R2?",["Next hop 203.0.113.1 is unreachable","Its local preference of 200 is too high","R1 isn't a route reflector for R2","The route is suppressed by an aggregate"],0,"'(inaccessible)' and 'no best path' mean R2 can't resolve the eBGP next hop. Use next-hop-self on R1 or advertise the link. (OCG)","1.11",
`R2# show bgp ipv4 unicast 172.16.0.0/16
BGP routing table entry for 172.16.0.0/16, version 0
Paths: (1 available, no best path)
  Not advertised to any peer
  65000
    203.0.113.1 (inaccessible) from 1.1.1.1 (1.1.1.1)
      Origin IGP, metric 0, localpref 200, valid, internal`],
["l","Refer to the exhibit. Which path does R1 use for 0.0.0.0/0, and why?",["Via 203.0.113.1: local preference 200 wins","Via 10.0.24.4, because the AS path is shorter","Via 10.0.24.4, because iBGP routes are preferred","Via 203.0.113.1, because its weight is higher"],0,"Weights are equal (0). Local preference is next and 200 wins. The AS paths are the same length. (OCG)","1.11",
`R1# show bgp ipv4 unicast | begin Network
     Network          Next Hop        Metric LocPrf Weight Path
 *>   0.0.0.0          203.0.113.1          0    200      0 65000 i
 * i  0.0.0.0          10.0.24.4            0    100      0 65001 i`],
["l","Refer to the exhibit. What's the most likely reason the session never comes up?",["TCP 179 never completes","The peer has no routes to advertise","The hold timer is negotiated to 0","The session is up but no prefixes are accepted"],0,"Active means BGP keeps trying to open the TCP session and failing. (OCG)","1.11",
`R1# show bgp ipv4 unicast summary | include 198.51
198.51.100.254 4 65300       0       0       1   0    0 never    Active`],
["l","Refer to the exhibit from a client of the route reflector. What do the last line's values tell you?",["Originated by 3.3.3.3, reflected by RR 1.1.1.1","3.3.3.3 is the route reflector and 1.1.1.1 the original advertiser","The route was learned via eBGP from AS 1.1.1.1","The route is a confederation route with two members"],0,"ORIGINATOR_ID is the router that injected the route; CLUSTER_LIST lists the RRs it passed. (OCG)","1.11",
`Client2# show bgp ipv4 unicast 10.30.0.0/16
Paths: (1 available, best #1, table default)
  Local
    3.3.3.3 (metric 3) from 1.1.1.1 (1.1.1.1)
      Origin IGP, metric 0, localpref 100, valid, internal, best
      Originator: 3.3.3.3, Cluster list: 1.1.1.1`],
["l","eBGP peering must run between loopbacks on two directly connected routers. Which TWO commands are needed on each side? (Choose two.)",["neighbor x update-source Loopback0","neighbor x ebgp-multihop 2 (or disable-connected-check)","neighbor x next-hop-self on both loopback peers","neighbor x route-reflector-client toward the eBGP peer","neighbor x remove-private-as in the outbound direction"],[0,1],"update-source sources TCP from the loopback, and multihop/disable-connected-check lifts the TTL-1 directly-connected rule. (OCG · INE)","1.11"],
["v","Refer to the exhibit. What happens to a packet R1 sends to 2.2.2.2?",["R1 pops the label (PHP) and sends it unlabeled","R1 pushes label 16 and forwards it to 10.0.12.2","R1 swaps label 16 for 18","R1 drops it because no outgoing label exists"],0,"'Pop Label' means the next hop advertised implicit null, so R1 is the penultimate hop and sends the packet unlabeled. (OCG)","2.1",
`R1# show mpls forwarding-table
Local  Outgoing   Prefix          Bytes Label   Outgoing   Next Hop
Label  Label      or Tunnel Id    Switched      interface
16     Pop Label  2.2.2.2/32      0             Gi0/1      10.0.12.2
17     18         3.3.3.3/32      0             Gi0/1      10.0.12.2`],
["v","Refer to the exhibit from PE1. What can you conclude about 10.20.0.0/16?",["Learned from PE 4.4.4.4 via MP-iBGP","It was learned from the local CE 10.1.1.2 over eBGP","It's a P router's loopback learned via LDP","It's in the global table, not in VRF CUST-A"],0,"The 'i' and next hop 4.4.4.4 show an internal (MP-iBGP) VPNv4 route under RD 65000:1, the default RD for CUST-A. (OCG)","2.2",
`PE1# show bgp vpnv4 unicast all | begin Network
     Network          Next Hop        Metric LocPrf Weight Path
Route Distinguisher: 65000:1 (default for vrf CUST-A)
 *>   10.10.0.0/16     10.1.1.2             0             0 65101 i
 *>i  10.20.0.0/16     4.4.4.4              0    100      0 65102 i`],
["v","Which TWO statements about RD and RT in an MPLS L3VPN are true? (Choose two.)",["The RD makes overlapping customer prefixes unique","The RT decides which VRFs import a route","The RD must be identical on all PEs for one customer","The RT is part of the VPNv4 prefix itself","P routers use the RD to forward packets"],[0,1],"RD + prefix = unique VPNv4 route; the RT extended community controls import/export. RDs may differ per PE. (OCG)","2.2"],
["v","Refer to the exhibit from a spoke. What's the state of the tunnel to the hub?",["Registration with the hub isn't complete","The spoke is registered and the tunnel is fully up","IKE is up but the IPsec SA is missing","The hub is learned dynamically from another spoke"],0,"State NHRP means the registration hasn't been acknowledged. Check NHS/NBMA addresses, network-id, tunnel key and IPsec. (OCG)","2.3",
`Spoke31# show dmvpn
Interface: Tunnel100, IPv4 NHRP Details
Type:Spoke, NHRP Peers:1,
 # Ent  Peer NBMA Addr  Peer Tunnel Add  State  UpDn Tm  Attrb
 ----- --------------- ---------------- ----- -------- -----
     1 172.16.11.1     192.168.100.11    NHRP 00:02:13     S`],
["v","Refer to the exhibit. The DMVPN tunnel with IPsec won't come up. What's the most likely cause?",["IKE phase 1 is failing","The IPsec transform sets don't match in phase 2","The NHRP network-id differs between hub and spoke","The tunnel key on the spoke is missing"],0,"MM_NO_STATE means main mode (phase 1) never completed. Phase 2 problems show QM states. (OCG)","2.3",
`Spoke31# show crypto isakmp sa
IPv4 Crypto ISAKMP SA
dst             src             state          conn-id status
172.16.11.1     172.16.31.1     MM_NO_STATE       1001 ACTIVE (deleted)`],
["v","Refer to the exhibit from spoke 31. What does the H route show?",["A Phase 3 NHRP shortcut to spoke 41 is installed","Traffic to 10.4.4.0/24 still goes through the hub","10.4.4.0/24 was learned via EIGRP from the hub","An HSRP virtual route toward spoke 41"],0,"H routes (AD 250) are NHRP shortcuts installed by ip nhrp shortcut after the hub's redirect. (OCG)","2.3",
`Spoke31# show ip route nhrp
H     10.4.4.0/24 [250/255] via 192.168.100.41, 00:00:15, Tunnel100
Spoke31# show ip nhrp 192.168.100.41
192.168.100.41/32 via 192.168.100.41
   Tunnel100 created 00:00:15, expire 01:59:44
   Type: dynamic, Flags: router used nhop rib
   NBMA address: 172.16.41.1`],
["v","Which TWO commands make DMVPN Phase 3 spoke-to-spoke tunnels work? (Choose two.)",["ip nhrp redirect on the hub","ip nhrp shortcut on the spokes","ip nhrp map multicast dynamic on the spokes","tunnel destination on the spokes","no ip next-hop-self eigrp on the spokes"],[0,1],"The hub sends redirects when traffic hairpins; spokes install shortcuts. (OCG)","2.3"],
["s","Refer to the exhibit. An admin can't log in over SSH, although the TACACS+ server is reachable. What happens?",["Server reject: no fallback to local","The server didn't answer, so the local database should be tried","The method list is missing the local keyword","SSH users must authenticate against RADIUS first"],0,"Status FAIL is a reject from the server. AAA only moves to the next method (local) on an ERROR such as a timeout. (OCG · ITPRO)","3.1",
`R1# debug aaa authentication
AAA/AUTHEN/LOGIN (00000012): Pick method list 'VTY_ACCESS'
TPLUS: Queuing AAA Authentication request 18 for processing
TPLUS: Received authen response status FAIL (3)`],
["s","Refer to the exhibit. VTY logins only check the local database, never TACACS+. Why?",["The VTYs don't reference VTY_ACCESS","aaa new-model must come after the method list","The TACACS+ server needs a source interface","The local user has privilege 15"],0,"A named list only works where it's applied. Without login authentication VTY_ACCESS, the VTYs use the default (local). (OCG)","3.1",
`aaa new-model
username admin privilege 15 secret L0calBackup
aaa authentication login VTY_ACCESS group TACGROUP local
!
line vty 0 4
 transport input ssh`],
["s","Refer to the exhibit. SSH from 10.99.0.20 is refused during business hours. Why?",["Entry 40 is inactive (time range)","OSPF entries above it consume the SSH packets","The ACL is applied in the outbound direction","BGP entries must come after the SSH entry"],0,"The time range is inactive (check the clock/NTP), so entry 40 doesn't apply and the final deny catches SSH. (OCG)","3.2",
`R1# show access-lists EDGE-IN
Extended IP access list EDGE-IN
    10 permit ospf any any (2210 matches)
    20 permit tcp any any eq bgp (310 matches)
    40 permit tcp 10.99.0.0 0.0.0.255 any eq 22 time-range WORKHOURS (inactive)
    50 deny ip any any log (45 matches)
R1# show clock
03:12:45.112 UTC Sun Jan 1 2006`],
["s","Refer to the exhibit. What's happening on Gi0/0?",["Strict uRPF is dropping packets","An ACL named 199 is applied inbound","uRPF loose mode is dropping all traffic","The interface has no route to the default gateway"],0,"'reachable-via RX' = strict mode, and the verification drops counter is growing. ACL 199 is only the uRPF exception list. (CSLG · PCG)","3.2",
`R1# show ip interface GigabitEthernet0/0 | include verify|drops
  IP verify source reachable-via RX, allow default, ACL 199
   35 verification drops
   0 suppressed verification drops`],
["s","Refer to the exhibit. Which statement is true?",["402 class-default packets were dropped","402 management packets were dropped by CM-MGMT","No traffic is being dropped by CoPP","class-default transmits all exceeding packets"],0,"Exceeded packets get the exceed action: drop. CM-MGMT shows 0 exceeded. (OCG)","3.3",
`R1# show policy-map control-plane
  Service-policy input: PM-COPP
    Class-map: CM-MGMT (match-all)
      1250 packets, 98000 bytes
      police:
          cir 128000 bps, bc 4000 bytes
        conformed 1250 packets, 98000 bytes; actions:
          transmit
        exceeded 0 packets, 0 bytes; actions:
          drop
    Class-map: class-default (match-any)
      9020 packets, 812000 bytes
      police:
          cir 32000 bps, bc 1500 bytes
        conformed 8618 packets, 760000 bytes; actions:
          transmit
        exceeded 402 packets, 52000 bytes; actions:
          drop`],
["s","Refer to the exhibit. SSH sessions to R1 keep timing out after CoPP was applied. What's the fix?",["Add TCP 22 to COPP-MGMT","Raise the CM-MGMT police rate to 1 Mbps","Move telnet above SSH in the ACL","Apply the policy as service-policy output"],0,"The mgmt ACL only permits Telnet and SNMP, so SSH is policed by the tiny class-default. (OCG)","3.3",
`ip access-list extended COPP-MGMT
 permit tcp 10.99.0.0 0.0.0.255 any eq telnet
 permit udp 10.99.0.0 0.0.0.255 any eq snmp
R1# show access-lists COPP-MGMT
    10 permit tcp 10.99.0.0 0.0.0.255 any eq telnet (0 matches)
    20 permit udp 10.99.0.0 0.0.0.255 any eq snmp (310 matches)`],
["s","Which TWO protocols must be matched in a CoPP routing class so neighbors stay up? (Choose two.)",["OSPF (IP protocol 89)","BGP (TCP 179)","SNMP polling (UDP 161)","SSH management (TCP 22)","Syslog export (UDP 514)"],[0,1],"Routing protocols belong in the routing class. SNMP and SSH are management, syslog is outbound. (OCG)","3.3"],
["s","Refer to the exhibit. How did the switch learn 2001:DB8:10::25?",["From a DHCPv6 exchange (DH6)","From a static binding entry","From an IPv6 router advertisement","From an ARP reply on VLAN 10"],0,"DH6 = learned by gleaning DHCPv6. ND = learned from Neighbor Discovery. (CSLG)","3.4",
`SW1# show device-tracking database
Codes: L - Local, S - Static, ND - Neighbor Discovery, DH6 - IPv6 DHCP
    Network Layer Address        Link Layer Address  Interface  vlan  state
ND  FE80::A8BB:CCFF:FE00:1100    aabb.cc00.1100      Gi1/0/10    10   REACHABLE
DH6 2001:DB8:10::25              aabb.cc00.1100      Gi1/0/10    10   REACHABLE`],
["i","Refer to the exhibit. SSH to R1 fails. What's missing?",["An RSA key pair","transport input telnet on the VTY lines","An access-class on the VTY lines","ip http secure-server"],0,"SSH stays disabled until crypto key generate rsa runs, which also needs a hostname and domain name. (OCG)","4.1",
`R1# show ip ssh
SSH Disabled - version 1.99
%Please create RSA keys to enable SSH (and of atleast 768 bits for SSH v2).
Authentication timeout: 120 secs; Authentication retries: 3`],
["i","Which TWO items are required before a router accepts SSH logins? (Choose two.)",["An RSA key pair, which needs a hostname and domain name","A login method (local user or AAA) on the VTY lines","An enabled HTTP or HTTPS server for the key exchange","An SNMPv3 user with authPriv for the admin","A TFTP server address to store the host keys"],[0,1],"SSH needs keys and a way to authenticate users; transport input must allow ssh. (OCG)","4.1"],
["i","Refer to the exhibit. The NMS uses SNMPv3 authNoPriv and gets no response. Why?",["The group requires authPriv","The user is missing from running-config","The read view ALL hides every OID","ACL SNMP-ACL blocks UDP 162"],0,"Security model v3 priv requires authPriv. Users never show in running-config; that's normal. (OCG)","4.2",
`R1# show snmp group
groupname: NMS-GRP                  security model:v3 priv
readview : ALL                      writeview: <no writeview specified>
row status: active                  access-list: SNMP-ACL
R1# show snmp user
User name: nmsuser
Authentication Protocol: SHA
Privacy Protocol: AES128
Group-name: NMS-GRP`],
["i","Refer to the exhibit. An SNMPv2c poller times out. What does the output point to?",["Wrong community string in the NMS","An SNMPv3 security level mismatch","Traps blocked on UDP 162","The agent is disabled"],0,"The 'Unknown community name' counter rises with each poll, so the NMS is using a community the router doesn't have. (OCG)","4.2",
`R1# show snmp
Chassis: FTX1234ABCD
1520 SNMP packets input
    0 Bad SNMP version errors
    48 Unknown community name
    0 Illegal operation for community name supplied`],
["i","Refer to the exhibit. %LINEPROTO-5-UPDOWN messages appear in the buffer but not on the syslog server. Why?",["Trap level errors excludes level 5","The syslog server must listen on TCP 514","Buffered logging prevents remote logging","The source interface isn't configured"],0,"Trap logging at errors (3) sends levels 0–3 only; LINEPROTO-5 messages are notifications (5). The buffer logs up to informational (6), so they show there. (OCG)","4.3",
`R1# show logging | include logging
    Buffer logging:  level informational, 210 messages logged
    Trap logging: level errors, 12 message lines logged
        Logging to 10.99.0.20  (udp port 514, audit disabled, link up)`],
["i","Refer to the exhibit. What will this debug show?",["OSPF adjacency events only for Gi0/2","OSPF adjacency events for every interface","All debug output for Gi0/2","Nothing, until terminal monitor is entered on the console"],0,"The condition limits debug output to interface Gi0/2. On the console, output shows without terminal monitor. (OCG)","4.3",
`R1# show debugging
Condition 1: interface Gi0/2 (1 flags triggered)
OSPF:
  OSPF adjacency debugging is on`],
["i","Refer to the exhibit. Clients on VLAN 20 get no address. What's the problem?",["No pool for the giaddr subnet 10.1.20.0/24","The relay is missing ip helper-address","The client MAC is excluded","The DHCP server is out of addresses in pool VLAN30"],0,"The request arrives via relay 10.1.20.1, so the server needs a pool covering 10.1.20.0/24. Only VLAN30's pool exists. (OCG)","4.4",
`R2# debug ip dhcp server packet
DHCPD: DHCPDISCOVER received from client 0100.5079.6668.03 through relay 10.1.20.1.
DHCPD: there is no address pool for 10.1.20.1.
R2# show ip dhcp pool | include Pool|network
Pool VLAN30 :
 Current index        IP address range                    Leased addresses
 10.1.30.11           10.1.30.1        - 10.1.30.254       14`],
["i","Which TWO statements about DHCP relay on a Cisco router are true? (Choose two.)",["ip helper-address goes on the interface that receives client broadcasts","The relay fills in giaddr, which the server uses to pick a pool","ip helper-address goes on the server-facing interface, toward the DHCP server","The relay forwards DISCOVERs as broadcasts to every other subnet on the router","IPv6 relays use ip helper-address with the server's IPv6 address"],[0,1],"The helper sits on the client side and sets giaddr. IPv6 uses ipv6 dhcp relay destination. (OCG)","4.4"],
["i","Refer to the exhibit. Which default route is installed right now?",["The backup via 198.51.100.1, because track 1 is down","The primary via 203.0.113.1, because the link is up","Both, load-shared","None, because the probe timed out"],0,"The probe times out, track 1 is Down, so the tracked static is removed and the floating static (AD 5) is installed. (OCG)","4.5",
`R1# show ip sla statistics 1
IPSLA operation id: 1
Latest operation return code: Timeout
Number of successes: 342
Number of failures: 17
R1# show track 1
Track 1
  IP SLA 1 reachability
  Reachability is Down
R1# show run | include ip route 0.0.0.0
ip route 0.0.0.0 0.0.0.0 203.0.113.1 track 1
ip route 0.0.0.0 0.0.0.0 198.51.100.1 5`],
["i","Refer to the exhibit. Why does IP SLA 2 never produce statistics?",["The operation was never scheduled","The far end needs ip sla responder","udp-jitter requires a track object","The frequency is too low"],0,"Without ip sla schedule 2 the operation never starts, so there's nothing to show. The responder matters once it runs. (OCG)","4.5",
`R1# show run | section ip sla
ip sla 2
 udp-jitter 10.20.0.1 16384 codec g711alaw
R1# show ip sla configuration 2
Entry number: 2
Type of operation to perform: udp-jitter
Target address/Source address: 10.20.0.1/0.0.0.0
   Schedule:
    Operation frequency (seconds): 60
    Next Scheduled Start Time: Pending trigger`],
["i","Which TWO IP SLA operations need ip sla responder on the target device? (Choose two.)",["udp-jitter","udp-echo to a Cisco router","icmp-echo to any IP host","dns lookups to a name server","http GET to a web server"],[0,1],"UDP operations to a Cisco device use the responder for timestamps and control messages; ICMP, DNS and HTTP use the normal service. (OCG · PS)","4.5"],
["i","Refer to the exhibit. The collector receives no flows. What's the cause?",["The exporter has no route to the collector","The flow record has no collect fields","The monitor isn't applied to any interface","The cache is empty because no traffic flows"],0,"Records are added to the exporter but the send fails with 'No FIB'. Fix routing to 10.99.0.70 or the source interface. (CSLG)","4.6",
`R1# show flow exporter EXP-COLL statistics
Flow Exporter EXP-COLL:
  Packet send statistics (last cleared 00:30:02 ago):
    Successfully sent:         0       (0 bytes)
  Reason not given:
    No FIB:                   412      (521004 bytes)
  Client send statistics:
    Client: Flow Monitor MON-V4
      Records added:           2300`],
["i","Refer to the exhibit. Users report heavy upload traffic from 10.1.20.11, but the cache shows only downloads. Why?",["Monitor is input on the WAN only","The record has no match for the destination port","IPFIX can't show upload traffic","The cache timeout is too long"],0,"Flows are only created in the direction the monitor is applied. Add it on the LAN interface input (or output on the WAN). (CSLG)","4.6",
`R1# show flow interface
Interface GigabitEthernet0/1  (WAN)
  FNF:  monitor:         MON-V4
        direction:       Input
        traffic(ip):     on
R1# show flow monitor MON-V4 cache format table | include 10.1.20.11
10.99.0.80     10.1.20.11      443   51544    6   84211   120`],
["i","Refer to the exhibit from Catalyst Center. What does the health score say about DIST-1?",["Fair: degraded, high CPU to investigate","Poor (1–3): critical, the device is unreachable","Good (8–10): no action needed","No data (0): the device isn't monitored"],0,"Score 4 falls in the fair range. Reachability is fine; the CPU KPI is what drags it down. (CSLG)","4.7",
`Device 360 – DIST-1                 Health: 4
  Reachability: OK     CPU: 92 %     Memory: 61 %
  Issues (24 h):  High CPU utilization (P2)`],
["i","Which TWO Catalyst Center Assurance tools help with a connectivity problem that happened yesterday between two hosts? (Choose two.)",["Path Trace","Time travel on the health timeline","SWIM image upgrade for the access switches","Plug and Play onboarding of new devices","Template Editor with a config push"],[0,1],"Path Trace shows the hop-by-hop path and blocking ACLs; time travel shows the state at the time of the problem. (CSLG)","4.7"]
);
