require "rails_helper"

RSpec.describe "API pagination" do
  subject(:api_request) { get(api_v1_public_subscribers_path(id: id, params: params), headers: headers) }
  let!(:api_key) { create :api_key, :activated, access_key: access_key }
  let(:access_key) { SecureRandom.hex }

  let!(:user) { create :user }
  let(:id) { user.username }

  let!(:user_1) { create :user }
  let!(:user_2) { create :user }
  let!(:user_3) { create :user }
  let!(:user_4) { create :user }

  let!(:subscription_one) { create :subscription, user: user, subscriber: user_1, accepted_at: Time.current - 5.days }
  let!(:subscription_two) { create :subscription, user: user, subscriber: user_2, accepted_at: Time.current - 4.days }
  let!(:subscription_three) { create :subscription, user: user, subscriber: user_3, accepted_at: Time.current - 3.days }
  let!(:subscription_four) { create :subscription, user: user, subscriber: user_4, accepted_at: Time.current - 2.days }

  let(:params) { {} }
  let(:headers) do
    {
      "X-API-KEY": access_key
    }
  end

  before do
    # Sets the number of returned items per page
    ENV["API_PAGINATION_PER_PAGE"] = "2"
  end

  after do
    ENV["API_PAGINATION_PER_PAGE"] = nil
  end

  it "returns the correct pagination" do
    api_request

    aggregate_failures do
      expect(json[:subscribers].count).to eq 2
      expect(json[:subscribers].pluck(:username)).to eq([user_4.username, user_3.username])
      expect(json[:pagination]).to eq(
        {
          total: 4,
          cursor: subscription_three.uuid
        }
      )
    end
  end

  context "when the cursor is passed" do
    let(:params) { {cursor: subscription_three.uuid} }

    it "returns the correct pagination" do
      api_request

      aggregate_failures do
        expect(json[:subscribers].count).to eq 2
        expect(json[:subscribers].pluck(:username)).to eq([user_2.username, user_1.username])
        expect(json[:pagination]).to eq(
          {
            total: 4,
            cursor: nil
          }
        )
      end
    end
  end
end
