require "rails_helper"

RSpec.describe MarketingArticle, type: :model do
  describe "associations" do
    it { is_expected.to belong_to(:user) }
  end
end
