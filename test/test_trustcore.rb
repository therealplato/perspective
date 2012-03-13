require 'trustcore'
include TrustCore
require "test/unit"

class Nymtest < Test::Unit::TestCase
  def test_nondefault_nick
    d=Nym.new("deadbeef","dobby")
    assert_equal "dobby", d.nick
  end
  def test_json
    a=Nym.new("deadbeef","Crookshanks")
    aa=JSON.generate(a)
    assert_equal %[{"json_class":"TrustCore::Nym","nick":"Crookshanks"}], aa
    b=JSON.parse(aa)
    assert_equal b.nick, "Crookshanks"
  end

end

class Ratetest < Test::Unit::TestCase
  def test_create_rating
   testnil1 = Rating.new
   testnil2 = Rating.new(nil)
   testtrue = Rating.new(true)
   testfalse= Rating.new(false)

   assert_equal nil, testnil1.score
   assert_equal nil, testnil2.score
   assert_equal true, testtrue.score
   assert_equal false, testfalse.score
  end
  def test_binary_rating
    testnil1 = BinaryRating.new("deadbeef")
    testnil2 = BinaryRating.new("deadbeef",nil)
    testtrue = BinaryRating.new("deadbeef",true)
    testfalse = BinaryRating.new("deadbeef",false)

    assert_raise TypeError do
      testbad = BinaryRating.new("deadbeef",7)
    end

    assert_raise TypeError do
      testbad2 = BinaryRating.new("deadbeef","A++")
    end
    assert_equal nil, testnil1.score
    assert_equal nil, testnil2.score
    assert_equal true, testtrue.score
    assert_equal false, testfalse.score
  end
  def test_binary_rating_json
    tt=JSON.generate(BinaryRating.new(true))
    assert_equal %[{"json_class":"TrustCore::BinaryRating","score":"true"}], tt
    ff=JSON.generate(BinaryRating.new(false))
    assert_equal %[{"json_class":"TrustCore::BinaryRating","score":"false"}], ff
    nn=JSON.generate(BinaryRating.new(nil))
    assert_equal %[{"json_class":"TrustCore::BinaryRating","score":"null"}], nn

    assert_equal JSON.parse(tt).score, true
    assert_equal JSON.parse(ff).score, false
    assert_equal JSON.parse(nn).score, nil
  end

  def test_integer_rating
    testnil1 = IntegerRating.new(1,5)
    testnil2 = IntegerRating.new(1,5,nil)
    test3 = IntegerRating.new(1,5,3)
    test4 = IntegerRating.new(nil,nil,500)

    assert_raise ArgumentError do
      test5 = IntegerRating.new(1,5,10)
    end

    assert_raise ArgumentError do
      testbad = IntegerRating.new(false)
    end

    assert_raise TypeError do
      testbad2 = IntegerRating.new(5,4,"A++")
    end
    assert_equal nil, testnil1.score
    assert_equal 1, testnil1.min
    assert_equal 5, testnil1.max
    assert_equal nil, testnil2.score
    assert_equal 3, test3.score
    assert_equal 500, test4.score
  end
end

class Linktest < Test::Unit::TestCase
  def test_link_defaults
    a=Nym.new("alice")
    b=Nym.new("bob")
    r=BinaryRating.new(true)
    ln=Link.new(a,b,r)
    
    assert_equal ln.source, a
    assert_equal ln.sink, b
    assert_equal ln.rating, r
   
    assert_equal ln.source.object_id, a.object_id
    assert_equal ln.sink.object_id, b.object_id
    assert_equal ln.rating.object_id, r.object_id
    
    assert_equal ln.source.nick, "alice"
    assert_equal ln.sink.nick, "bob"
    assert_equal ln.rating.score, true
  end
end

class Webtest < Test::Unit::TestCase
  def setup
    a=Nym.new("alice")
    b=Nym.new("bob")
    r=BinaryRating.new(true)
    @ln=Link.new(a,b,r)
    @ln2=Link.new(b,a,r)
  end
  def test_web_creation
    w1 = Web.new()
    w2 = Web.new(@ln)
    w3 = Web.new(@ln, @ln2)
    assert_equal false, w1==nil
    assert_equal w1.links, []
    assert_equal w2.links[0].source.nick, "alice"
    assert_equal w2.links[0].rating.score, true 
    assert_equal w3.links[1].source.nick, "bob"
  end
end
