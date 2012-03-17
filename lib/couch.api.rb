#via http://wiki.apache.org/couchdb/Getting_started_with_Ruby
#modified so you don't need to prepend the db name in each request
require 'net/http'
require 'json'
require 'uri'
module Couch

  class Server
    def initialize(host, port, dbname) #options = nil)
      @host = host
      @port = port
      @dbname = dbname
      #@options = options
      #Initialize db if it's not already there
      begin
        get("") #e.g. localhost:5984/perspective where dbname = perspective
      rescue => ex
        if(ex.message.match("404")) #couldn't find this database
          res=put("","")
          puts "Database created"
          addViews()
          puts "Added view for searching nyms by nick"
        elsif(ex.message.downcase.match("connection refused")) #couldn't find this database
          puts "Connection to #{host}:#{port}/#{dbname} refused. Is couchdb running?"
          raise
        else
          #some other exception
          puts "Unknown error:"
          puts ex
          raise
        end
      end   

    end

    def uuid(*num)
      if num.length==0
        #called with no parameters. return a single UUID as string
        count=1
        json_ids=request(Net::HTTP::Get.new("/_uuids")).body
        ret=JSON.parse(json_ids)["uuids"][0]
      elsif num.length==1
        #called with one parameter. return an array of UUID strings
        json_ids=request(Net::HTTP::Get.new("/_uuids?count=#{num[0]}")).body
        ret=JSON.parse(json_ids)["uuids"]
      else
        #called with at more than one parameter.
        #for each parameter, return an array of that many UUIDs
        #uuid(1,2) => ret=[ ["81a4"] , ["775e","e223"] ]
        ret=[]
        num.each do |thiscount|
          json_ids=request(Net::HTTP::Get.new("/_uuids?count=#{thiscount}")).body
          ret.push(JSON.parse(json_ids)["uuids"])
        end
      end
      ret
    end

    def delete(uri)
      request(Net::HTTP::Delete.new("/#{@dbname}/"+uri))
    end

    def get(uri)
      request(Net::HTTP::Get.new("/#{@dbname}/"+uri))
    end

    def put(json,uri)
      req = Net::HTTP::Put.new("/#{@dbname}/"+uri)
      req["content-type"] = "application/json"
      req.body = json
      request(req)
    end

    def post(json,uri)
      req = Net::HTTP::Post.new("/#{@dbname}/"+uri)
      req["content-type"] = "application/json"
      req.body = json
      request(req)
    end

    def request(req)
      res = Net::HTTP.start(@host, @port) { |http|http.request(req) }
      unless res.kind_of?(Net::HTTPSuccess)
        handle_error(req, res)
      end
      res
    end

    def addViews()
#NOTE! This is coupled to the design of TrustCore - it's assuming that a given
#Trustcore::Nym document in the couchdb has a field data[id,nick]
#It's aso assuming the name TrustCore::Nym doesn't change.
      nick2idjson = <<EOS
{
  "_id" : "_design/filter",
  "views" : {
    "nymIDByNick" : {"map" : "function(doc){if(doc.json_class=='TrustCore::Nym'){emit(doc.data[1], doc.data[0])}}" }
  }
}
EOS
      put(nick2idjson, "_design/filter")
    end
#Now we can search the database for a given nick:
#GET http://localhost:5984/persp2/_design/filter/_view/nymIDByNick?key="alice"

    def searchNick(nick)
      #use %! string delimiters because to avoid escaping doublequotes in URI while
      #also keeping the #{nick} substitution
      uri=URI.escape(%!_design/filter/_view/nymIDByNick?key="#{nick}"!)
      resjson=get(uri).body
    end

    private

    def handle_error(req, res)
      e = RuntimeError.new("#{res.code}:#{res.message}\nMETHOD:#{req.method}\nURI:#{req.path}\n#{res.body}")
      raise e
    end
  end
end
