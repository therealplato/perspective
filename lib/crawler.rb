require 'trustcore'
include TrustCore

module Crawler
class Crawler
  def initialize(web)
    fail "need a Web to crawl" unless web.is_a?(Web)
    @web=web
    @links=@web.links
  end
end

class ExhaustiveBinaryCrawler < Crawler
  # Checks every single combination of nodes
  # Returns an array of hashes [ {Nym => Score}]
  def initialize(web)
    super(web)
    #puts "after super, @web.inspect:\n"+@web.inspect
    @scores={}  #We'll return this
  end
  def crawl
    #Count up the number of received positive ratings, then subtract the 
    #number of negative ratings, for each nym.
    puts @scores
    @links.each do |thislink|
      #puts "entered crawl do loop for link\n"+thislink.inspect
      unless thislink.is_a?(Link)
        fail "found a non-Link object in this Crawler's @web"
      end
      #puts thislink.rating.class
      unless thislink.rating.is_a?(BinaryRating)
        fail "this binary crawler only handles binary ratings"
      end

      if !@scores.include?(thislink.sink)   #sink Nym is not yet in scores
        @scores.merge!({thislink.sink => 0}) #add it
        #puts "added #{thislink.sink.to_s} to @scores, scores now is:\n"+@scores.inspect
      end

      case thislink.rating.score        #Positive rating
      when true
        @scores[thislink.sink] += 1   #increment score for this rating
      when false
        @scores[thislink.sink] -= 1   #Negative rating, decrement score
      when nil
      else fail "unexpected non-trinary rating"
      end
    end
    @scores.each_pair do |nym, score|
      puts nym.to_s + ": " + score.to_s
    end
  end
end
end #of module Crawler
