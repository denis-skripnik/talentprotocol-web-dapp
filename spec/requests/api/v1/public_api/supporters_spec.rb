require "swagger_helper"
require "rails_helper"

RSpec.describe "Supporters API" do
  path "/supporters" do
    get "Retrieves the supporters of a talent" do
      tags "Supporters"
      consumes "application/json"
      produces "application/json"
      parameter name: :id, in: :query, type: :string, description: "Wallet address or username"
      parameter name: :cursor, in: :query, type: :string, description: "The cursor to fetch the next page"
      parameter name: "X-API-KEY", in: :header, type: :string, description: "Your Talent Protocol API key"

      let!(:api_key_object) { create(:api_key, :activated, access_key: access_key) }
      let(:access_key) { SecureRandom.hex }
      let(:"X-API-KEY") { access_key }

      let!(:talent_user) { create(:user, :with_talent_token, wallet_id: wallet_id, display_name: "API user") }
      let(:wallet_id) { SecureRandom.hex }
      let(:id) { wallet_id }
      let(:cursor) { nil }

      let(:user_1) { create :user }
      let(:user_2) { create :user }

      before do
        create :talent_supporter, supporter_wallet_id: user_2.wallet_id, talent_contract_id: talent_user.talent.talent_token.contract_id, amount: "2000000"
        create :talent_supporter, supporter_wallet_id: user_1.wallet_id, talent_contract_id: talent_user.talent.talent_token.contract_id, amount: "1000000"
      end

      response "200", "talent found", save_example: true do
        schema type: :object,
          properties: {
            supporters: {
              type: :array,
              items: {
                type: :object,
                properties: PublicAPI::ObjectProperties::TALENT_PROPERTIES
              }
            },
            pagination: {
              type: :object,
              properties: PublicAPI::ObjectProperties::PAGINATION_PROPERTIES
            }
          }

        run_test! do |response|
          data = JSON.parse(response.body)

          returned_usernames = data["supporters"].map { |f| f["username"] }
          returned_pagination = data["pagination"]
          aggregate_failures do
            expect(data["supporters"].count).to eq 2
            expect(returned_usernames).to match_array([user_1.username, user_2.username])

            expect(returned_pagination["total"]).to eq 2
            expect(returned_pagination["cursor"]).to eq nil
          end
        end
      end

      response "404", "talent not found" do
        let(:id) { "invalid" }
        run_test!
      end

      response "401", "unauthorized request" do
        let(:"X-API-KEY") { "invalid" }
        run_test!
      end
    end
  end
end
