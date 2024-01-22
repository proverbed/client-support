import { Datum, ResponsiveLine } from "@nivo/line";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { db } from "../config/Firebase";
import { useState, useEffect } from "react";
import { getDocs, collection, onSnapshot } from "firebase/firestore";
import { query } from "firebase/firestore";

type Props = {
  isDashboard?: boolean;
  accountId: string;
};

export interface DailyBalanceProps {
  dailyBalance: number;
  date: {
    seconds: number;
    nanoseconds: number;
  };
}

export interface DailyBalanceProps {
  dailyBalance: number;
  date: {
    seconds: number;
    nanoseconds: number;
  };
}

interface dataProps {
  id: string;
  data: Datum[];
}

const LineChart: React.FC<Props> = ({ accountId, isDashboard = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const DAILY_BALANCE: string = "dailyBalance";

  const emptyData = [
    {
      id: DAILY_BALANCE,
      color: tokens("dark").greenAccent[500],
      data: [],
    },
  ];

  const [d, setViolation] = useState<dataProps[]>(emptyData);

  const getNumberOfViolations = async () => {
    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const q = query(collection(db, `accounts/${accountId}/${DAILY_BALANCE}`));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // @ts-expect-error avoid this eror
        const violationData: DailyBalanceProps[] = querySnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        );
        const myData = [
          {
            id: DAILY_BALANCE,
            color: tokens("dark").greenAccent[500],
            data: violationData.map((item) => ({
              x: new Date(item.date.seconds * 1000).toDateString(),
              y: item.dailyBalance,
            })),
          },
        ];
        setViolation(myData);
        return `accounts/${accountId}/${DAILY_BALANCE}`;
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let pathVar;
    // let unsubscribe;
    const pathResult = (async () => {
      pathVar = await getNumberOfViolations();
      return pathVar;
    })();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let observer: any;
    pathResult.then((value) => {
      if (value !== undefined) {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const q = query(
          collection(db, `accounts/${accountId}/${DAILY_BALANCE}`)
        );

        observer = onSnapshot(
          q,
          (querySnapshot) => {
            console.log(
              `Daily Balnace Received query snapshot ${JSON.stringify(
                querySnapshot.size,
                null,
                2
              )}`
            );

            // @ts-expect-error avoid this eror
            const violationData: DailyBalanceProps[] = querySnapshot.docs.map(
              (doc) => ({
                id: doc.id,
                ...doc.data(),
              })
            );
            const myData = [
              {
                id: DAILY_BALANCE,
                color: tokens("dark").greenAccent[500],
                data: violationData.map((item) => ({
                  x: new Date(item.date.seconds * 1000).toDateString(),
                  y: item.dailyBalance,
                })),
              },
            ];
            setViolation(myData);
          },
          (err) => {
            console.log(`Encountered error: ${err}`);
          }
        );
      }
    });

    return () => {
      if (observer !== undefined) {
        observer();
      }
    };
  }, [accountId]);

  return (
    <ResponsiveLine
      data={d}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            color: colors.primary[500],
          },
        },
      }}
      colors={isDashboard ? { datum: "color" } : { scheme: "nivo" }} // added
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: true,
        reverse: false,
      }}
      yFormat=" >-.2f"
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 0,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "transportation", // added
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        tickValues: 5, // added
        tickSize: 3,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "count", // added
        legendOffset: -40,
        legendPosition: "middle",
      }}
      enableGridX={false}
      enableGridY={false}
      pointSize={8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

export default LineChart;
