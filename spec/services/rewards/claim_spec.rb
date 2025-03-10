require "rails_helper"

## REDO This test
RSpec.describe Rewards::Claim do
  subject(:claim_reward) { described_class.new(user: user, reward: reward).call }

  let(:user) { create :user }
  let!(:talent) { create :talent, user: user, verified: true }
  let(:source) { create :invite }

  let!(:exp) { create :experience_point, user: user, source: source, amount: 250, credited_at: Date.yesterday, description: "Invite Points" }

  # add context for each type of reward
  context "when the reward is a small tal" do
    let(:reward) { create :experience_rewards_small_tal, cost: 200 }

    it "claims the small tal reward if there is enough stock and the user has enough points" do
      claim_reward

      expect(GiveTalAsRewardJob).to have_been_enqueued.with(
        chain_id: 44787,
        amount: 500,
        to: user.wallet_id
      )
    end
  end

  context "when the reward is a medium tal" do
    let(:reward) { create :experience_rewards_medium_tal, cost: 200 }

    it "claims the medium tal reward if there is enough stock and the user has enough points" do
      claim_reward

      expect(GiveTalAsRewardJob).to have_been_enqueued.with(
        chain_id: 44787,
        amount: 1000,
        to: user.wallet_id
      )
    end
  end

  context "when the reward is a large tal" do
    let(:reward) { create :experience_rewards_large_tal, cost: 200 }

    it "claims the large tal reward if there is enough stock and the user has enough points" do
      claim_reward

      expect(GiveTalAsRewardJob).to have_been_enqueued.with(
        chain_id: 44787,
        amount: 2000,
        to: user.wallet_id
      )
    end
  end

  context "when the reward is a tiny tal" do
    let(:reward) { create :experience_rewards_tiny_tal, cost: 200 }

    it "claims the large tal reward if there is enough stock and the user has enough points" do
      claim_reward

      expect(GiveTalAsRewardJob).to have_been_enqueued.with(
        chain_id: 44787,
        amount: 10,
        to: user.wallet_id
      )
    end
  end

  context "when the reward is a cap" do
    let(:reward) { create :experience_rewards_cap, cost: 200 }
    let!(:merch_code) { create :merch_code, code: "123", experience_reward: reward, assigned: false }

    it "claims the cap code if there is enough stock and the user has enough points" do
      code = claim_reward

      expect(merch_code.reload.assigned).to eq(true)
      expect(code).to eq("123")
    end
  end

  context "when the reward is a sweater" do
    let(:reward) { create :experience_rewards_sweater, cost: 200 }
    let!(:merch_code) { create :merch_code, code: "123", experience_reward: reward, assigned: false }

    it "claims the sweater code if there is enough stock and the user has enough points" do
      code = claim_reward

      expect(merch_code.reload.assigned).to eq(true)
      expect(code).to eq("123")
    end
  end

  context "when the reward is a tshirt" do
    let(:reward) { create :experience_rewards_tshirt, cost: 200 }
    let!(:merch_code) { create :merch_code, code: "123", experience_reward: reward, assigned: false }

    it "claims the tshirt code if there is enough stock and the user has enough points" do
      code = claim_reward

      expect(merch_code.reload.assigned).to eq(true)
      expect(code).to eq("123")
    end
  end
end
