import ScreenLayout from "@/components/ScreenLayout";
import Button from "@/components/ui/Button";
import { THistory } from "@/types/dto";
import { COLORS } from "@/utils/constant";
import { supabase } from "@/utils/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";
import { format, formatDistanceToNow, startOfToday } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ContainerCard = Pick<THistory, "created_at"> & {
  status?: "unread" | "read";
  handlePressNotif: () => void;
};

const NotificationCard = ({
  status = "unread",
  created_at,
  handlePressNotif,
}: ContainerCard) => {
  return (
    <TouchableOpacity
      style={[styles.notificationCardContainer, styles[status]]}
      onPress={handlePressNotif}
    >
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/images/dropbox.png")}
          style={{ width: 28, height: "100%" }}
        />
      </View>
      <View>
        <Text style={{ fontSize: 16, color: COLORS.NEUTRAL[900] }}>
          Delivery was made
        </Text>
        <Text style={{ fontSize: 14, color: COLORS.NEUTRAL[500] }}>
          Check your parcel and claim it immediately
        </Text>
        <Text style={{ fontSize: 12, color: COLORS.NEUTRAL[500] }}>
          {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function History() {
  const [newest, setNewest] = useState<THistory[] | null>(null);

  const [earlier, setEarlier] = useState<THistory[] | null>(null);

  const [range, setRange] = useState<number>(9); // 0 index based so this will be n + 1

  const [earlierTotalLength, setEarlierTotalLength] = useState<number>(0);

  const [refreshing, setRefreshing] = useState<boolean>(false);

  const timeZone = "Asia/Manila";
  const todayPH = startOfToday(); // 2025-06-07T00:00:00 in PH time
  const todayUTC = fromZonedTime(todayPH, timeZone); // Convert to UTC

  useEffect(() => {
    const getNewest = async () => {
      try {
        const { data, error }: PostgrestResponse<THistory> = await supabase
          .from("history")
          .select("*")
          .gte("created_at", todayUTC.toISOString())
          .order("created_at", { ascending: false });

        if (error) throw error;

        setNewest(data);
      } catch (error) {
        console.error(error);
      } finally {
        setRefreshing(false);
      }
    };

    getNewest();
  }, [refreshing, todayUTC]);

  useEffect(() => {
    const getEarlier = async () => {
      try {
        const { data, error, count }: PostgrestResponse<THistory> =
          await supabase
            .from("history")
            .select("*", { count: "exact" })
            .lt("created_at", todayUTC.toISOString())
            .order("created_at", { ascending: false })
            .range(0, range);

        if (error) throw error;

        setEarlier(data);

        setEarlierTotalLength(count || data.length);
      } catch (error) {
        console.error(error);
      } finally {
        setRefreshing(false);
      }
    };

    getEarlier();
  }, [range, refreshing, todayUTC]);

  // Realtime subscription
  useEffect(() => {
    const realtimeHistoryChannel = supabase.channel("realtime-history").on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "history",
      },
      (payload) => {
        const newAdded = payload.new as THistory;
        setNewest((notif) => {
          if (notif) {
            return [newAdded, ...notif];
          }

          return [newAdded];
        });
      },
    );

    realtimeHistoryChannel.subscribe();

    return () => {
      realtimeHistoryChannel.unsubscribe();
    };
  }, []);

  const handlePressNotif = async (id: string, deliveredAt: string) => {
    try {
      const { error } = await supabase
        .from("history")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;

      // Invalidate/update local state
      setNewest(
        (prev) =>
          prev?.map((notif) =>
            notif.id === id ? { ...notif, is_read: true } : notif,
          ) || null,
      );

      setEarlier(
        (prev) =>
          prev?.map((notif) =>
            notif.id === id ? { ...notif, is_read: true } : notif,
          ) || null,
      );

      const formattedDate = format(
        new Date(deliveredAt),
        "MMMM d, yyyy 'at' h:mm a",
      );

      Alert.alert(
        "Parcel Delivery",
        `A parcel was delivered on ${formattedDate}.\n\nPlease check your designated dropbox and claim your parcel as soon as possible to avoid delays or storage issues.`,
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handlePressSeeMore = async () => {
    if (range > earlierTotalLength) {
      setRange(9);
      return;
    }

    setRange((prev) => prev + 3);
  };

  return (
    <ScreenLayout>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            progressBackgroundColor={COLORS.BRAND[100]}
            tintColor={COLORS.BRAND[100]}
            onRefresh={() => setRefreshing(true)}
          />
        }
      >
        <Text style={styles.headerTitle}>History</Text>
        {/* Newest Notification Container */}
        {newest && newest.length !== 0 && (
          <View style={styles.newestContainer}>
            <Text style={styles.headerSubtitle}>Newest</Text>
            {newest.map((newHistory, index) => (
              <NotificationCard
                key={index}
                created_at={newHistory.created_at}
                status={newHistory.is_read ? "read" : "unread"}
                handlePressNotif={() =>
                  handlePressNotif(newHistory.id, newHistory.created_at)
                }
              />
            ))}
          </View>
        )}
        {earlier && earlier.length !== 0 && (
          <View style={styles.earlierContainer}>
            <Text style={styles.headerSubtitle}>Earlier</Text>
            {earlier.map((earlierHistory, index) => (
              <NotificationCard
                key={index}
                status={earlierHistory.is_read ? "read" : "unread"}
                created_at={earlierHistory.created_at}
                handlePressNotif={() =>
                  handlePressNotif(earlierHistory.id, earlierHistory.created_at)
                }
              />
            ))}
          </View>
        )}
        {earlierTotalLength > 10 && (
          <Button
            onPress={handlePressSeeMore}
            variant="primary"
            style={{ backgroundColor: COLORS.NEUTRAL[200] }}
          >
            <Text style={{ color: "#FFFFFF", textAlign: "center" }}>
              {range + 1 > earlierTotalLength ? "See Less" : "See More"}
            </Text>
          </Button>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 30,
    color: COLORS.BRAND[400],
    fontWeight: "bold",
    padding: 20,
  },
  newestContainer: {
    marginBottom: 10,
  },
  headerSubtitle: {
    color: COLORS.BRAND[900],
    fontWeight: "medium",
    fontSize: 18,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  notificationCardContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  notificationDetailsContainer: {
    display: "flex",
    gap: 0,
  },
  imageContainer: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.BRAND[200],
    padding: 10,
    borderRadius: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  unread: {
    backgroundColor: COLORS.BRAND[200] + "4D",
  },
  read: {
    backgroundColor: "transparent",
  },
  earlierContainer: {
    flex: 1,
  },
});
