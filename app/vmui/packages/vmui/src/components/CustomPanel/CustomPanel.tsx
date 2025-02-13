import React, {FC, useState, useEffect} from "preact/compat";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import GraphView from "./Views/GraphView";
import TableView from "./Views/TableView";
import {useAppDispatch, useAppState} from "../../state/common/StateContext";
import QueryConfigurator from "./Configurator/Query/QueryConfigurator";
import {useFetchQuery} from "../../hooks/useFetchQuery";
import JsonView from "./Views/JsonView";
import {DisplayTypeSwitch} from "./Configurator/DisplayTypeSwitch";
import GraphSettings from "./Configurator/Graph/GraphSettings";
import {useGraphDispatch, useGraphState} from "../../state/graph/GraphStateContext";
import {AxisRange} from "../../state/graph/reducer";
import Spinner from "../common/Spinner";
import {useFetchQueryOptions} from "../../hooks/useFetchQueryOptions";
import TracingsView from "./Views/TracingsView";
import Trace from "./Trace/Trace";

const CustomPanel: FC = () => {

  const [tracingsData, setTracingData] = useState<Trace[]>([]);
  const {displayType, time: {period}, query, queryControls: {isTracingEnabled}} = useAppState();
  const { customStep, yaxis } = useGraphState();

  const dispatch = useAppDispatch();
  const graphDispatch = useGraphDispatch();

  const setYaxisLimits = (limits: AxisRange) => {
    graphDispatch({type: "SET_YAXIS_LIMITS", payload: limits});
  };

  const toggleEnableLimits = () => {
    graphDispatch({type: "TOGGLE_ENABLE_YAXIS_LIMITS"});
  };

  const setPeriod = ({from, to}: {from: Date, to: Date}) => {
    dispatch({type: "SET_PERIOD", payload: {from, to}});
  };

  const {queryOptions} = useFetchQueryOptions();
  const {isLoading, liveData, graphData, error, tracingData} = useFetchQuery({
    visible: true,
    customStep
  });

  const handleTraceDelete = (tracingData: Trace) => {
    const updatedTracings = tracingsData.filter((data) => data.idValue !== tracingData.idValue);
    setTracingData([...updatedTracings]);
  };

  useEffect(() => {
    if (tracingData) {
      setTracingData([...tracingsData, tracingData]);
    }
  }, [tracingData]);

  useEffect(() => {
    setTracingData([]);
  }, [displayType]);

  return (
    <Box p={4} display="grid" gridTemplateRows="auto 1fr" style={{minHeight: "calc(100vh - 64px)"}}>
      <QueryConfigurator error={error} queryOptions={queryOptions}/>
      <Box height="100%">
        {isLoading && <Spinner isLoading={isLoading} height={"500px"}/>}
        {<Box height={"100%"} bgcolor={"#fff"}>
          <Box display="grid" gridTemplateColumns="1fr auto" alignItems="center" mx={-4} px={4} mb={2}
            borderBottom={1} borderColor="divider">
            <DisplayTypeSwitch/>
            <Box display={"flex"}>
              {displayType === "chart" && <GraphSettings
                yaxis={yaxis}
                setYaxisLimits={setYaxisLimits}
                toggleEnableLimits={toggleEnableLimits}
              />}
            </Box>
          </Box>
          {error && <Alert color="error" severity="error" sx={{whiteSpace: "pre-wrap", mt: 2}}>{error}</Alert>}
          {graphData && period && (displayType === "chart") && <>
            {isTracingEnabled && <TracingsView
              tracingsData={tracingsData}
              onDeleteClick={handleTraceDelete}
            />}
            <GraphView data={graphData} period={period} customStep={customStep} query={query} yaxis={yaxis}
              setYaxisLimits={setYaxisLimits} setPeriod={setPeriod}/>
          </>}
          {liveData && (displayType === "code") && <JsonView data={liveData}/>}
          {liveData && (displayType === "table") && <>
            {isTracingEnabled && <TracingsView
              tracingsData={tracingsData}
              onDeleteClick={handleTraceDelete}
            />}
            <TableView data={liveData}/>
          </>}
        </Box>}
      </Box>
    </Box>
  );
};

export default CustomPanel;
