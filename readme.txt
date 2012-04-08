This is a work in progress tool suite to simulate & inspect trust networks.
Presentation is through an html5 page that connects to a node.js app


INSTALL

Dependencies: couchdb, node.js, ruby.
on Arch:
$ sudo pacman -Syy; sudo pacman -S couchdb nodejs ruby
$ sudo rc.d start couchdb
$ curl -vX GET http://localhost:5984


USAGE

1) install nodejs from repo's
2) $ cd perspective
3) $ node app.js    
 connect to http://localhost:3210 in browser, enable JS

Type a name for your project
Now click on a hex to select it. The grid is blank at startup.
Click "Place Nym" and add some info. Do it again.
Click "Add link", click From, click To, type a score.
Click "Save".


WHATS GOING ON

Nym data and link data are stored in a container called a "hypercard." For 
future work, these hypercards can be signed and hashed to use with Skyhook.
Hypercards are json, stored in couchdb, see test/alice.nymcard.json.

The Front End is a web app that uses the KineticJS library client-side to draw
a hex map. It connects to node.js running on localhost, which talks to Ruby,
filtering the database to pass information back to the client's browser.

Back end - RUBY code

Uses a hardcoded couchdb at localhost:5984/persp2 in dashboard.rb

Usage:
cd perspective
irb -I lib:test #to launch an IRB session and include lib/ and test/
If you launch from elsewhere, dashboard won't be able to find the test data 
since its location is still hardcoded: txt2topo.importTopo("test/testdata.txt")

From IRB:
>> require 'dashboard'
>> d=Dashboard.new
When you do this, dashboard.rb calls TrustIO::CouchWrapper.new, which
initializes a new database called persp2, and fills it with some sample data
imported from test/testdata.txt

>> d.nyms
>> d.links
>> d.links[0].source.nick
>> d.links[1].rating.score.to_s
>> banana=Nym.new(d.trustio.newid,"banana")
>> jnana = JSON.generate(banana)
>> d.trustio.stash(jnana,banana.id)
>> d.trustio.fetch("banana") #returns an array of JSON strings - found objects 
>> JSON.parse(d.trustio.fetch("banana")) #returns a Nym object


Command line usage (todo with GLI)
perspect --host localhost --port 5984 --dbname perspective
perspect -c ~/.perspect/perspect.conf
perspect topo
  ebay  10,001 nyms 100,002 links
  test1 5 nyms 100 links
  test2 10 nyms 0 links:w

perspect topo ebay
perspect topo ~/.perspect/sample.topo.txt
perspect newnym "alice" 
  588f2af84776a13acb8d919d5a016264:alice
perspect nyminfo "alice"
  588f2af84776a13acb8d919d5a016264:alice:-50
perspect nymid "alice"
  588f2af84776a13acb8d919d5a016264
  or return -1 if there are multiple nyms matching "alice"
cat nyms.txt | perspect newnym 
#nyms.txt
588f2af84776a13acb8d919d5a016264:alice:-50
588f2af84776a13acb8d919d5a01673c:bob:25

perspect addlink 

Random ass notes:

Design goals 
Put the data in a couchdb - CHECK!
Read and display it with node.js - ALMOST CHECK!
  Build any nym topology
  Find a better name than nym topology - nymcosm macro, nymtext micro?
How'll we use this tool?
  "Build a network of 50 nyms who all trust each other a little bit. Some nyms
  trust each other substantially. A couple nyms have bad ratings due to past
  scamming activity. Can the majority of the nyms identify the bad users?"

  "Build a network of 50 lightside nyms who trust each other according to a
  normal distribution. Build a network of 50 darkside nyms who also trust each
  other according to a normal distribution. What happens when a nym in the 90th
  percentile of lightside nyms trusts a darkside nym in the 50th percentile?
  What happens when he distrusts him instead?

  "Build a network where 25 nyms share their trust information exclusively
  between themselves, but the rest of the network exchanges it globally"

  Reputation distribution:
  Uniform - Among a given n nyms, each trusts each other m amount
  Half uniform - Among a given n nyms, n/2 nyms trust the other half. This other
  half doesn't trust anyone.
  Half uniform 2 - Among n nyms, n/2 trust the other half; the other half trust
  everyone
  Normal - Sent ratings and received ratings both follow a normal distribution

Use html5 and javascript to let the client interact: CHECK
Use socket.io to get events - add new nym, set nym behavior, set cliques: CHECK

Let nodes talk to each other to exchange data - so they can share their own 
nymcosms and algorithms

Implement trust changing over time
Assign simulated behavior to nyms 
honest, honest but cheats when conditions are right
Willing to defraud/unwilling
High cash flow  <--- simulate a cash economy by giving nyms OT cash
low cash flow

Use pluggable algos to filter data, determining a set of scores for a given
web of links
Simple: "count upvotes subtract downvotes"  
Better: "favor my friend's post with a x5 modifier. Penalize my enemies with a
negative modifer. Favor friends of friends with a X2 modifier. Then count 
weighted upvotes and subtract weighted downvotes."

Use the hivemind to filter out trolls, liars, other meanies.

e.g. people who don't mind lying for direct profit. Like, you want to beat the
easy metrics? Pay some kid to build up a nym's reputation, then hand it over
to you.

The biggest group of nyms (real ppl wise) is probably ordinary people who
don't like hurting or scamming other people, and don't like being cheated.

There's plenty of ppl who are shitty and it shouldn't really be that hard for
lightside nyms to filter most of them out, if they compare notes


Other stuff the hex grid could be useful for:

==Trust Grid==
User experience:
Open a webpage, get a blank grid
Click to place a nym
Maneuver through the nymscape
Click a placed nym and drag to another nym to create a link
Type the rating score in a popup
Call Ruby code, passing in the topology, to send advanced metrics through pipe
Display map of results

==Parker's Sailing Game==
Hex map of the environment
Constant wind in one direction, plus gusts
Use movement points to maneuver. Not sure what tacking costs
Fire broadsides
MMO, ships cost money

==EVE Online world map==
Eve's map is highly interconnected and quite large (7500 systems)
Redraw map from one or more points of view 
Prioritize nearby and important stuff, somehow collapse or marginalize less
coherent / relevant links.
Automatically draw links and place systems

==Forum/UI==
Display node data as you move around on the grid. Figure out a way to scroll
through children and sort.
