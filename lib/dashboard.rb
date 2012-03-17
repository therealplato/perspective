#!/usr/bin/ruby
require 'trustcore'
include TrustCore
require 'crawler'
include Crawler
require 'trustio'

class Dashboard
  attr_accessor :web
  attr_accessor :links
  attr_accessor :nyms
  attr_accessor :a
  attr_accessor :b
  attr_accessor :r
  attr_accessor :uuid1
  attr_accessor :w2
  def initialize()
    @trustio = TrustIO::CouchWrapper.new("localhost","5984","persp2")
    @nyms = []
    @links = []
    self.setupTestData
  end

  def saveWeb
    data=JSON.generate(@web)
    @uuid1=@trustio.newid()
    res=@trustio.stash(data,"#{@uuid1}")
    puts res
  end
  def getWeb
    res=@trustio.fetch("#{@uuid1}")
    puts res
    @w2=JSON.parse(res)
    puts @w2
  end

  def clearWeb
    res=@trustio.cleardb()
    puts res
  end

  def setupTestData
    #import sample nicks and links
    txt2topo = TrustIO::Txt2Topo.new()
    nicks, links = txt2topo.importTopo("test/testdata.txt")
    puts "nicks:" + nicks.to_s
    puts "links:" + links.to_s

    nicks.each do |thisnick|
      #see if the nicks are in the db already
      ids = @trustio.searchNick(thisnick)
      #ids is an array of json Nym objects
      if ids.length==0 then
        #Didn't find thisnick in the database; add it
        thisid=@trustio.newid
        newNym=Nym.new(thisid,thisnick)
        @nyms.push(newNym)
        json=JSON.generate(newNym)
        @trustio.stash(json,thisid)
      else
        #add the found nyms to our internal nyms list
        ids.each do |thisid|
          @nyms.push(JSON.parse(thisid))
        end
      end
    end #of thisnym block

    links.each do |thislink|
      sourceJSON=@trustio.searchNick(thislink[0])
      sinkJSON=@trustio.searchNick(thislink[1])
      ratingStr=thislink[2]
      case ratingStr
      when ""
        rating=BinaryRating.new(@trustio.newid,nil)
      when "+"
        rating=BinaryRating.new(@trustio.newid,true)
      when "-"
        rating=BinaryRating.new(@trustio.newid,false)
      else
        puts "Failed to import a non-binary rating; use one of <blank>,+,-."
        puts "Link was "+thislink[0]+":"+thislink[1]+":"+thislink[2]+"#end"
        next
      end

      if sourceJSON.length != 1 || sinkJSON.length != 1 then
        #this happens if searchNick returns zero nicks (i.e. not in db)
        #and also if it returns more than one (i.e. two identical nicks in db)
        puts "Skipping "+thislink[0]+":"+thislink[1]+":"+thislink[2]+" due to 
             ambiguity"
        next
      else
        source=JSON.parse(sourceJSON[0])
        sink=JSON.parse(sinkJSON[0])
        thisid=@trustio.newid
        newLink=Link.new(thisid, source, sink, rating)
        @links.push(newLink)
        @trustio.stash(JSON.generate(newLink), thisid)
      end
    end #of thislink block


  end
  def setupTestData3
    @a=Nym.new("deadbeef","alice")
    @b=Nym.new("foobar","bob")
    @nyms = [@a,@b] 
    @r=BinaryRating.new("8123",true)
    @links=Link.new("01234567",@a,@b, @r)
    @web=Web.new(@links)

  end

  def listParticipants
    @nyms.sort{|a,b|a.nick.downcase <=> b.nick.downcase}.each do |thisnym|
      puts thisnym.to_s
    end
  end
  def crawl1
    #puts "passing web into crawler:\n"+@web.inspect
    myCrawler=ExhaustiveBinaryCrawler.new(@web)
    puts myCrawler.crawl
  end
  
  def displayResults
    
  end
end



#  def setupTestData2
#    #would be nice to do $ crawler new --nymcount=8 --behaviour=random
#    @nyms=[]
#    @links=[]
#    @nyms << Nym.new("andrea")
#    @nyms << Nym.new("briana")
#    @nyms << Nym.new("claire")
#    @nyms << Nym.new("diana")
#    @nyms << Nym.new("erica")
#    @nyms << Nym.new("fergie")
#    @nyms << Nym.new("giana")
#    @nyms << Nym.new("helga")
#
#    # andrea through diana are legitimate businessppl
#    #what a shitty way to build new links! 
#    #fix: links share instances of ratings
#    #@links<<Link.new(Andrea, Erica, BinaryRating.new(true))
#    @plus = BinaryRating.new(true)
#    @minus = BinaryRating.new(false)               # SOURCE  SINK    RATING
#    @links << Link.new(@nyms[0], @nyms[1], @plus)  # alice   briana  +
#    @links << Link.new(@nyms[0], @nyms[2], @plus)  # alice   claire  +
#    @links << Link.new(@nyms[0], @nyms[3], @plus)  # alice   diana   +
#    @links << Link.new(@nyms[1], @nyms[0], @plus)  # briana  alice   +
#    @links << Link.new(@nyms[1], @nyms[2], @plus)  # briana  claire  +
#    @links << Link.new(@nyms[2], @nyms[1], @plus)  # claire  briana  +
#    #Totals:  alice.sink    1
#    #         briana.sink   2
#    #         claire.sink   2
#    #         diana.sink    1
#    @web = Web.new(@links)         
#  end
