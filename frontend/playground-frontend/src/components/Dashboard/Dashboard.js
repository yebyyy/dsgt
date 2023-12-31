import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Dropdown,
  PageHeader,
  Spinner,
} from "gestalt";
import "gestalt/dist/gestalt.css";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useNavigate } from "react-router-dom";
import { sendToBackend } from "../helper_functions/TalkWithBackend";
import "./../../App.css";
import { auth } from "../../firebase";
import JSZip from "jszip";
import saveAs from "file-saver";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LinearScale,
  BarElement,
  Title,
  TimeSeriesScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { enUS } from "date-fns/locale";
import { format, isFuture, add } from "date-fns";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LinearScale,
  BarElement,
  Title,
  TimeSeriesScale
);

const BlankGrid = () => {
  const navigate = useNavigate();

  return (
    <div id="blank-grid-wrapper">
      <div id="blank-grid">
        <p>
          You haven't trained any models yet. Create your first model below!
        </p>
        <button id="blank-grid-button" onClick={() => navigate("/")}>
          Train Model
        </button>
      </div>
    </div>
  );
};

const StatusDisplay = ({ statusType, status }) => {
  const navigate = useNavigate();
  if (statusType === "QUEUED") {
    return (
      <button
        className="grid-status-display grid-status-display-gray"
        onClick={() => navigate("/")}
      >
        Queued: {status}
      </button>
    );
  } else if (statusType === "STARTING") {
    return (
      <button
        className="grid-status-display grid-status-display-yellow"
        onClick={() => navigate("/")}
      >
        Training...
      </button>
    );
  } else if (statusType === "UPLOADING") {
    return (
      <button
        className="grid-status-display grid-status-display-blue"
        onClick={() => navigate("/")}
      >
        Uploading...
      </button>
    );
  } else if (statusType === "TRAINING") {
    return (
      <button
        className="grid-status-display grid-status-display-blue"
        onClick={() => navigate("/")}
      >
        Training...
      </button>
    );
  } else if (statusType === "ERROR") {
    return (
      <button
        className="grid-status-display grid-status-display-red"
        onClick={() => navigate("/")}
      >
        Error
      </button>
    );
  } else if (statusType === "SUCCESS") {
    return (
      <button
        className="grid-status-display grid-status-display-green"
        onClick={() => navigate("/")}
      >
        Done <ArrowForwardIcon fontSize="small" />
      </button>
    );
  } else {
    return <p>Incorrect status type passed</p>;
  }
};

const sameDay = (d1, d2) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const formatDate = (date) => {
  const currDate = new Date();

  const time = sameDay(date, currDate)
    ? date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }) + ", "
    : "";

  return (
    time +
    date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() === currDate.getFullYear() ? undefined : "numeric",
    })
  );
};

const Overlay = () => {
  return (
    <Box
      color="default"
      height="100%"
      opacity={0.8}
      position="absolute"
      top
      left
      width="100%"
    />
  );
};

const FilledGrid = (props) => {
  const { executionTable } = props;
  const navigate = useNavigate();
  function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  }
  async function handleOnDownloadClick(e, row) {
    e.event.stopPropagation();
    const response = await sendToBackend("getExecutionsFilesPresignedUrls", {
      exec_id: row.execution_id,
    });
    const zip = new JSZip();
    await Promise.all(
      [
        [response.dl_results, "dl_results.csv"],
        [response.model_onnx, "my_deep_learning_model.onnx"],
        [response.model_pt, "model.pt"],
      ].map(([url, filename]) =>
        fetch(url, {
          mode: "cors",
        }).then((res) =>
          res.blob().then((blob) => {
            zip.file(filename, blob);
          })
        )
      )
    );
    zip
      .generateAsync({ type: "blob" })
      .then((blob) => saveAs(blob, "results.zip"));
  }
  return (
    <>
      {executionTable ? (
        <TableContainer style={{ display: "flex", justifyContent: "center" }}>
          <Table sx={{ minWidth: 400, m: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell className="dashboard-header">Name</TableCell>
                <TableCell className="dashboard-header">Type</TableCell>
                <TableCell className="dashboard-header" align="left">
                  Date
                </TableCell>
                <TableCell className="dashboard-header" align="left">
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {executionTable.map((row) => (
                <TableRow
                  key={row.execution_id}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    cursor: "pointer",
                  }}
                  onClick={() => navigate("/")}
                  hover
                >
                  <TableCell
                    component="th"
                    scope="row"
                    className="dashboard-header"
                  >
                    {row.name}
                  </TableCell>
                  <TableCell component="th" scope="row" className="row-style">
                    {toTitleCase(row.data_source)}
                  </TableCell>
                  <TableCell align="left" className="row-style">
                    {formatDate(new Date(row.timestamp))}
                  </TableCell>
                  <TableCell align="left">
                    <StatusDisplay
                      statusType={row.status}
                      status={`${row.progress.toFixed(2)}%`}
                    />
                  </TableCell>
                  <TableCell align="left">
                    <IconButton
                      icon="download"
                      accessibilityLabel={"Download"}
                      size={"md"}
                      disabled={row.status !== "SUCCESS"}
                      onClick={(e) => handleOnDownloadClick(e, row)}
                    ></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
    </>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [executionTable, setUserExecutionTable] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelTypeDoughnutData, setModelTypeDoughnutData] = useState(null);
  const [execFrequencyBarData, setExecFrequencyBarData] = useState(null);
  useEffect(() => {
    if (auth.currentUser) navigate("/dashboard");
    getExecutionTable();
  }, [auth.currentUser]);
  const getExecutionTable = async () => {
    if (auth.currentUser) {
      setIsLoading(true);
      const response = await sendToBackend("getExecutionsData", {});
      let table = JSON.parse(response["record"]);
      table.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setUserExecutionTable(table);
      setModelTypeDoughnutData({
        datasets: [
          {
            data: [
              table.filter((row) => row.data_source === "TABULAR").length,
              table.filter((row) => row.data_source === "IMAGE").length,
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
      const sameDay = (d1, d2) => {
        return (
          d1.getFullYear() === d2.getFullYear() &&
          d1.getMonth() === d2.getMonth() &&
          d1.getDate() === d2.getDate()
        );
      };
      const setToNearestDay = (d) => {
        d.setHours(0, 0, 0, 0);
        return d;
      };
      let execFrequencyData = [];
      table.forEach((row) => {
        if (isFuture(add(new Date(row.timestamp), { days: 30 }))) {
          execFrequencyData.length !== 0 &&
          sameDay(new Date(row.timestamp), execFrequencyData.at(-1).x)
            ? (execFrequencyData.at(-1).y += 1)
            : execFrequencyData.push({
                x: setToNearestDay(new Date(row.timestamp)),
                y: 1,
              });
        }
      });
      setExecFrequencyBarData({
        datasets: [
          {
            label: "# of Executions",
            backgroundColor: "rgba(75, 192, 192, 0.7)",
            borderColor: "rgb(75, 192, 192)",
            borderWidth: 1,
            barThickness: 15,
            data: execFrequencyData,
          },
        ],
      });
      setIsLoading(false);
    } else {
      setUserExecutionTable(null);
    }
  };
  return (
    <div id="dashboard">
      <>
        <PageHeader
          maxWidth="85%"
          title="Dashboard"
          primaryAction={{
            component: (
              <Button
                color="red"
                size="md"
                iconEnd="refresh"
                text="Refresh"
                onClick={() => {
                  getExecutionTable();
                }}
              />
            ),
            dropdownItems: [
              <Dropdown.Item
                key="refresh"
                option={{ value: "refresh", label: "Refresh" }}
                onSelect={() => {
                  getExecutionTable();
                }}
              />,
            ],
          }}
          dropdownAccessibilityLabel="More options"
        />
        <Flex
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          width="100%"
          wrap
        >
          {modelTypeDoughnutData ? (
            <Box>
              <Doughnut data={modelTypeDoughnutData} />
            </Box>
          ) : null}
          {execFrequencyBarData ? (
            <Box height={300} width={300}>
              <Bar
                data={execFrequencyBarData}
                options={{
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      adapters: {
                        date: {
                          locale: enUS,
                        },
                      },
                      ticks: {
                        maxRotation: 80,
                        minRotation: 80,
                      },
                      type: "timeseries",
                      time: {
                        unit: "day",
                        minUnit: "day",
                        displayFormats: {
                          day: "MMM dd",
                        },
                      },
                    },
                    y: {
                      beginAtZero: true,
                    },
                  },
                  responsive: true,
                  plugins: {
                    tooltip: {
                      callbacks: {
                        title: (context) => {
                          return format(
                            execFrequencyBarData.datasets[0].data[
                              context[0].dataIndex
                            ].x,
                            "MMM d"
                          );
                        },
                      },
                    },
                    legend: {
                      display: false,
                    },
                    title: {
                      display: true,
                      text: "Training Frequency",
                    },
                  },
                }}
              />
            </Box>
          ) : null}
        </Flex>
        <FilledGrid executionTable={executionTable} />
        {executionTable && executionTable.length === 0 && <BlankGrid />}
        {isLoading ? (
          <div id="loading">
            <Overlay />
            <Box height="100%" position="fixed" top left width="100%">
              <Flex
                alignItems="center"
                height="100%"
                justifyContent="center"
                width="100%"
              >
                <Spinner show accessibilityLabel="Spinner" />
              </Flex>
            </Box>
          </div>
        ) : null}
      </>
    </div>
  );
};

export default Dashboard;

StatusDisplay.propTypes = {
  statusType: PropTypes.string,
  status: PropTypes.string,
};

FilledGrid.propTypes = {
  executionTable: PropTypes.array,
};
