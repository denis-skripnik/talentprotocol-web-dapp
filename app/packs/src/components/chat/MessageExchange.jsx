import React, { useEffect } from "react";
import Message from "./Message";
import dayjs from "dayjs";

import ThemedButton from "src/components/design_system/button";
import TalentProfilePicture from "../talent/TalentProfilePicture";
import P2 from "src/components/design_system/typography/p2";
import TextArea from "src/components/design_system/fields/textarea";
import { Send, ArrowLeft } from "src/components/icons";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const EmptyMessages = () => {
  return <div className="my-auto align-self-center">Send your first message!</div>;
};

const CommunicateFirst = () => {
  return <div className="my-auto align-self-center">Find someone to chat with!</div>;
};

const ChatHeader = ({ profilePictureUrl, link, lastOnline, username }) => {
  const date = dayjs();
  const lastOnlineDay = dayjs(lastOnline);
  const period = date.unix() - lastOnlineDay.unix();
  let message = "";

  if (period < 120) {
    message = "Online";
  } else {
    message = `last seen ${lastOnlineDay.fromNow()}`;
  }

  return (
    <div className="d-flex flex-row w-100 pt-3 themed-border-bottom" style={{ paddingBottom: 18 }}>
      <TalentProfilePicture src={profilePictureUrl} link={link} height={48} className="ml-3 mr-2" />
      <div className="d-flex flex-column">
        <P2 bold className="text-black">
          {username}
        </P2>
        <P2 className={message == "Online" ? "text-primary" : ""}>{message}</P2>
      </div>
    </div>
  );
};

const MessageExchange = props => {
  const { mode } = props;
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.search);

  useEffect(() => {
    var messagesDiv = document.getElementById("messages");
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, [props.messages]);

  const isPreviousMessageFromSameSender = index => {
    if (index == 0) {
      return false;
    }

    const firstDate = dayjs(props.messages[index - 1].created_at);
    const secondDate = dayjs(props.messages[index].created_at);

    // Unix returns a value in seconds, so if messages are spaced with > 5 minutes
    // then we want to make sure the timestamp and profile picture show again
    if (secondDate.unix() - firstDate.unix() > 600) {
      return false;
    }

    return props.messages[index - 1].sender_id === props.messages[index].sender_id;
  };

  const onEnterPress = e => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      props.onSubmit(e);
    }
  };

  const mine = message => message && message.sender_id === props.user?.id;

  const link = message => {
    const { user, username } = props;

    if (mine(message)) {
      return `u/${user?.username}`;
    } else {
      return `u/${username}`;
    }
  };

  return (
    <div className="d-flex flex-column display-messages" style={{ height: "100%", paddingBottom: "16px" }}>
      {props.smallScreen && (
        <>
          <div className="d-flex flex-row align-items-center w-100 py-2">
            <ThemedButton
              onClick={() => props.clearActiveUserUsername()}
              type="white-ghost"
              size="icon"
              mode={mode}
              className="mx-2 p-2"
            >
              <ArrowLeft color="currentColor" />
            </ThemedButton>
            <TalentProfilePicture
              src={props.profilePictureUrl}
              link={link()}
              height={48}
              className="mr-2"
              userId={searchParams.get("user")}
            />
            <P2 mode={mode} bold text={props.username} />
          </div>
          <div className={`divider ${mode}`}></div>
        </>
      )}
      {props.activeUserUsername && (
        <ChatHeader
          username={props.username}
          profilePictureUrl={props.profilePictureUrl}
          lastOnline={props.lastOnline}
          link={link()}
          userId={searchParams.get("user")}
        />
      )}
      <div id="messages" className="px-3 overflow-y-scroll d-flex flex-column pb-3" style={{ height: "100%" }}>
        {props.messages.length === 0 && props.activeUserUsername && <CommunicateFirst />}
        {props.messages.length === 0 && !props.activeUserUsername && <EmptyMessages />}
        {props.messages.map((message, index) => (
          <Message
            key={`message_${message.id}`}
            message={message}
            previousMessageSameUser={isPreviousMessageFromSameSender(index)}
            mine={mine(message)}
            profileLink={link(message)}
            profilePictureUrl={props.profilePictureUrl}
            username={props.username}
            user={props.user}
            // eslint-disable-next-line no-undef
            userId={mine(message) ? props.user?.id : message.sender_id}
          />
        ))}
      </div>
      {props.activeUserUsername && (
        <div className="d-flex flex-row w-100 p-2" style={{ padding: "0 16px" }}>
          <TextArea
            mode={mode}
            disabled={
              props.username == undefined ||
              (props.messages.length == 0 && props.user?.id == 0) ||
              props.messagingDisabled
            }
            onChange={e => props.onChange(e.target.value)}
            value={props.value}
            placeholder={
              props.messagingDisabled
                ? `Messaging disabled. Either you or ${props.username} have messaging disabled.`
                : "Type here"
            }
            className="w-100 mr-2"
            onKeyDown={onEnterPress}
            limitHeight={100}
          />
          <button
            className="button-link send-message-button"
            aria-label="Send"
            onClick={props.onSubmit}
            disabled={
              props.value == "" ||
              props.sendingMessage == true ||
              (props.messages.length == 0 && props.user?.id == 0) ||
              props.messagingDisabled
            }
          >
            <Send color="currentColor" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageExchange;
