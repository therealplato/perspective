Usage:
cd perspective/lib
irb -I . #to launch an IRB session and include the lib/ folder

>> require 'dashboard'

>> d=Dashboard.new
>> d.web
>> d.web.to_json
>> puts JSON.generate(d)
>> d.crawl1

Random ass notes:

Next steps
Put the data in a couchdb
Read and display it with node.js
  Build any nym topology
  Find a better name than nym topology - ecosystem? society? nymcosm?

Use html5 and javascript to let the client interact
Use socket.io to get events - add new nym, set nym behavior, set cliques

Let nodes talk to each other to exchange data - so they can share their own 
nymcosms and algorithms

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
weighted  upvotes and subtract weighted downvotes."

Use the hivemind to filter out trolls, liars, other meanies.

e.g. people who don't mind lying for direct profit. Like, you want to beat the
easy metrics? Pay some kid to build up a nym's reputation, then hand it over
to you.

The biggest group of nyms (real ppl wise) is probably ordinary people who
don't like hurting or scamming other people, and don't like being cheated.

There's plenty of ppl who are shitty and it shouldn't really be that hard for
lightside nyms to filter most of them out, if they compare notes
