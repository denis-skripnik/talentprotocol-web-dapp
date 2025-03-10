require "active_support/testing/time_helpers"
require "webmock/rspec"

RSpec.configure do |config|
  config.include ActiveSupport::Testing::TimeHelpers

  config.expect_with :rspec do |expectations|
    expectations.syntax = :expect
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.syntax = :expect
    mocks.verify_partial_doubles = true
  end

  WebMock.disable_net_connect!(allow: "localhost:9200")

  config.shared_context_metadata_behavior = :apply_to_host_groups
  config.order = :random
  config.filter_run_when_matching :focus
  config.example_status_persistence_file_path = "spec/examples.txt"
  config.disable_monkey_patching!

  if config.files_to_run.one?
    config.default_formatter = "doc"
  end

  config.profile_examples = 5
  Kernel.srand config.seed

  WebMock.disable_net_connect!(allow: "localhost:9200")
end
