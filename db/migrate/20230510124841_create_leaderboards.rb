class CreateLeaderboards < ActiveRecord::Migration[7.0]
  def change
    create_table :leaderboards do |t|
      t.uuid :uuid, default: "gen_random_uuid()", index: true, null: false, unique: true
      t.references :race, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :score, null: false, default: 0

      t.timestamps
    end
  end
end
