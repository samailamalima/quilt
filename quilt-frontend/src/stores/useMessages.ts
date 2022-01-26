import create from "zustand";
import { SHA256 } from "crypto-js";

interface MessageType {
  name: string;
  message: string;
  createdAt: number;
}

interface useMessagesStore {
  messages: Map<string, Array<MessageType>>;
  storedMessages: Set<string>;
  friendList: Set<string>;
  recieverAddress: string;
  setRecieverAddress: (newAddress: string) => void;
  addMessage: (message: MessageType) => void;
  addFriend: (address: string) => void;
  removeFriend: (address: string) => void;
  addSelf: (message: MessageType, recieverAddress: string) => void;
}

export const useMessages = create<useMessagesStore>((set, get) => ({
  messages: new Map(),
  storedMessages: new Set(),
  friendList: new Set(),
  recieverAddress: "",
  setRecieverAddress: (newAddress: string) =>
    set((state) => ({
      recieverAddress: newAddress,
    })),
  addMessage: (message: MessageType) =>
    set((state) => {
      const username = message.name;
      const hashedMessage = SHA256(
        username + message.createdAt.toString()
      ).toString();

      // if message is already stored do not change state
      if (state.storedMessages.has(hashedMessage)) {
        return {
          messages: state.messages,
          storedMessages: state.storedMessages,
        };
      }

      // prepare variables for changing nested state
      let messagesAppended = state.messages;
      let newUserMessages: Array<MessageType> = [];

      // if user already has some saved messages append it
      if (messagesAppended.has(username)) {
        newUserMessages = [
          message,
          ...(messagesAppended.get(username) as MessageType[]),
        ];
      } else {
        newUserMessages = [message];
      }

      const newStoredMessages = state.storedMessages.add(hashedMessage);
      newUserMessages = newUserMessages.slice(0, 10);
      messagesAppended.set(username, newUserMessages);

      return { messages: messagesAppended, storedMessages: newStoredMessages };
    }),
  addSelf: (message: MessageType, recieverAddress: string) =>
    set((state) => {
      // here we do not have to check for message duplicates, because they are not fetched from network
      // TODO: fetch messages from the network instead of using "optimistic messaging"

      // prepare variables for changing nested state
      let messagesAppended = state.messages;
      let newUserMessages: Array<MessageType> = [];

      // if user already has some saved messages append it
      if (messagesAppended.has(recieverAddress)) {
        newUserMessages = [
          message,
          ...(messagesAppended.get(recieverAddress) as MessageType[]),
        ];
      } else {
        newUserMessages = [message];
      }

      newUserMessages = newUserMessages.slice(0, 10);
      messagesAppended.set(recieverAddress, newUserMessages);

      return { messages: messagesAppended };
    }),
  addFriend: (address: string) =>
    set((state) => {
      const newFriendlist = state.friendList.add(address);
      return {
        friendList: newFriendlist,
      };
    }),
  removeFriend: (address: string) =>
    set((state) => {
      const newFriendlist = state.friendList;
      newFriendlist.delete(address);
      return {
        friendList: newFriendlist,
      };
    }),
}));