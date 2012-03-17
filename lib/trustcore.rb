#!/usr/bin/ruby
require 'json'

module TrustCore
  
class Nym
#Holds information for a single identity
#Params: 
#+nick+::Nickname for this nym
  attr_accessor :id
  attr_accessor :nick
  attr_accessor :alignment
  def initialize(id, nick, alignment=0)
    fail "nick must be a string" unless nick.is_a?(String)
    fail "id must be a string" unless id.is_a?(String)
    @id=id
    @nick=nick
  end
  
  def inspect
    if @id.length > 8
      tmp_id = @id[-8..-1] #last 8 chars
    else 
      tmp_id = @id.rjust(8," ") #pad to 8 chars
    end
    "#{tmp_id}: #{@nick}"
  end
  def to_s
    "#{@nick}"
  end
  def to_json(*a)
    {'json_class' => self.class.name, 'data' => [@id, @nick]}.to_json(*a)
  end
  def self.json_create(fromhash)
    new(*fromhash['data'])
  end
end

class Link
#Creates a single trust link between two nyms
#Params:
#+source+:: +Nym+ object sending the rating
#+sink+:: +Nym+ object receiving the rating
#+rating+:: +Rating+ object associated with this link
#TODO: Refactor everything so instead of storing the entire Nym object, it just
#stores a reference to the ID of the linked nym object.
  attr_reader :id
  attr_reader :source     #read only, create a new link if nyms change
  attr_reader :sink
  attr_accessor :rating   #rating between one source and sink may change
  def initialize(id, source, sink, rating)
    unless (source.is_a?(Nym)) && (sink.is_a?(Nym))
      fail TypeError, "source and sink must both be Nym objects"
    end
    unless rating.is_a?(Rating)
      fail TypeError, "rating must be a Rating object"
    end
    @id = id
    @source = source
    @sink = sink
    @rating = rating
  end
  def inspect
    if @id.length > 8
      tmp_id = @id[-8..-1] #last 8 chars
    else 
      tmp_id = @id.rjust(8," ") #pad to 8 chars
    end
    "#{tmp_id}: #{@source.to_s} -> #{@sink.to_s} (#{@rating.to_s})"
  end
  def to_s 
    if @rating.score == nil
      "#{@source.to_s} -> #{@sink.to_s}: [no rating]"
    else
      "#{@source.to_s} -> #{@sink.to_s}: [#{@rating.to_s}]"
    end
  end
  def to_json(*a)
    {'json_class' => self.class.name, 
         'data' => [@id,@source,@sink,@rating]}.to_json(*a)
#         'myID' => @id, #reverting this for now. no access to @trustio
#         'sourceID' => @source.id,
#         'sinkID' => @sink.id,
#         'ratingID' => @rating.id}.to_json(*a)
  end
  def self.json_create(fromhash)
    new(*fromhash['data'])
#    source=JSON.parse(@trustio.fetch(fromhash['sourceID')[0])
#    new(fromhash['myID'],source,sink,rating)
  end
end

class Rating              
#Abstract class for trust ratings
#One rating shouldn't be used by multiple links
#Params:
#+score+::the trust score for this rating. extended in children classes
  attr_reader :score
  def initialize(score=nil)
    @score=score
  end

end

class BinaryRating < Rating
#A true/false/nil rating
#Params:
#+score+:: must be true/false/nil, else raises +TypeError+ 
#This only checks the type upon creation. It won't break if
#+score+ is somehow modified after object creation.
  def initialize(id,score=nil)
    if ![true,false,nil].include? score
      fail TypeError, "Only true/false/nil allowed in BinaryRating"
    end
    super(score)
    @id=id
  end
  def to_s
    case @score
    when true 
      "+"
    when false 
      "-"
    when nil 
      " "
    else 
      "?"
    end
  end
  def inspect
    if @id.length > 8
      tmp_id = @id[-8..-1] #last 8 chars
    else 
      tmp_id = @id.rjust(8," ") #pad to 8 chars
    end
    
    case @score
    when true 
      "#{tmp_id}: +"
    when false 
      "#{tmp_id}: -"
    when nil 
      "#{tmp_id}:  "
    else 
      "#{tmp_id}: ?"
    end
  end
  def to_json(*a)
    {'json_class' => self.class.name, 
          'data'=> [@id, @score]}.to_json(*a)
  end
  def self.json_create(fromhash)
#    newid = fromhash['data'][0]
#    newscore = fromhash['data'][1]
#    case newscore
#    when true
#      new(newid,true)
#    when false
#      new(newid,false)
#    when null
#      new(newid, nil) #NOTE that to_json turns nil into "null"
#    else 
#      fail 'imported score in json_create was none of "true" "false" "null"'
#    end
    new(*fromhash['data'])
  end
end

class IntegerRating < Rating
#An integer rating. Can be used with or without a range.
#Usage: IntegerRating.new(nil,nil,9001); IntegerRating.new(1,10,8)
#Params:
#+min+::the minimum score allowed. nil means no upper bound.
#+max+::the maximum score allowed. nil means no lower bound.
#+score+::the integer rating. Raises ArgumentError if outside 
#and non-nil bounds. (i.e. <min or >max.)
#Passing non-Fixnum, non-nil values into min or max will raise TypeError.
  attr_reader :min
  attr_reader :max
  def initialize(id, min, max, score=nil)
    if ![Fixnum, NilClass].include? score.class
      fail TypeError, "Passed non-Fixnum, non-nil score into IntegerRating"
    end
    if ![Fixnum, NilClass].include? min.class
      fail TypeError, "Passed non-Fixnum, non-nil minimum bound into IntegerRating"
    end
    if ![Fixnum, NilClass].include? max.class
      fail TypeError, "Passed non-Fixnum, non-nil maximum bound into IntegerRating"
    end
    #The following only tests when the rating is created
    if score && max && (score > max)
      fail ArgumentError, "Score exceeds maximum bound"
    elsif score && max && (score < min)
      fail ArgumentError, "Score less than minimum bound"
    end
    super(score)
    @id=id
    @min=min
    @max=max
  end
  def inspect
    if @id.length > 8
      tmp_id = @id[-8..-1] #last 8 chars
    else 
      tmp_id = @id.rjust(8," ") #pad to 8 chars
    end
    if @score
    "#{tmp_id}: "+ @score.rjust(4," ") #pad score to 4 characters, unless it's too long.
    else
    "#{tmp_id}:  "
    end
  end
end


class Web
  attr_accessor :links
  #def links; @links; end
  def initialize(*mylinks)
    @links=[]
    self.addLinks(*mylinks) if mylinks.length > 0
  end
  def addLinks(*mylinks)
    [*mylinks].flatten.each do |thislink|
      if thislink.is_a?(Link)
      @links << thislink
      else
        wrong = thislink.class.to_s
        fail "tried to add a non-Link to this Web (#{wrong})"
      end
    end
  end
  def to_json(*a)
    { "json_class" => self.class.name,
      "links" => @links.to_json }.to_json(*a)
  end
  def self.json_create(o)
    new(JSON.parse(*o["links"]))
  end


end #of Web class
end #of TrustCore module
