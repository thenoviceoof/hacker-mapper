class CreateMaps < ActiveRecord::Migration
  def self.up
    create_table :maps do |t|
      t.string :group
      t.string :members
      t.string :project
      t.string :contact

      t.integer :x
      t.integer :y

      t.timestamps
    end
  end

  def self.down
    drop_table :maps
  end
end
