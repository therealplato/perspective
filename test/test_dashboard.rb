require 'dashboard.rb'
require "test/unit"

class Dashtest < Test::Unit::TestCase
  def test_create_test_data
    d=Dashboard.new
    d.setupTestData3 #this creates a Web object
    assert_equal d.web.class, Web
    assert_equal d.web.links[0].source.to_s, "alice"
    assert_equal d.web.links[0].sink.to_s, "bob"
    assert_equal d.web.links[0].rating.to_s, "+"
  end
end

