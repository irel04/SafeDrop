import ScreenLayout from "@/components/ScreenLayout";
import Button from "@/components/ui/Button";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { TMailbox, TParcelStatusEnum } from "@/types/dto";
import { COLORS } from "@/utils/constant";
import { supabase } from "@/utils/supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getDateTime } from "@/utils/helper";

type TMessageStructure = {
  heading: string;
  body: string;
};

type TMessageContent = {
  [key in TParcelStatusEnum]: TMessageStructure;
};

const MESSAGE_CONTENT: TMessageContent = {
  claimed: {
    heading: "Parcel Claimed Successfully",
    body: "Please make sure to securely close the mailbox after retrieval.",
  },
  delivered: {
    heading: "Delivery Made",
    body: "Hey! A parcel was just dropped by. Kindly checked it immediately",
  },
  empty: {
    heading: "No parcel right now",
    body: "Please ensure the mailbox is closed properly.",
  },
};

export default function HomeScreen() {
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const [id, setId] = useState<string | null>(null);

  const [updatedAt, setUpdatedAt] = useState<{
    time: string;
    date: string;
  } | null>(null);

  const [parcelStatus, setParcelStatus] = useState<TMessageStructure | null>(
    null,
  );

  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Load for the first time
  useEffect(() => {
    const getMailbox = async () => {
      try {
        const {
          data: mailbox,
          error,
        }: PostgrestSingleResponse<Omit<TMailbox, "time" | "rfid">> =
          await supabase.from("mailbox").select("*").single();

        if (error) throw error;

        const { dateISO, timeISO } = getDateTime(mailbox.updated_at);

        setUpdatedAt({
          date: dateISO,
          time: timeISO,
        });

        setIsLocked(mailbox.is_locked);
        setId(mailbox.id);

        setParcelStatus(MESSAGE_CONTENT[mailbox.parcel_status]);
      } catch (error) {
        console.error(error);
      } finally {
        setRefreshing(false);
      }
    };
    getMailbox();
  }, [refreshing]);

  // Listen to changes
  useEffect(() => {
    const mailboxChannel1 = supabase.channel("mailbox_channel_1");

    mailboxChannel1
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mailbox" },
        (payload) => {
          const newItem = payload.new as TMailbox;

          const { dateISO, timeISO } = getDateTime(newItem.updated_at);

          setUpdatedAt({
            date: dateISO,
            time: timeISO,
          });

          setIsLocked(newItem.is_locked);
          setParcelStatus(null);

          setTimeout(() => {
            setParcelStatus(MESSAGE_CONTENT[newItem.parcel_status]);
          }, 1200);
        },
      )
      .subscribe();

    return () => {
      mailboxChannel1.unsubscribe();
    };
  }, []);

  const handlePressButton = async (isLocked: boolean) => {
    try {
      const { error } = await supabase
        .from("mailbox")
        .update({ is_locked: isLocked })
        .eq("id", id);

      if (error) throw error;

      Alert.alert(
        "Success",
        isLocked
          ? "You’ve locked the mailbox."
          : "You’ve unlocked the mailbox.",
      );
    } catch (error) {
      Alert.alert("Failed", "Please check your network");
      console.error(error);
    }
  };

  return (
    <ScreenLayout>
      <ScrollView
        contentContainerStyle={styles.homeContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => setRefreshing(false)}
          />
        }
      >
        {/* Package Container */}
        <View style={styles.packageContainer}>
          <Image source={require("@/assets/images/bubble.png")} />
          <Image source={require("@/assets/images/dropbox.png")} />

          {/* Text Content for absolute positioning */}
          {parcelStatus === null ? (
            <TextSkeleton />
          ) : (
            <View style={styles.textContent}>
              <Text style={styles.statuText}>{parcelStatus.heading}</Text>
              <Text style={styles.messageText}>{parcelStatus.body}</Text>
              <View style={styles.dateTimeContainer}>
                <Text style={styles.dateTimeContent}>{updatedAt?.date}</Text>
                <Text style={styles.dateTimeContent}>{updatedAt?.time}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.buttonsContainer}>
          <Button
            variant="primary"
            disabled={isLocked}
            onPress={() => handlePressButton(true)}
          >
            <View style={styles.labelOrientation}>
              <Text style={{ color: "#FFFFFF" }}>Lock</Text>
              <IconSymbol name="lock" size={16} color={"#FFFFFF"} />
            </View>
          </Button>
          <Button
            variant="primary"
            disabled={!isLocked}
            onPress={() => handlePressButton(false)}
          >
            <View style={styles.labelOrientation}>
              <Text style={{ color: "#FFFFFF" }}>Unlock</Text>
              <IconSymbol name="lock.open" size={16} color={"#FFFFFF"} />
            </View>
          </Button>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const TextSkeleton = () => {
  return (
    <View style={[styles.textContent, { gap: 6, width: 250 }]}>
      <View
        style={{ height: 15, width: 75, backgroundColor: COLORS.BRAND[100] }}
      />
      <View style={{ height: 90, backgroundColor: COLORS.BRAND[100] }} />
      <View
        style={{
          alignSelf: "flex-end",
          height: 15,
          width: 75,
          backgroundColor: COLORS.BRAND[100],
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  homeContainer: {
    flex: 1,
    padding: 32,
  },
  packageContainer: {
    position: "relative",
    display: "flex",
    alignItems: "flex-end",
  },
  textContent: {
    display: "flex",
    height: 140,
    gap: 10,
    position: "absolute",
    top: 10,
    left: 40,
    maxWidth: 230,
    padding: 5,
  },
  statuText: {
    color: COLORS.BRAND[700],
    fontSize: 12,
    fontWeight: "medium",
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  dateTimeContainer: {
    display: "flex",
    alignSelf: "flex-end",
    flexDirection: "row",
    gap: 10,
  },
  dateTimeContent: {
    color: COLORS.BRAND[700],
    fontSize: 10,
  },

  buttonsContainer: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    bottom: 0,
    gap: 20,
    marginTop: "auto",
    paddingVertical: 16,
  },
  labelOrientation: {
    fontSize: 16,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
