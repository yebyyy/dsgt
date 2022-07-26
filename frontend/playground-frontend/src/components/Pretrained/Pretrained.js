import React, { useState } from "react";
import {
  IMAGE_CLASSIFICATION_CRITERION,
  BOOL_OPTIONS,
  OPTIMIZER_NAMES,
  IMAGE_DEFAULT_DATASETS,
  PRETRAINED_MODELS,
  POSSIBLE_TRANSFORMS,
} from "../../settings";
import { COLORS, LAYOUT, GENERAL_STYLES } from "../../constants";

import Input from "../Home/Input";
import RectContainer from "../Home/RectContainer";
import TitleText from "../general/TitleText";
import BackgroundLayout from "../Home/BackgroundLayout";
import Transforms from "../ImageModels/Transforms";
import TrainButton from "../Home/TrainButton";

const Pretrained = () => {
  const [dlpBackendResponse, setDLPBackendResponse] = useState();
  const [modelName, setModelName] = useState();
  const [email, setEmail] = useState("");
  const [criterion, setCriterion] = useState(IMAGE_CLASSIFICATION_CRITERION[0]);
  const [optimizerName, setOptimizerName] = useState(OPTIMIZER_NAMES[0]);
  const [usingDefaultDataset, setUsingDefaultDataset] = useState();
  const [shuffle, setShuffle] = useState(BOOL_OPTIONS[1]);
  const [epochs, setEpochs] = useState(5);
  const [batchSize, setBatchSize] = useState(20);
  const [trainTransforms, setTrainTransforms] = useState([]);
  const [testTransforms, setTestTransforms] = useState([]);

  const input_responses = {
    modelName: modelName?.value,
    criterion: criterion?.value,
    optimizerName: optimizerName?.value,
    usingDefaultDataset: usingDefaultDataset?.value,
    shuffle: shuffle?.value,
    epochs: epochs,
    batchSize: batchSize,
    email: email,
  };

  const input_queries = [
    {
      queryText: "Model Name",
      options: PRETRAINED_MODELS,
      onChange: setModelName,
      defaultValue: modelName,
    },
    {
      queryText: "Optimizer Name",
      options: OPTIMIZER_NAMES,
      onChange: setOptimizerName,
      defaultValue: optimizerName,
    },
    {
      queryText: "Criterion",
      options: IMAGE_CLASSIFICATION_CRITERION,
      onChange: setCriterion,
      defaultValue: criterion,
    },
    {
      queryText: "Default",
      options: IMAGE_DEFAULT_DATASETS,
      onChange: setUsingDefaultDataset,
      defaultValue: usingDefaultDataset,
    },
    {
      queryText: "Epochs",
      freeInputCustomRestrictions: { type: "number", min: 0 },
      onChange: setEpochs,
      defaultValue: epochs,
    },
    {
      queryText: "Shuffle",
      options: BOOL_OPTIONS,
      onChange: setShuffle,
      defaultValue: shuffle,
    },
    {
      queryText: "Batch Size",
      onChange: setBatchSize,
      defaultValue: batchSize,
      freeInputCustomRestrictions: { type: "number", min: 2 },
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <TitleText text="Data & Parameters" />
      <div style={{ display: "flex" }}>
        <BackgroundLayout>
          <RectContainer style={styles.fileInput}></RectContainer>
          <TrainButton
            {...input_responses}
            setDLPBackendResponse={setDLPBackendResponse}
            style={{
              container: {
                width: 155,
              },
            }}
            choice = "pretrained"
          />
        </BackgroundLayout>
        <BackgroundLayout>
          {input_queries.map((e) => (
            <Input {...e} key={e.queryText} />
          ))}
        </BackgroundLayout>
      </div>

      <div style={{ marginTop: 20 }} />
      <TitleText text="Image Transformations" />
      <Transforms
        queryText={"Test Transform"}
        options={POSSIBLE_TRANSFORMS}
        transforms={trainTransforms}
        setTransforms={setTrainTransforms}
      />
      <div style={{ marginTop: 10 }} />
      <Transforms
        queryText={"Test Transform"}
        options={POSSIBLE_TRANSFORMS}
        transforms={testTransforms}
        setTransforms={setTestTransforms}
      />
    </div>
  );
};

export default Pretrained;

const styles = {
  fileInput: {
    ...LAYOUT.column,
    backgroundColor: COLORS.input,
    width: 155,
    height: 75
  },
};