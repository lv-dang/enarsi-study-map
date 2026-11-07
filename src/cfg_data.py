# Each block: obj, panel index (n-th panel of that obj, 0-based), title, cfg, out, tbl[(command, what to look for)]
# Lines starting with » are highlighted. Config lines starting with ! are comments.
B=[]
def add(obj,n,title,cfg,out,tbl,src="OCG"):
    B.append(dict(obj=obj,n=n,title=title,cfg=cfg.strip('\n'),out=out.strip('\n'),tbl=tbl,src=src))

add("1.1",0,"AD changes",r'''
! floating static: only used when OSPF (110) loses the route
ip route 0.0.0.0 0.0.0.0 203.0.113.9 115
!
router ospf 1
 distance ospf external 171
!
router eigrp 100
 distance eigrp 90 170
 ! per neighbor + prefix (internal EIGRP routes only)
 distance 95 10.0.12.2 0.0.0.0 10
access-list 10 permit 10.1.1.0
!
router bgp 65100
 distance bgp 20 200 200
''',r'''
R1# show ip route 10.1.1.0
Routing entry for 10.1.1.0/24
»  Known via "eigrp 100", distance 170, metric 2816, type external
  Redistributing via eigrp 100, ospf 1
  Last update from 10.0.12.2 on GigabitEthernet0/1, 00:03:12 ago

R1# show ip protocols | include Routing Protocol|Distance
Routing Protocol is "eigrp 100"
»  Distance: internal 90 external 170
Routing Protocol is "ospf 1"
»  Distance: (default is 110)  External: 171
''',[("show ip route PREFIX","'Known via' + distance shows which source won"),("show ip protocols","Distance lines per protocol"),("show ip route ospf / eigrp / static","is the expected source in the RIB at all?"),("debug ip routing","routes added/removed again and again = AD fight")],"OCG · NETACAD")

add("1.2",0,"route map for redistribution",r'''
ip prefix-list LAN seq 5 permit 10.1.0.0/16 le 24
!
route-map EIGRP-TO-OSPF deny 10
 match tag 110
route-map EIGRP-TO-OSPF permit 20
 match ip address prefix-list LAN
 set metric 50
 set metric-type type-1
 set tag 90
route-map EIGRP-TO-OSPF permit 30
!
router ospf 1
 redistribute eigrp 100 subnets route-map EIGRP-TO-OSPF
''',r'''
R1# show route-map EIGRP-TO-OSPF
route-map EIGRP-TO-OSPF, deny, sequence 10
  Match clauses:
    tag 110
  Set clauses:
route-map EIGRP-TO-OSPF, permit, sequence 20
  Match clauses:
    ip address prefix-lists: LAN
  Set clauses:
    metric 50
    metric-type type-1
    tag 90

R1# show ip prefix-list detail LAN
ip prefix-list LAN:
»   seq 5 permit 10.1.0.0/16 le 24 (hit count: 12, refcount: 1)
''',[("show route-map NAME","sequences, match/set clauses, policy match counters"),("show ip prefix-list detail","hit count 0 = the list never matches"),("show access-lists","ACL matches used by the route map"),("show ip ospf database external PREFIX","metric type, tag set by the route map"),("show ip route PREFIX","Tag value on the installed route")])

add("1.3",0,"split horizon and tags",r'''
! DMVPN hub, classic EIGRP
interface Tunnel0
 no ip split-horizon eigrp 100
!
! same thing in named mode
router eigrp CORP
 address-family ipv4 unicast autonomous-system 100
  af-interface Tunnel0
   no split-horizon
!
! R2: don't send back what R1 tagged (tag 90)
route-map OSPF-TO-EIGRP deny 10
 match tag 90
route-map OSPF-TO-EIGRP permit 20
 set tag 110
''',r'''
Hub# show ip eigrp interfaces detail Tunnel0
EIGRP-IPv4 Interfaces for AS(100)
                 Xmit Queue   PeerQ        Mean   Pacing Time
Interface  Peers Un/Reliable  Un/Reliable  SRTT   Un/Reliable
Tu0          2       0/0       0/0          12       0/1
  Hello-interval is 5, Hold-time is 15
»  Split-horizon is disabled

R2# show ip route 10.2.2.0
Routing entry for 10.2.2.0/24
  Known via "ospf 1", distance 110, metric 50
»  Tag 90, type extern 1
''',[("show ip eigrp interfaces detail INT","Split-horizon enabled/disabled"),("show ip eigrp topology PREFIX","who advertised it (looped back from a spoke?)"),("show ip route PREFIX","Tag on redistributed routes"),("show bgp ipv4 unicast PREFIX","own AS in the path = dropped as a loop"),("debug ip routing","route flapping between sources")])

add("1.4",0,"mutual redistribution",r'''
router eigrp 100
 redistribute ospf 1 metric 10000 100 255 1 1500 route-map OSPF-TO-EIGRP
!
router ospf 1
 redistribute eigrp 100 subnets route-map EIGRP-TO-OSPF
 redistribute bgp 65100 subnets
!
router bgp 65100
 bgp redistribute-internal
!
! IPv6: connected networks are NOT included unless asked
ipv6 router ospf 1
 redistribute eigrp 100 include-connected
''',r'''
R1# show ip protocols | section ospf
Routing Protocol is "ospf 1"
  It is an autonomous system boundary router
»  Redistributing External Routes from,
»    eigrp 100, includes subnets in redistribution

R1# show ip eigrp topology 10.9.0.0/16
EIGRP-IPv4 Topology Entry for AS(100)/ID(1.1.1.1) for 10.9.0.0/16
  State is Passive, Query origin flag is 1, 1 Successor(s), FD is 258560
  Descriptor Blocks:
  10.0.13.3, from Redistributed, Send flag is 0x0
      Composite metric is (258560/0), route is External
      External data:
        Originating router is 1.1.1.1 (this system)
        AS number of route is 1
»        External protocol is OSPF, external metric is 2
        Administrator tag is 0 (0x00000000)
''',[("show ip protocols","'Redistributing … from' on the boundary router"),("show ip route PREFIX (boundary)","is the source route really in the RIB from that protocol?"),("show ip eigrp topology PREFIX","External data: protocol, metric, tag"),("show ip ospf database external | nssa-external","type 5/7 LSA present, metric type, tag"),("show ip route on far routers","D EX / O E2 / O E1 present, best path sane?")],"OCG · NETACAD")

add("1.5",0,"summaries",r'''
! EIGRP classic
interface GigabitEthernet0/1
 ip summary-address eigrp 100 10.1.0.0 255.255.0.0
router eigrp 100
 no auto-summary
! EIGRP named
router eigrp CORP
 address-family ipv4 unicast autonomous-system 100
  af-interface GigabitEthernet0/1
   summary-address 10.1.0.0 255.255.0.0
! OSPF: ABR (inter-area) and ASBR (external)
router ospf 1
 area 1 range 10.1.0.0 255.255.0.0
 summary-address 172.20.0.0 255.255.0.0
! BGP
router bgp 65100
 address-family ipv4 unicast
  aggregate-address 192.168.0.0 255.255.252.0 summary-only
''',r'''
R1# show ip route | include Null0
»D     10.1.0.0/16 is a summary, 00:05:12, Null0

R1# show bgp ipv4 unicast | begin Network
     Network          Next Hop      Metric LocPrf Weight Path
»*>   192.168.0.0/22   0.0.0.0                        32768 i
 s>   192.168.0.0/24   0.0.0.0           0         32768 i
 s>   192.168.1.0/24   0.0.0.0           0         32768 i
''',[("show ip route | include Null0","discard route for each local summary"),("show ip protocols","EIGRP 'Address Summarization' and auto-summary state"),("show ip ospf database summary PREFIX","one type 3 for the range instead of many"),("show bgp ipv4 unicast","s = suppressed components (summary-only works)"),("show ip route on the neighbor","only the summary arrives?")])

add("1.6",0,"PBR",r'''
access-list 101 permit ip 10.1.1.0 0.0.0.255 any
!
route-map PBR-ISP2 permit 10
 match ip address 101
 set ip next-hop 203.0.113.2
!
interface GigabitEthernet0/0
 description LAN (ingress)
 ip policy route-map PBR-ISP2
!
! router-generated traffic needs local policy
ip local policy route-map PBR-ISP2
''',r'''
R1# show ip policy
Interface      Route map
»Gi0/0          PBR-ISP2
local          PBR-ISP2

R1# show route-map PBR-ISP2
route-map PBR-ISP2, permit, sequence 10
  Match clauses:
    ip address (access-lists): 101
  Set clauses:
    ip next-hop 203.0.113.2
»  Policy routing matches: 1520 packets, 98400 bytes

R1# debug ip policy
IP: s=10.1.1.20 (Gi0/0), d=8.8.8.8, len 100, FIB policy match
IP: s=10.1.1.20 (Gi0/0), d=8.8.8.8, g=203.0.113.2, len 100, FIB policy routed
''',[("show ip policy","route map attached to the right (ingress) interface?"),("show route-map NAME","Policy routing matches counter growing"),("show access-lists 101","ACL hits"),("debug ip policy","'policy match / routed' vs 'policy rejected -- normal forwarding'"),("traceroute from a LAN host","path really goes via ISP 2")])

add("1.7",0,"VRF-Lite",r'''
vrf definition RED
 rd 65000:1
 address-family ipv4
 exit-address-family
!
interface GigabitEthernet0/0.10
 encapsulation dot1Q 10
 vrf forwarding RED
 ! re-enter the IP after vrf forwarding
 ip address 10.0.12.1 255.255.255.252
!
router ospf 2 vrf RED
 network 10.0.12.0 0.0.0.3 area 0
''',r'''
R1# show vrf
  Name        Default RD     Protocols   Interfaces
»  RED         65000:1        ipv4        Gi0/0.10

R1# show ip route vrf RED
Routing Table: RED
C        10.0.12.0/30 is directly connected, GigabitEthernet0/0.10
»O        10.20.0.0/16 [110/2] via 10.0.12.2, 00:02:11, GigabitEthernet0/0.10

R1# ping vrf RED 10.20.0.1
!!!!!
''',[("show vrf / show vrf detail","interfaces, RD, address families per VRF"),("show ip interface brief","interface lost its IP after vrf forwarding?"),("show ip route vrf NAME","routes in the VRF table (not the global one)"),("ping vrf NAME / traceroute vrf NAME","test inside the VRF"),("show ip ospf PROCESS","process bound to the right VRF")])

add("1.8",0,"BFD (verify)",r'''
interface GigabitEthernet0/1
 bfd interval 50 min_rx 50 multiplier 3
!
router ospf 1
 bfd all-interfaces
router bgp 65100
 neighbor 203.0.113.1 fall-over bfd
''',r'''
R1# show bfd neighbors details
IPv4 Sessions
NeighAddr        LD/RD   RH/RS   State   Int
»10.0.12.2         1/1    Up      Up      Gi0/1
  Session state is UP and using echo function with 50 ms interval.
  Rx Count: 1205, Tx Count: 1210
»  Registered protocols: OSPF CEF
''',[("show bfd neighbors [details]","session Up, intervals, registered protocols"),("show ip ospf interface INT","'BFD enabled'"),("debug bfd event","session down events")])

add("1.9",0,"named EIGRP: AFs, auth, stub, variance, VRF",r'''
key chain EIGRP-KEYS
 key 1
  key-string C1sco
!
router eigrp CORP
 address-family ipv4 unicast autonomous-system 100
  network 10.0.0.0
  af-interface GigabitEthernet0/1
   authentication mode hmac-sha-256 C1sco
  exit-af-interface
  topology base
   variance 2
   maximum-paths 4
  exit-af-topology
  eigrp stub connected summary
 exit-address-family
 address-family ipv6 unicast autonomous-system 100
  eigrp router-id 1.1.1.1
 exit-address-family
 address-family ipv4 unicast vrf RED autonomous-system 200
  network 10.200.0.0
 exit-address-family
!
! classic mode MD5 on an interface
interface GigabitEthernet0/2
 ip authentication mode eigrp 100 md5
 ip authentication key-chain eigrp 100 EIGRP-KEYS
''',r'''
R1# show ip eigrp neighbors
EIGRP-IPv4 VR(CORP) Address-Family Neighbors for AS(100)
H   Address       Interface  Hold Uptime    SRTT  RTO  Q   Seq
                             (sec)          (ms)       Cnt Num
0   10.0.12.2     Gi0/1        13 01:02:11     1  100  0   45

R1# show ip eigrp topology 10.4.4.0/24
EIGRP-IPv4 VR(CORP) Topology Entry for AS(100)/ID(1.1.1.1) for 10.4.4.0/24
  State is Passive, Query origin flag is 1, 1 Successor(s), FD is 3276800
  Descriptor Blocks:
  10.0.12.2 (GigabitEthernet0/1), from 10.0.12.2, Send flag is 0x0
»      Composite metric is (3276800/1310720), route is Internal
  10.0.13.3 (GigabitEthernet0/2), from 10.0.13.3, Send flag is 0x0
»      Composite metric is (3932160/2621440), route is Internal
! (FD/RD): RD 2621440 < FD 3276800 → feasible successor
''',[("show ip eigrp neighbors","neighbor up? Q Cnt stuck > 0, uptime resetting"),("show ip protocols","AS, K values, variance, stub, networks, passive interfaces"),("show ip eigrp interfaces [detail]","interface in EIGRP? auth, split horizon, timers"),("show ip eigrp topology [all-links]","FD/RD, successors, feasible successors"),("show eigrp address-family ipv6 neighbors","IPv6 AF neighbors (link-local)"),("show ip eigrp vrf RED neighbors","VRF instance")],"OCG · CSLG")

add("1.9",1,"EIGRP failure signatures",r'''
! syslog and debug lines you should recognize
%DUAL-5-NBRCHANGE: EIGRP-IPv4 100: Neighbor 10.0.12.2 (Gi0/1) is down: K-value mismatch
%DUAL-5-NBRCHANGE: EIGRP-IPv4 100: Neighbor 10.0.12.2 (Gi0/1) is down: Auth failure
%DUAL-3-SIA: Route 10.4.4.0/24 stuck-in-active state in IP-EIGRP(0) 100
EIGRP: Gi0/1: ignored packet from 10.0.13.3, opcode = 5 (authentication off or key-chain missing)
''',r'''
R2# show ip eigrp neighbors detail
EIGRP-IPv4 Neighbors for AS(100)
H   Address       Interface  Hold Uptime    SRTT  RTO  Q   Seq
0   10.0.23.3     Gi0/2        12 00:10:02     2  100  0   18
   Version 23.0/2.0, Retrans: 0, Retries: 0, Prefixes: 2
»   Stub Peer Advertising (CONNECTED SUMMARY ) Routes
»   Suppressing queries

R2# show ip eigrp topology active
EIGRP-IPv4 Topology Table for AS(100)/ID(2.2.2.2)
A 10.4.4.0/24, 0 successors, FD is Inaccessible
    1 replies, active 00:02:41, query-origin: Local origin
»      via 10.0.23.3 (Infinity/Infinity), Gi0/2, serno 112, r
''',[("debug eigrp packets hello","K-value / auth mismatch messages"),("show ip eigrp neighbors detail","stub peers and what they advertise"),("show ip eigrp topology active","routes Active, which neighbor hasn't replied (r)"),("show ip route eigrp","variance: unequal paths with different traffic share"),("show ip eigrp traffic","hellos/queries/replies counters")],"CSLG · NETACAD")

add("1.10",0,"OSPF neighbors, auth, network type, v3",r'''
router ospf 1
 router-id 1.1.1.1
 auto-cost reference-bandwidth 100000
 passive-interface default
 no passive-interface GigabitEthernet0/1
 area 0 authentication message-digest
!
interface GigabitEthernet0/1
 ip ospf 1 area 0
 ip ospf network point-to-point
 ip ospf message-digest-key 1 md5 C1sco
 ! only if the MTUs can't be made equal
 ip ospf mtu-ignore
!
! OSPFv3 with address families (IPv4 + IPv6)
router ospfv3 1
 address-family ipv6 unicast
 address-family ipv4 unicast
interface GigabitEthernet0/1
 ospfv3 1 ipv6 area 0
 ospfv3 1 ipv4 area 0
''',r'''
R1# show ip ospf neighbor
Neighbor ID   Pri  State          Dead Time   Address      Interface
2.2.2.2         0  FULL/  -       00:00:35    10.0.12.2    Gi0/1
»3.3.3.3         1  EXSTART/DR     00:00:38    10.0.13.3    Gi0/2
4.4.4.4         1  2WAY/DROTHER   00:00:31    10.0.0.4     Gi0/3

R1# show ip ospf interface GigabitEthernet0/1
GigabitEthernet0/1 is up, line protocol is up
  Internet Address 10.0.12.1/30, Area 0, Attached via Interface Enable
»  Process ID 1, Router ID 1.1.1.1, Network Type POINT_TO_POINT, Cost: 100
»  Timer intervals configured, Hello 10, Dead 40, Wait 40, Retransmit 5
  Neighbor Count is 1, Adjacent neighbor count is 1
  Message digest authentication enabled
    Youngest key id is 1
''',[("show ip ospf neighbor","state: missing, INIT, EXSTART (MTU), 2WAY (DROther)"),("show ip ospf interface [brief]","area, network type, timers, cost, auth, passive"),("show ip protocols","router ID, networks, passive interfaces"),("debug ip ospf adj","'Mismatched Authentication type', 'Nbr has larger interface MTU'"),("debug ip ospf hello","'Mismatched hello parameters … Dead R 40 C 120'"),("show ospfv3 neighbor / show ospfv3 interface","OSPFv3 per AF")],"OCG · NETACAD")

add("1.10",1,"area types and the LSDB",r'''
router ospf 1
 area 1 nssa
 ! on the ABR only; plain 'area 2 stub' on the other routers
 area 2 stub no-summary
 area 3 nssa no-summary
''',r'''
R1# show ip ospf | begin Area
    Area BACKBONE(0)
        Number of interfaces in this area is 2
    Area 1
»        It is a NSSA area
        Perform type-7/type-5 LSA translation
    Area 2
»        It is a stub area, no summary LSA in this area
        generates stub default route with cost 1

R1# show ip ospf database
            OSPF Router with ID (1.1.1.1) (Process ID 1)
                Router Link States (Area 0)
Link ID       ADV Router    Age   Seq#         Checksum Link count
1.1.1.1       1.1.1.1       512   0x80000004   0x00A1B2 3
                Summary Net Link States (Area 0)
Link ID       ADV Router    Age   Seq#         Checksum
10.1.0.0      1.1.1.1       402   0x80000001   0x00C3D4
                Type-5 AS External Link States
Link ID       ADV Router    Age   Seq#         Checksum Tag
172.20.0.0    5.5.5.5       301   0x80000002   0x00E5F6 0
''',[("show ip ospf","router role (ABR/ASBR), area types, translation"),("show ip ospf database","which LSA types exist in each area"),("show ip ospf database router | network | summary | asbr-summary | external | nssa-external","drill into one LSA type"),("show ip ospf border-routers","ABRs/ASBRs this router knows"),("debug ip ospf hello","'Hello from x with mismatched Stub/Transit area option bit'")])

add("1.10",2,"virtual link and path preference",r'''
! on both ABRs; transit area 4 must not be stub/NSSA
router ospf 1
 area 4 virtual-link 3.3.3.3
''',r'''
R1# show ip ospf virtual-links
»Virtual Link OSPF_VL0 to router 3.3.3.3 is up
  Run as demand circuit
  DoNotAge LSA allowed.
»  Transit area 4, via interface GigabitEthernet0/3
  Topology-MTID    Cost    Disabled     Shutdown      Topology Name
        0           2         no          no            Base

R1# show ip route ospf
O        10.2.0.0/16 [110/2] via 10.0.12.2, 00:10:11, Gi0/1
O IA     10.3.0.0/16 [110/3] via 10.0.12.2, 00:10:11, Gi0/1
O E1     172.21.0.0/16 [110/23] via 10.0.12.2, 00:04:02, Gi0/1
O N2     172.22.0.0/16 [110/20] via 10.0.14.4, 00:04:02, Gi0/4
''',[("show ip ospf virtual-links","up/down, transit area, cost"),("show ip ospf neighbor","virtual neighbor shows on OSPF_VL0"),("show ip route ospf","O / O IA / E1 / E2 / N1 / N2 codes"),("show ip ospf interface brief","cost per interface (reference bandwidth)")])

add("1.11",0,"BGP neighbors (iBGP, eBGP, multihop, IPv6, VRF)",r'''
router bgp 65100
 bgp router-id 1.1.1.1
 bgp log-neighbor-changes
 no bgp default ipv4-unicast
 neighbor IBGP peer-group
 neighbor IBGP remote-as 65100
 neighbor IBGP update-source Loopback0
 neighbor 2.2.2.2 peer-group IBGP
 neighbor 203.0.113.1 remote-as 65000
 neighbor 203.0.113.1 password C1sco
 neighbor 192.0.2.9 remote-as 65200
 neighbor 192.0.2.9 ebgp-multihop 2
 neighbor 192.0.2.9 update-source Loopback0
 neighbor 192.0.2.9 timers 30 90
 neighbor 2001:DB8::1 remote-as 65000
 !
 address-family ipv4 unicast
  neighbor IBGP activate
  neighbor IBGP next-hop-self
  neighbor 203.0.113.1 activate
  neighbor 192.0.2.9 activate
 exit-address-family
 address-family ipv6 unicast
  neighbor 2001:DB8::1 activate
 exit-address-family
 address-family ipv4 vrf RED
  neighbor 10.0.12.2 remote-as 65010
  neighbor 10.0.12.2 activate
 exit-address-family
''',r'''
R1# show bgp ipv4 unicast summary
BGP router identifier 1.1.1.1, local AS number 65100
Neighbor      V    AS  MsgRcvd MsgSent  TblVer InQ OutQ Up/Down  State/PfxRcd
2.2.2.2       4 65100     1203    1199      42   0    0 18:02:11           12
»192.0.2.9     4 65200        0       0       1   0    0 never    Idle
203.0.113.1   4 65000      806     790      42   0    0 12:41:05          850

R1# show bgp ipv4 unicast neighbors 192.0.2.9 | include state|TTL|hops
BGP neighbor is 192.0.2.9,  remote AS 65200, external link
»  BGP state = Idle
»  External BGP neighbor may be up to 2 hops away.
''',[("show bgp ipv4 unicast summary","state (Idle/Active) or prefix count"),("show bgp ipv4 unicast neighbors IP","state, hold/keepalive, TTL/hops, update-source, capabilities (route refresh, 4-byte AS)"),("ping IP source Loopback0","loopback-to-loopback reachability"),("show bgp ipv6 unicast summary","IPv6 AF neighbors activated?"),("show bgp vpnv4 unicast vrf RED summary","VRF neighbors (VRF needs an RD)"),("syslog","%BGP-5-ADJCHANGE, %TCP-6-BADAUTH (MD5 mismatch)")],"OCG · INE · PCG")

add("1.11",1,"BGP policies and best path",r'''
ip prefix-list OUR-NETS permit 198.51.100.0/24
!
route-map ISP-A-IN permit 10
 set local-preference 200
route-map ISP-B-OUT permit 10
 match ip address prefix-list OUR-NETS
 set as-path prepend 65100 65100 65100
!
router bgp 65100
 neighbor 198.51.100.254 remote-as 65300
 address-family ipv4 unicast
  network 198.51.100.0 mask 255.255.255.0
  neighbor 203.0.113.1 route-map ISP-A-IN in
  neighbor 203.0.113.1 prefix-list OUR-NETS out
  neighbor 203.0.113.1 remove-private-as
  neighbor 198.51.100.254 route-map ISP-B-OUT out
!
R1# clear bgp ipv4 unicast 203.0.113.1 soft in
''',r'''
R1# show bgp ipv4 unicast | begin Network
     Network          Next Hop        Metric LocPrf Weight Path
»*>   0.0.0.0          203.0.113.1          0    200      0 65000 i
 * i  0.0.0.0          10.0.24.4            0    100      0 65001 i
 *>   198.51.100.0/24  0.0.0.0              0         32768 i

R2# show bgp ipv4 unicast 172.16.0.0/16
BGP routing table entry for 172.16.0.0/16, version 0
»Paths: (1 available, no best path)
  Not advertised to any peer
  65000
»    203.0.113.1 (inaccessible) from 1.1.1.1 (1.1.1.1)
      Origin IGP, metric 0, localpref 200, valid, internal
''',[("show bgp ipv4 unicast","> best, i internal, LocPrf, Weight, AS path"),("show bgp ipv4 unicast PREFIX","all paths, why not best, 'inaccessible' next hop"),("show bgp ipv4 unicast neighbors IP advertised-routes","what you send (outbound filter result)"),("show bgp ipv4 unicast neighbors IP routes","what you accepted (inbound filter result)"),("clear bgp ipv4 unicast IP soft in | out","apply policy without resetting the session"),("show ip prefix-list detail / show route-map","hits on the policy")])

add("1.11",2,"route reflector",r'''
! on the RR only
router bgp 65100
 address-family ipv4 unicast
  neighbor 2.2.2.2 route-reflector-client
  neighbor 3.3.3.3 route-reflector-client
''',r'''
Client2# show bgp ipv4 unicast 10.30.0.0/16
BGP routing table entry for 10.30.0.0/16, version 51
Paths: (1 available, best #1, table default)
  Local
    3.3.3.3 (metric 3) from 1.1.1.1 (1.1.1.1)
      Origin IGP, metric 0, localpref 100, valid, internal, best
»      Originator: 3.3.3.3, Cluster list: 1.1.1.1

RR# show bgp ipv4 unicast neighbors 2.2.2.2 | include Reflector
»  Route-Reflector Client
''',[("show bgp ipv4 unicast PREFIX","Originator and Cluster list on reflected routes"),("show bgp ipv4 unicast neighbors IP","'Route-Reflector Client' set on the RR"),("show bgp ipv4 unicast summary (client)","only one iBGP session needed (to the RR)")])

add("2.1",0,"MPLS/LDP (verify)",r'''
mpls ldp router-id Loopback0 force
interface GigabitEthernet0/1
 mpls ip
''',r'''
R1# show mpls ldp neighbor
    Peer LDP Ident: 2.2.2.2:0; Local LDP Ident 1.1.1.1:0
»        TCP connection: 2.2.2.2.646 - 1.1.1.1.35221
        State: Oper; Msgs sent/rcvd: 52/50; Downstream
        Up time: 00:21:14

R1# show mpls forwarding-table
Local  Outgoing   Prefix          Bytes Label   Outgoing   Next Hop
Label  Label      or Tunnel Id    Switched      interface
»16     Pop Label  2.2.2.2/32      0             Gi0/1      10.0.12.2
17     18         3.3.3.3/32      0             Gi0/1      10.0.12.2
''',[("show mpls interfaces","MPLS enabled on the interface"),("show mpls ldp neighbor","LDP session Oper, TCP 646"),("show mpls ldp bindings","LIB: all label bindings"),("show mpls forwarding-table","LFIB: Pop Label = PHP")])

add("2.2",0,"PE VRF + MP-BGP (verify)",r'''
vrf definition CUST-A
 rd 65000:1
 address-family ipv4
  route-target export 65000:100
  route-target import 65000:100
!
router bgp 65000
 neighbor 4.4.4.4 remote-as 65000
 neighbor 4.4.4.4 update-source Loopback0
 address-family vpnv4
  neighbor 4.4.4.4 activate
  neighbor 4.4.4.4 send-community extended
 address-family ipv4 vrf CUST-A
  neighbor 10.1.1.2 remote-as 65101
  neighbor 10.1.1.2 activate
''',r'''
PE1# show bgp vpnv4 unicast all | begin Network
     Network          Next Hop        Metric LocPrf Weight Path
»Route Distinguisher: 65000:1 (default for vrf CUST-A)
 *>   10.10.0.0/16     10.1.1.2             0             0 65101 i
»*>i  10.20.0.0/16     4.4.4.4              0    100      0 65102 i
''',[("show vrf detail","RD, import/export RTs"),("show bgp vpnv4 unicast all summary","VPNv4 session to the other PE"),("show bgp vpnv4 unicast vrf NAME","customer routes per VRF"),("show ip route vrf NAME","imported routes installed")])

add("2.3",0,"DMVPN Phase 3 hub + spoke",r'''
! HUB
interface Tunnel100
 ip address 192.168.100.11 255.255.255.0
 ip mtu 1400
 ip tcp adjust-mss 1360
 ip nhrp network-id 100
 ip nhrp map multicast dynamic
 ip nhrp redirect
 no ip split-horizon eigrp 100
 tunnel source GigabitEthernet0/1
 tunnel mode gre multipoint
 tunnel key 100
 tunnel protection ipsec profile DMVPN-PROF
!
! SPOKE
interface Tunnel100
 ip address 192.168.100.31 255.255.255.0
 ip mtu 1400
 ip tcp adjust-mss 1360
 ip nhrp network-id 100
 ip nhrp nhs 192.168.100.11 nbma 172.16.11.1 multicast
 ip nhrp shortcut
 tunnel source GigabitEthernet0/1
 tunnel mode gre multipoint
 tunnel key 100
 tunnel protection ipsec profile DMVPN-PROF
''',r'''
Hub# show dmvpn
Legend: Attrb --> S - Static, D - Dynamic, I - Incomplete
Interface: Tunnel100, IPv4 NHRP Details
Type:Hub, NHRP Peers:2,
 # Ent  Peer NBMA Addr  Peer Tunnel Add  State  UpDn Tm  Attrb
 ----- --------------- ---------------- ----- -------- -----
»    1 172.16.21.1     192.168.100.21      UP 00:12:01     D
»    1 172.16.31.1     192.168.100.31      UP 00:11:47     D

Spoke31# show ip route nhrp
»H     10.4.4.0/24 [250/255] via 192.168.100.41, 00:00:15, Tunnel100

Spoke31# show ip nhrp 192.168.100.41
192.168.100.41/32 via 192.168.100.41
   Tunnel100 created 00:00:15, expire 01:59:44
»   Type: dynamic, Flags: router used nhop rib
   NBMA address: 172.16.41.1
''',[("show dmvpn [detail]","peers UP, D = dynamic (registered), NHRP state"),("show ip nhrp [brief]","tunnel ↔ NBMA mappings, static vs dynamic"),("show ip nhrp nhs detail","spoke: NHS reachable, registration requests/replies"),("show ip route nhrp","H routes = Phase 3 shortcuts installed"),("show interface Tunnel100","line protocol, tunnel source/mode/key"),("debug nhrp packet","registration, resolution, redirect messages")])

add("2.3",1,"IPsec for DMVPN",r'''
crypto isakmp policy 10
 encryption aes 256
 hash sha256
 authentication pre-share
 group 14
crypto isakmp key DMVPNKEY address 0.0.0.0
!
crypto ipsec transform-set TS esp-aes 256 esp-sha256-hmac
 mode transport
crypto ipsec profile DMVPN-PROF
 set transform-set TS
!
interface Tunnel100
 tunnel protection ipsec profile DMVPN-PROF
''',r'''
Spoke31# show crypto isakmp sa
IPv4 Crypto ISAKMP SA
dst             src             state          conn-id status
»172.16.11.1     172.16.31.1     QM_IDLE           1001 ACTIVE

Spoke31# show crypto ipsec sa | include peer|pkts
   current_peer 172.16.11.1 port 500
»    #pkts encaps: 1520, #pkts encrypt: 1520, #pkts digest: 1520
»    #pkts decaps: 1498, #pkts decrypt: 1498, #pkts verify: 1498
''',[("show crypto isakmp sa","QM_IDLE = good · MM_NO_STATE = phase 1 fails"),("show crypto ipsec sa","encaps/decaps both growing; one side 0 = one-way problem"),("show crypto ipsec profile","profile + transform set bound"),("debug crypto isakmp","PSK mismatch, no matching policy"),("syslog %TUN-5-RECURDOWN","recursive routing on the tunnel")])

add("3.1",0,"AAA with TACACS+, RADIUS and local fallback",r'''
aaa new-model
username admin privilege 15 secret L0calBackup
!
tacacs server TAC1
 address ipv4 10.0.10.51
 key TACKEY
radius server RAD1
 address ipv4 10.0.10.52 auth-port 1812 acct-port 1813
 key RADKEY
aaa group server tacacs+ TACGROUP
 server name TAC1
 ip tacacs source-interface Loopback0
!
aaa authentication login VTY_ACCESS group TACGROUP local
aaa authentication login CONSOLE local
aaa authorization exec VTY_ACCESS group TACGROUP local
aaa accounting commands 15 default start-stop group TACGROUP
!
line con 0
 login authentication CONSOLE
line vty 0 4
 login authentication VTY_ACCESS
 authorization exec VTY_ACCESS
''',r'''
R1# test aaa group TACGROUP admin Cisco123 legacy
Attempting authentication test to server-group TACGROUP using tacacs+
»User was successfully authenticated.

R1# show tacacs
Tacacs+ Server - public  :
               Server name: TAC1
            Server address: 10.0.10.51
               Server port: 49
              Socket opens:         12
»           Socket Timeouts:          0
   Failed Connect Attempts:          0

R1# debug aaa authentication
AAA/AUTHEN/LOGIN (00000012): Pick method list 'VTY_ACCESS'
»TPLUS: Received authen response status FAIL (3)
''',[("show run | section aaa|tacacs|radius|line","list exists, applied to the right line, local user present"),("test aaa group NAME USER PASS legacy","server reachable + credentials valid"),("show tacacs / show aaa servers","timeouts, failed connects, server UP/DEAD"),("debug aaa authentication","which method list is picked, PASS/FAIL/ERROR"),("debug tacacs / debug radius","key mismatch, no response"),("show users","who is logged in where")],"OCG · ITPRO")

add("3.2",0,"IPv4/IPv6 ACLs incl. time-based",r'''
time-range WORKHOURS
 periodic weekdays 8:00 to 17:00
!
ip access-list extended EDGE-IN
 permit ospf any any
 permit tcp any any eq bgp
 permit tcp any eq bgp any
 permit tcp 10.99.0.0 0.0.0.255 any eq 22 time-range WORKHOURS
 deny   ip any any log
interface GigabitEthernet0/0
 ip access-group EDGE-IN in
!
ipv6 access-list V6-IN
 permit icmp any any nd-na
 permit icmp any any nd-ns
 permit tcp 2001:DB8:99::/64 any eq 22
 deny ipv6 any any log
interface GigabitEthernet0/0
 ipv6 traffic-filter V6-IN in
''',r'''
R1# show access-lists EDGE-IN
Extended IP access list EDGE-IN
    10 permit ospf any any (2210 matches)
    20 permit tcp any any eq bgp (310 matches)
    30 permit tcp any eq bgp any (298 matches)
»    40 permit tcp 10.99.0.0 0.0.0.255 any eq 22 time-range WORKHOURS (inactive)
    50 deny ip any any log (45 matches)

R1# show ip interface GigabitEthernet0/0 | include access list
  Outgoing access list is not set
»  Inbound  access list is EDGE-IN
''',[("show access-lists / show ipv6 access-list","entry order and match counters"),("show ip interface INT","which ACL, which direction"),("show ipv6 interface INT","IPv6 traffic filter attached"),("show time-range + show clock","time-range active/inactive, clock correct"),("syslog %SEC-6-IPACCESSLOGP","what the log keyword caught")],"OCG · NETACAD")

add("3.2",1,"uRPF",r'''
interface GigabitEthernet0/0
 ip verify unicast source reachable-via rx allow-default 199
interface GigabitEthernet0/1
 ip verify unicast source reachable-via any
 ipv6 verify unicast source reachable-via any
!
access-list 199 permit ip 10.255.1.0 0.0.0.255 any
access-list 199 deny   ip any any log-input
''',r'''
R1# show ip interface GigabitEthernet0/0 | include verify|drops
»  IP verify source reachable-via RX, allow default, ACL 199
»   35 verification drops
   0 suppressed verification drops
''',[("show ip interface INT","uRPF mode, options, verification drops"),("show ip cef SOURCE","route back to the source and its interface"),("show ip traffic | include RPF","global unicast RPF drop counter"),("show access-lists 199","exceptions permitted / drops logged")],"CSLG · PCG")

add("3.3",0,"CoPP",r'''
ip access-list extended COPP-ROUTING
 permit ospf any any
 permit eigrp any any
 permit tcp any any eq bgp
 permit tcp any eq bgp any
ip access-list extended COPP-MGMT
 permit tcp 10.99.0.0 0.0.0.255 any eq 22
 permit tcp 10.99.0.0 0.0.0.255 any eq telnet
 permit tcp 10.99.0.0 0.0.0.255 any eq www
 permit tcp 10.99.0.0 0.0.0.255 any eq 443
 permit udp 10.99.0.0 0.0.0.255 any eq snmp
!
class-map match-all CM-ROUTING
 match access-group name COPP-ROUTING
class-map match-all CM-MGMT
 match access-group name COPP-MGMT
policy-map PM-COPP
 class CM-ROUTING
  police 256000 conform-action transmit exceed-action transmit
 class CM-MGMT
  police 128000 conform-action transmit exceed-action drop
 class class-default
  police 32000 conform-action transmit exceed-action drop
!
control-plane
 service-policy input PM-COPP
''',r'''
R1# show policy-map control-plane
 Control Plane
  Service-policy input: PM-COPP
    Class-map: CM-MGMT (match-all)
      1250 packets, 98000 bytes
      Match: access-group name COPP-MGMT
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
»        exceeded 402 packets, 52000 bytes; actions:
»          drop
''',[("show policy-map control-plane","per class: matched packets, conformed vs exceeded"),("show access-lists COPP-*","is the traffic matched by the intended ACL?"),("show class-map","class → ACL binding, match-all/any"),("show run | section control-plane","policy attached, direction input, exact (case-sensitive) name")],"OCG · CSLG")

add("3.4",0,"IPv6 first hop security (verify)",r'''
ipv6 nd raguard policy HOSTS
 device-role host
ipv6 dhcp guard policy CLIENTS
 device-role client
device-tracking policy DT
 tracking enable
!
vlan configuration 10
 device-tracking attach-policy DT
interface GigabitEthernet1/0/10
 ipv6 nd raguard attach-policy HOSTS
 ipv6 dhcp guard attach-policy CLIENTS
''',r'''
SW1# show device-tracking database
Binding Table has 2 entries, 2 dynamic (limit 200000)
Codes: L - Local, S - Static, ND - Neighbor Discovery, DH6 - IPv6 DHCP
    Network Layer Address        Link Layer Address  Interface  vlan  age  state
»ND  FE80::A8BB:CCFF:FE00:1100    aabb.cc00.1100      Gi1/0/10    10   42s  REACHABLE
»DH6 2001:DB8:10::25              aabb.cc00.1100      Gi1/0/10    10   42s  REACHABLE
''',[("show device-tracking database","binding table: address, MAC, port, how learned"),("show ipv6 nd raguard policy NAME","device role and attached ports"),("show ipv6 dhcp guard policy NAME","client/server role per port"),("show device-tracking policies","which policies are attached where")],"CSLG · PS")

add("4.1",0,"console, VTY, SSH, HTTPS, SCP, (T)FTP",r'''
hostname R1
ip domain name lab.local
crypto key generate rsa modulus 2048
ip ssh version 2
username admin privilege 15 secret Adm1n!
!
ip access-list standard MGMT
 permit 10.99.0.0 0.0.0.255
line con 0
 logging synchronous
 exec-timeout 10 0
 login local
line vty 0 4
 access-class MGMT in
 transport input ssh
 login local
!
no ip http server
ip http secure-server
ip http authentication local
!
aaa new-model
aaa authentication login default local
aaa authorization exec default local
ip scp server enable
!
ip ftp username backup
ip ftp password B4ckup
R1# copy tftp://10.99.0.5/R1.cfg running-config
''',r'''
R1# show ip ssh
»SSH Enabled - version 2.0
Authentication methods:publickey,keyboard-interactive,password
Authentication timeout: 120 secs; Authentication retries: 3

R1# show users
    Line       User       Host(s)       Idle       Location
*  0 con 0                idle          00:00:00
»866 vty 0     admin      idle          00:00:12   10.99.0.20

R1# show access-lists MGMT
Standard IP access list MGMT
»    10 permit 10.99.0.0, wildcard bits 0.0.0.255 (6 matches)
''',[("show ip ssh / show ssh","SSH enabled, version, active sessions"),("show crypto key mypubkey rsa","RSA key exists (needs hostname + domain name)"),("show line vty 0 / show run | section line","transport input, access-class, login method"),("show access-lists MGMT","VTY ACL matches"),("show ip http server status","HTTP/HTTPS enabled, auth method"),("debug ip ssh","SSH negotiation failures")])

add("4.2",0,"SNMPv2c and SNMPv3",r'''
ip access-list standard SNMP-ACL
 permit 10.99.0.10
snmp-server community PUB-RO ro SNMP-ACL
!
snmp-server view ALL iso included
snmp-server group NMS-GRP v3 priv read ALL access SNMP-ACL
snmp-server user nmsuser NMS-GRP v3 auth sha AuthPass1 priv aes 128 PrivPass1
snmp-server host 10.99.0.10 version 3 priv nmsuser
snmp-server enable traps
''',r'''
R1# show snmp user
User name: nmsuser
Engine ID: 800000090300AABBCC000100
storage-type: nonvolatile        active
»Authentication Protocol: SHA
»Privacy Protocol: AES128
Group-name: NMS-GRP

R1# show snmp group
groupname: NMS-GRP                  security model:v3 priv
readview : ALL                      writeview: <no writeview specified>
row status: active                  access-list: SNMP-ACL
''',[("show snmp","packets in/out, bad community names, unknown users"),("show snmp user","v3 users (not in running-config), auth/priv protocols"),("show snmp group","security model/level, views, ACL"),("show snmp host","trap receivers and version"),("debug snmp packets","requests arriving? from which manager?")])

add("4.3",0,"syslog, timestamps, conditional debug, telemetry (telemetry output varies by IOS XE release)",r'''
service timestamps log datetime msec localtime show-timezone
service timestamps debug datetime msec localtime
ntp server 10.99.0.1
logging buffered 64000 informational
logging console warnings
logging host 10.99.0.20
logging trap notifications
logging source-interface Loopback0
!
R1# debug condition interface GigabitEthernet0/2
R1# debug ip ospf adj
R1# terminal monitor
R1# undebug all
!
! model-driven telemetry (IOS XE), period in 1/100 s
telemetry ietf subscription 101
 encoding encode-kvgpb
 filter xpath /process-cpu-ios-xe-oper:cpu-usage/cpu-utilization/five-seconds
 stream yang-push
 update-policy periodic 6000
 receiver ip address 10.99.0.30 57500 protocol grpc-tcp
''',r'''
R1# show logging
Syslog logging: enabled
    Console logging: level warnings, 12 messages logged
    Monitor logging: level debugging, 0 messages logged
    Buffer logging:  level informational, 210 messages logged
»    Trap logging: level notifications, 98 message lines logged
»        Logging to 10.99.0.20  (udp port 514, audit disabled, link up)
Log Buffer (64000 bytes):
*Nov  7 14:02:11.384 CET: %OSPF-5-ADJCHG: Process 1, Nbr 3.3.3.3 on GigabitEthernet0/2 from LOADING to FULL

R1# show debugging
»Condition 1: interface Gi0/2 (1 flags triggered)
OSPF: OSPF adjacency debugging is on

R1# show telemetry ietf subscription 101 detail
  Subscription ID: 101
»  State: Valid
  Stream: yang-push
  Update Trigger: periodic, Period: 6000
''',[("show logging","levels per destination, server, buffer contents"),("show debugging / show debug condition","what's on and what it's limited to"),("show clock detail / show ntp status","timestamps trustworthy?"),("terminal monitor","see logs/debugs in an SSH session"),("show telemetry ietf subscription all [detail]","subscription valid, receiver connected")])

add("4.4",0,"DHCP server, relay, client, DHCPv6",r'''
ip dhcp excluded-address 10.1.20.1 10.1.20.10
ip dhcp pool VLAN20
 network 10.1.20.0 255.255.255.0
 default-router 10.1.20.1
 dns-server 10.99.0.53
 option 150 ip 10.99.0.60
 lease 7
!
! relay on the client-facing interface
interface GigabitEthernet0/0.20
 ip helper-address 10.99.0.67
! router as DHCP client
interface GigabitEthernet0/2
 ip address dhcp
!
! IPv6 stateless DHCPv6 + relay
ipv6 dhcp pool V6-STATELESS
 dns-server 2001:DB8:99::53
 domain-name lab.local
interface GigabitEthernet0/0.30
 ipv6 nd other-config-flag
 ipv6 dhcp server V6-STATELESS
interface GigabitEthernet0/0.40
 ipv6 dhcp relay destination 2001:DB8:99::67
''',r'''
R1# show ip dhcp binding
IP address    Client-ID/Hardware address  Lease expiration        Type       State
»10.1.20.11    0100.5079.6668.03           Nov 14 2026 02:10 PM    Automatic  Active

R1# show ip dhcp pool VLAN20
Pool VLAN20 :
 Total addresses                : 254
 Leased addresses               : 1
 Excluded addresses             : 10

R1# debug ip dhcp server packet
»DHCPD: DHCPDISCOVER received from client 0100.5079.6668.03 through relay 10.1.20.1.
DHCPD: Sending DHCPOFFER to client 0100.5079.6668.03 (10.1.20.11).
''',[("show ip dhcp binding","leases handed out"),("show ip dhcp pool","pool size, leased, excluded"),("show ip dhcp conflict","addresses found in use (ping/ARP)"),("debug ip dhcp server packet","DISCOVER arrives? via which relay (giaddr)?"),("show ip interface INT | include Helper","helper-address on the client-facing interface"),("show ipv6 dhcp pool / binding / interface","DHCPv6 server and relay state"),("show dhcp lease","router as DHCP client")])

add("4.5",0,"IP SLA, tracking, failover",r'''
ip sla 1
 icmp-echo 8.8.8.8 source-interface GigabitEthernet0/1
 frequency 5
ip sla schedule 1 life forever start-time now
!
track 1 ip sla 1 reachability
 delay down 10 up 15
!
ip route 0.0.0.0 0.0.0.0 203.0.113.1 track 1
ip route 0.0.0.0 0.0.0.0 198.51.100.1 5
!
! jitter (far end needs: ip sla responder)
ip sla 2
 udp-jitter 10.20.0.1 16384 codec g711alaw
ip sla schedule 2 life forever start-time now
''',r'''
R1# show ip sla statistics 1
IPSLAs Latest Operation Statistics

IPSLA operation id: 1
»        Latest RTT: 12 milliseconds
Latest operation return code: OK
Number of successes: 342
Number of failures: 0
Operation time to live: Forever

R1# show track 1
Track 1
  IP SLA 1 reachability
»  Reachability is Up
    3 changes, last change 00:42:10
  Delay up 15 secs, down 10 secs
  Tracked by:
    Static IP Routing 0
''',[("show ip sla configuration","target, source, frequency, schedule"),("show ip sla statistics [details]","return code, RTT, successes/failures, jitter values"),("show track [brief]","state, changes, what uses the track"),("show ip route 0.0.0.0","which default route is installed now"),("show ip sla responder","far end ready for udp-jitter"),("debug ip sla trace / error","probe failures")])

add("4.6",0,"Flexible NetFlow with IPFIX export",r'''
flow record REC-V4
 match ipv4 source address
 match ipv4 destination address
 match ipv4 protocol
 match transport source-port
 match transport destination-port
 match interface input
 collect counter bytes
 collect counter packets
!
flow exporter EXP-COLL
 destination 10.99.0.70
 source Loopback0
 transport udp 2055
 export-protocol ipfix
!
flow monitor MON-V4
 record REC-V4
 exporter EXP-COLL
 cache timeout active 60
!
interface GigabitEthernet0/0
 ip flow monitor MON-V4 input
''',r'''
R1# show flow monitor MON-V4 cache format table
Cache type:                Normal (Platform cache)
»Current entries:           23
IPV4 SRC ADDR  IPV4 DST ADDR  TRNS SRC PORT  TRNS DST PORT  IP PROT  bytes  pkts
10.1.20.11     10.99.0.80             51544            443        6  84211   120

R1# show flow exporter EXP-COLL statistics
Flow Exporter EXP-COLL:
  Packet send statistics (last cleared 00:30:02 ago):
»    Successfully sent:         412     (521004 bytes)
  Client send statistics:
    Client: Flow Monitor MON-V4
      Records added:           2300
        - sent:                2300
''',[("show flow record / exporter / monitor","definitions and bindings"),("show flow interface INT","monitor applied, direction"),("show flow monitor NAME cache","flows being collected"),("show flow exporter NAME statistics","sent vs errors (no route, ACL)"),("show flow exporter templates","v9/IPFIX templates sent to the collector")],"PCG · CSLG")

add("4.7",0,"Assurance troubleshooting workflow",r'''
! GUI workflow (no CLI): Catalyst Center → Assurance
1. Health → Network Health: overall score, worst sites/devices
2. Click a device → Device 360: CPU, memory, temperature,
   interfaces, control/data plane KPIs, issues over time
3. Health → Client Health → Client 360: onboarding times
   (association, AAA, DHCP), RSSI, physical link
4. Run Path Trace between two hosts: hop-by-hop path, ACLs
5. Move the timeline back (time travel) to when it failed
6. Issues → open the issue → suggested actions
''',r'''
Device 360 – DIST-1                 Health: 4 (Fair)
»  Reachability: OK     CPU: 92 %     Memory: 61 %
  Issues (24 h):  High CPU utilization (P2)
  Interfaces:     Gi1/0/48 down at 13:52
Path Trace 10.1.20.11 → 10.99.0.80 tcp/443
»  ACCESS-3 → DIST-1 → CORE-1 (ACL BLOCK-WEB: deny)
''',[("Network Health","which site/device drags the score down"),("Device 360","KPIs and issues for one device"),("Client 360 / onboarding times","which onboarding step failed"),("Path Trace","connectivity: path and blocking ACL"),("Time travel","state at the time of the problem")],"CSLG")
