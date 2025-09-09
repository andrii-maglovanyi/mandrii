"use client";

import { nanoid } from "nanoid";
import React, { createContext, ReactNode, useCallback, useMemo, useReducer } from "react";

import { ColorVariant } from "~/types";

export interface Notification extends NotificationPayload {
  id: string;
}

interface NotificationPayload {
  header?: string;
  message: string;
  variant: ColorVariant;
}

interface NotificationsContextType extends NotificationsState {
  newNotification: (payload: NotificationPayload) => void;
  removeNotification: (id: string) => void;
  reset: () => void;
}

interface NotificationsState {
  notifications: Notification[];
}

const initialState: NotificationsState = {
  notifications: [],
};

type Actions =
  | { payload: NotificationPayload; type: "NEW_NOTIFICATION" }
  | { payload: string; type: "REMOVE_NOTIFICATION" }
  | { type: "RESET" };

const notificationsReducer = (state: NotificationsState, action: Actions): NotificationsState => {
  switch (action.type) {
    case "NEW_NOTIFICATION": {
      const newNotification: Notification = {
        header: action.payload.header ?? "",
        id: `${action.payload.variant}-${nanoid()}`,
        message: action.payload.message,
        variant: action.payload.variant,
      };

      const exists = state.notifications.some(
        (notification) =>
          notification.message === newNotification.message &&
          notification.variant === newNotification.variant &&
          notification.header === newNotification.header,
      );

      return exists ? state : { notifications: [...state.notifications, newNotification] };
    }

    case "REMOVE_NOTIFICATION":
      return {
        notifications: state.notifications.filter(({ id }) => id !== action.payload),
      };

    case "RESET":
      return initialState;

    default:
      return state;
  }
};

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(notificationsReducer, initialState);

  const newNotification = useCallback(
    (payload: NotificationPayload) => dispatch({ payload, type: "NEW_NOTIFICATION" }),
    [],
  );

  const removeNotification = useCallback((id: string) => dispatch({ payload: id, type: "REMOVE_NOTIFICATION" }), []);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const value = useMemo(
    () => ({
      ...state,
      newNotification,
      removeNotification,
      reset,
    }),
    [state, newNotification, removeNotification, reset],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};
