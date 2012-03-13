#Calls from trustcore etc go through this wrapper to get to the couchdb api
#Doing it this way because couchdb is probably not the final storage system
#And this way you only have to edit this file

#e.g. in dashboard.rb:
#trustio = TrustIO::CouchWrapper.new
#in the future:
#trustio = TrustIO::NamecoinWrapper.new
#in both cases:
#id=trustio.newid
#a=Nym(id, "alice")
#trustio.stash(a.to_json)

require 'couch.api'
module TrustIO
  class CouchWrapper
#Middleware to let Perspective talk to couchDB - future work includes
#implementing stash() fetch() newid() for other storage protocols
    def initialize(server,port,dbname)
      @server=Couch::Server.new(server,port,dbname)
    end
    def newid()
      @server.uuid()
    end
    def stash(json,id=nil)
      unless [String,NilClass].include?(id.class)
        raise ArgumentError, "id must be blank or String"
      end
      if id == nil
        @server.put(json,newid()).body
      else
        @server.put(json,id).body
      end
    end
    def fetch(id)
      unless id.class == String 
        raise ArgumentError, "id must be String"
      end
      @server.get(id).body
    end
    def searchNick(nick)
      json=JSON.parse(@server.searchNick(nick))
      ret=[]
      json["rows"].each do |thisrow|
        #thisrow is a hash containing keys "id", "key", "value"
        #where "key" is the string nick and "value" is the internal ID
        ret.push(fetch(thisrow["value"]))
      end
      ret #ret is an array of string json objects corresponding to found Nyms
    end
    def cleardb()
      @server.delete("")
    end
  end #of class CouchWrapper

  class Txt2Topo
#Read a set of nyms and links between those nyms from a colon-delimited file
#Expects first a list of nyms (with zero colons per line)
#Subsequently, a list of links in the format source:sink:rating
#Lines with neither exactly zero nor two colons are discarded.
#Pound sign is considered a comment. Any character except colon and pound are 
#allowed in nyms and links - so be careful of injection attacks.
#Todo: can you break stuff by including control characters?
    def importTopo(filename)
      nyms=[]
      links=[]
      doneWithNymsFlag = false 
      nocolons = /^([^:]+)$/ #line must contain at least one character
      twocolons = /^([^:]+):([^:]+):([^:]*)$/ #1st, 2nd field may not be blank
      data=File.open(filename,"r") do |thefile|
        while (line = thefile.gets)
          line.sub!(/(#.*)/, "") #chomp comments
          line.gsub!(/\s*:\s*/,":") #strip whitespace surrounding :
          line.gsub!(/^\s+/,"") #strip leading whitespace
          line.gsub!(/\s+$/,"") #strip trailing whitespace
          doneWithNymsFlag = true if twocolons.match(line)
          if nocolons.match(line) && !doneWithNymsFlag
            nyms.push($&) #what the most recent regex matched
            puts "Imported nym :"+$&
          end
          if twocolons.match(line)
            $3=="" ? tmp3=nil : tmp3=$3
            links.push([$1,$2,tmp3])
            puts "Imported link: "+$1+'->'+$2+':'+$3
          end
        end
      end
      puts "Imported #{nyms.length} nyms and #{links.length} links"
      return nyms, links
    end
  end #of class Txt2Topo
end #of module TrustIO

