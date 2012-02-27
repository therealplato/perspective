Usage:
cd perspective
irb -I . #to launch an IRB session in this folder

>> require 'dashboard'

>> d=Dashboard.new
>> d.web
>> d.web.to_json
>> puts JSON.generate(d)
>> d.crawl1

Notes
Next steps
Put the data in a couchdb
Read and display it with node.js
  Build any nym topology

    Govt agents hellbent on finding you will agressively collect information
  Find a better name than nym topology - ecosystem? society? 
  Assign simulated behavior to nyms 
    honest, honest but cheats when conditions are right
    Willing to defraud/unwilling
    High cash flow  <--- simulate a cash economy, nyms paying each other
    low cash flow        or bitcoins, build fuzzy algorithm simulators 
                         running GA's or something

  Use pluggable metrics to filter data, determining a set of scores for a given
  web of links
  Simple: "count upvotes subtract downvotes"  
  Better: "favor my friend's posts, plus their friends' posts. Then count
  upvotes, subtract downvotes,
  
  But filter out
  generally meanies

  Like people who don't mind lying for direct profit. Like, you want to beat the
  easy metrics? Pay some kid to build up a nym's reputation, then hand it over
  to you.

  The biggest group of nyms (real ppl wise) is probably ordinary people who
  don't like hurting or scamming other people, and don't like being cheated.

  There's plenty of ppl who are shitty and it shouldn't really be that hard for
  them to be
   compare notes
Use html5 and javascript to let the client interact
Use socket.io to get events - on button click, take a snapshot of sliders
Let nodes talk to each other to exchange data - so they can share their own maps
and analysis


