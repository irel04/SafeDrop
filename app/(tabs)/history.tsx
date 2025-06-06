import ScreenLayout from "@/components/ScreenLayout";
import Button from "@/components/ui/Button";
import { THistory } from "@/types/dto";
import { COLORS } from "@/utils/constant";
import { supabase } from "@/utils/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";
import { addDays, format, formatDistanceToNow, subDays } from "date-fns";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type ContainerCard = Pick<THistory, "created_at"> & {
  status?: "unread" | "read";
};

const NotificationCard = ({ status = "unread", created_at }: ContainerCard) => {
  return (
    <TouchableOpacity
      style={[styles.notificationCardContainer, styles[status]]}
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

  useEffect(() => {
    const getNewest = async () => {
      const todayDate = new Date();
      const today = format(todayDate, "yyyy-MM-dd");
      const tomorrow = format(addDays(todayDate, 1), "yyyy-MM-dd");

      try {
        const { data, error }: PostgrestResponse<THistory> = await supabase
          .from("history")
          .select("*")
          .gte("created_at", today)
          .lte("created_at", tomorrow)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setNewest(data);
      } catch (error) {
        console.error(error);
      }
    };

    getNewest();
  }, []);

  useEffect(() => {
    const getEarlier = async () => {
      const currenDate = format(new Date(), "yyyy-MM-dd");

      try {
        const { data, error }: PostgrestResponse<THistory> = await supabase
          .from("history")
          .select("*")
          .lte("created_at", currenDate)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setEarlier(data);
      } catch (error) {
        console.error(error);
      }
    };

    getEarlier();
  }, []);

  // Realtime subscription

  useEffect(() => {
    const realtimeHistoryChannel = supabase.channel("realtime-history").on(
      "postgres_changes",
      {
        event: "*",
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

  return (
    <ScreenLayout>
      <ScrollView>
        <Text style={styles.headerTitle}>History</Text>
        {/* Newest Notification Container */}
        {newest && (
          <View style={styles.newestContainer}>
            <Text style={styles.headerSubtitle}>Newest</Text>
            {newest.map((newHistory, index) => (
              <NotificationCard
                key={index}
                created_at={newHistory.created_at}
              />
            ))}
          </View>
        )}
        {earlier && (
          <View style={styles.earlierContainer}>
            <Text style={styles.headerSubtitle}>Earlier</Text>
            {earlier.map((earlierHistory, index) => (
              <NotificationCard
                key={index}
                status={index <= 2 ? "read" : "unread"}
                created_at={earlierHistory.created_at}
              />
            ))}
          </View>
        )}
        <Button
          variant="primary"
          style={{ backgroundColor: COLORS.NEUTRAL[200] }}
        >
          <Text style={{ color: "#FFFFFF", textAlign: "center" }}>
            See More
          </Text>
        </Button>
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
