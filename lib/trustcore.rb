#!/usr/bin/ruby
module TrustCore
class Nym
#Holds information for a single identity
#Params: 
#+nick+::Nickname for this nym

  attr_accessor :nick
  def initialize(nick="alice")
    @nick=nick
  end
  def inspect
    "#<Nym: #{@nick}>"
  end
  def to_s
    "#{@nick}"
  end
end

class Link
#Creates a single trust link between two nyms
#Params:
#+source+:: +Nym+ object sending the rating
#+sink+:: +Nym+ object receiving the rating
#+rating+:: +Rating+ object associated with this link
  attr_reader :source     #read only, create a new link if nyms change
  attr_reader :sink
  attr_accessor :rating   #rating between one source and sink may change
  def initialize(source, sink, rating)
    unless (source.is_a?(Nym)) && (sink.is_a?(Nym))
      fail TypeError, "source and sink must both be Nym objects"
    end
    unless rating.is_a?(Rating)
      fail TypeError, "rating must be a Rating object"
    end
    @source = source
    @sink = sink
    @rating = rating
  end
  def inspect
    "#<Link: #{@source.to_s} -> #{@sink.to_s} (#{@rating.to_s})>"
  end
  def to_s 
    if @rating.score == nil
      "#{@source.to_s} -> #{@sink.to_s}: [no rating]"
    else
      "#{@source.to_s} -> #{@sink.to_s}: [#{@rating.to_s}]"
    end
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
  def initialize(score=nil)
    if ![true,false,nil].include? score
      fail TypeError, "Only true/false/nil allowed in BinaryRating"
    end
    super(score)
  end
  def to_s
    case @score
    when true then "+"
    when false then "-"
    when nil then " "
    else "?"
    end
  end
  def inspect
    case @score
    when true then "+"
    when false then "-"
    when nil then " "
    else "?"
    end
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
  def initialize(min, max, score=nil)
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
    @min=min
    @max=max
  end
  def inspect
    if @score
      ret=@score.rjust(4," ") #pad score to 4 characters, unless it's too long.
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
end #of Web class
end #of TrustCore module
