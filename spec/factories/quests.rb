FactoryBot.define do
  factory :quest do
    sequence :title do |n|
      "Quest ##{n}"
    end
    description { "You need to do x to get y" }
    experience_points_amount { 30 }
  end
end
