import ScreenLayout from "@/components/ScreenLayout";
import Button from "@/components/ui/Button";
import { THistory } from "@/types/dto";
import { COLORS } from "@/utils/constant";
import { supabase } from "@/utils/supabase";
import { PostgrestResponse } from "@supabase/supabase-js";
import { addDays, format } from "date-fns";
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
          {created_at}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function History() {
  const [newest, setNewest] = useState<THistory[] | null>(null);

  useEffect(() => {
    const getEarlier = async () => {
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

    getEarlier();
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
        <View style={styles.earlierContainer}>
          <Text style={styles.headerSubtitle}>Earlier</Text>
          {Array.from({ length: 8 }).map((__, index) => (
            <NotificationCard
              key={index}
              status={index <= 2 ? "read" : "unread"}
            />
          ))}
        </View>
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
