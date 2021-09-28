class SyncFollowerPosts
  def initialize
  end

  def call(user_id:, follower_id:)
    ActiveRecord::Base.transaction do
      user = User.find_by!(id: user_id)
      follower = User.find_by!(id: follower_id)

      user.posts.each do |post|
        follower.feed.posts << post
      end
    end
  end
end
