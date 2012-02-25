#!/usr/bin/ruby
$LOAD_PATH << './lib'
require 'trustcore'
include TrustCore
require 'crawler'
include Crawler

class Dashboard
  attr_accessor :web
  def initialize()
    self.setupTestData#.runCrawler.displayResults
  end
  
  def setupTestData3
    @a=Nym.new("alice")
    @b=Nym.new("bob")
    @nyms = [@a,@b] 
    @links=Link.new(@a,@b, BinaryRating.new(true))
    @web=Web.new(@links)
  end
  def setupTestData
    #would be nice to do $ crawler new --nymcount=8 --behaviour=random
    @nyms=[]
    @links=[]
    @nyms << Nym.new("andrea")
    @nyms << Nym.new("briana")
    @nyms << Nym.new("claire")
    @nyms << Nym.new("diana")
    @nyms << Nym.new("erica")
    @nyms << Nym.new("fergie")
    @nyms << Nym.new("giana")
    @nyms << Nym.new("helga")

    # andrea through diana are legitimate businessppl
    #what a shitty way to build new links! 
    #fix: links share instances of ratings
    #@links<<Link.new(Andrea, Erica, BinaryRating.new(true))
    @plus = BinaryRating.new(true)
    @minus = BinaryRating.new(false)               # SOURCE  SINK    RATING
    @links << Link.new(@nyms[0], @nyms[1], @plus)  # alice   briana  +
    @links << Link.new(@nyms[0], @nyms[2], @plus)  # alice   claire  +
    @links << Link.new(@nyms[0], @nyms[3], @plus)  # alice   diana   +
    @links << Link.new(@nyms[1], @nyms[0], @plus)  # briana  alice   +
    @links << Link.new(@nyms[1], @nyms[2], @plus)  # briana  claire  +
    @links << Link.new(@nyms[2], @nyms[1], @plus)  # claire  briana  +
    #Totals:  alice.sink    1
    #         briana.sink   2
    #         claire.sink   2
    #         diana.sink    1
    @web = Web.new(@links)         
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



