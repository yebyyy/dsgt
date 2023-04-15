import { ChartData } from "chart.js";
import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { TrainSpaceData } from "../types/trainTypes";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);
const TrainDoughnutChart = ({
  trainSpaceDataArr,
}: {
  trainSpaceDataArr?: TrainSpaceData[];
}) => {
  const [modelTypeDoughnutData, setModelTypeDoughnutData] =
    useState<ChartData<"doughnut"> | null>(null);
  useEffect(() => {
    if (trainSpaceDataArr) {
      setModelTypeDoughnutData({
        datasets: [
          {
            data: [
              trainSpaceDataArr.filter((row) => row.data_source === "TABULAR")
                .length,
              trainSpaceDataArr.filter((row) => row.data_source === "IMAGE")
                .length,
            ],
            backgroundColor: [
              "rgb(255, 99, 132)",
              "rgb(54, 162, 235)",
              "rgb(255, 205, 86)",
            ],
            label: "Frequency",
          },
        ],
        labels: ["Tabular", "Image"],
      });
    }
  }, [trainSpaceDataArr]);
  return (
    <>
      {modelTypeDoughnutData ? <Doughnut data={modelTypeDoughnutData} /> : null}
    </>
  );
};
export default TrainDoughnutChart;
