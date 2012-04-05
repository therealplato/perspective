
This is a work in progress tool suite to simulate & inspect trust networks.
Dependencies: couchdb, node.js

Data will be stored in couchdb, processed with node.js and ruby, and 
displayed on an html5 hex grid.

NODE.JS code
install nodejs from repo's
cd perspective/srv/
node app.js    #then connect to http://localhost:3210 in browser


RUBY code - original trust model
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
Read and display it with node.js
  Build any nym topology
  Find a better name than nym topology - ecosystem? society? nymcosm? nymtext?
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

Use html5 and javascript to let the client interact
Use socket.io to get events - add new nym, set nym behavior, set cliques

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
