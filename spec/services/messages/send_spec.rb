require "rails_helper"

RSpec.describe Messages::Send do
  subject(:send_message) do
    described_class.new.call(create_notification:, message:, receiver:, sender:)
  end

  let(:create_notification) { true }
  let(:message) { "Thanks for you support!" }
  let(:receiver) { create :user }
  let(:sender) { create :user }

  let(:create_notification_class) { CreateNotification }
  let(:create_notification_instance) { instance_double(create_notification_class, call: true) }

  let(:action_cable_server) do
    instance_double(ActionCable::Server::Base, broadcast: true)
  end

  before do
    allow(create_notification_class).to receive(:new).and_return(create_notification_instance)
    allow(ActionCable).to receive(:server).and_return(action_cable_server)
  end

  it "creates a message" do
    expect { send_message }.to change(Message, :count).from(0).to(1)
  end

  it "creates a chat" do
    expect { send_message }.to change(Chat, :count).from(0).to(1)
  end

  it "creates a chat with the correct params" do
    time = Time.zone.now

    travel_to time do
      send_message

      created_chat = Chat.last

      aggregate_failures do
        expect(created_chat.sender).to eq sender
        expect(created_chat.receiver).to eq receiver
        expect(created_chat.last_message_at.iso8601).to eq time.iso8601
        expect(created_chat.receiver_unread_messages_count).to eq 1
        expect(created_chat.sender_unread_messages_count).to eq 0
      end
    end
  end

  it "returns the message sent" do
    created_message = send_message

    expect(created_message).to eq sender.messaged.first
  end

  it "broadcasts the created message" do
    send_message

    expect(action_cable_server).to have_received(:broadcast)
  end

  context "when the sender belongs to the receiver connected users" do
    before do
      create :connection, user: receiver, connected_user: sender, connection_type: "staker"
    end

    it "initializes and calls the create notification service" do
      send_message

      expect(create_notification_class).to have_received(:new)
      expect(create_notification_instance).to have_received(:call).with(
        recipient: receiver,
        type: MessageReceivedNotification,
        extra_params: {sender_id: sender.id}
      )
    end
  end

  context "when the sender does not belong to the receiver connected users" do
    it "does not initialize the create notification service" do
      send_message

      expect(create_notification_class).not_to have_received(:new)
    end
  end

  context "when the sender and receiver are the same" do
    let(:receiver) { sender }

    it "does not send a new message" do
      expect { send_message }.not_to change(Message, :count)
    end
  end

  context "when the chat already exists" do
    let!(:chat) { create :chat, sender: receiver, receiver: sender, last_message_at: 2.days.ago }

    it "creates a new message" do
      expect { send_message }.to change(Message, :count).from(0).to(1)
    end

    it "does not create a new chat" do
      expect { send_message }.not_to change(Chat, :count)
    end

    it "updates the chat with the correct params" do
      time = Time.zone.now

      travel_to time do
        send_message

        chat.reload

        aggregate_failures do
          expect(chat.sender).to eq receiver
          expect(chat.receiver).to eq sender
          expect(chat.last_message_at.iso8601).to eq time.iso8601
          expect(chat.receiver_unread_messages_count).to eq 0
          expect(chat.sender_unread_messages_count).to eq 1
        end
      end
    end
  end

  context "when create_notification is false" do
    let(:create_notification) { false }

    it "does not initialize and call the create notification service" do
      send_message

      expect(create_notification_class).not_to have_received(:new)
      expect(create_notification_instance).not_to have_received(:call)
    end
  end
end
