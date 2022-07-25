import Input from "../Home/Input";
import AddedLayer from "../Home/AddedLayer";
import React, { useState } from "react";
import BackgroundLayout from "../Home/BackgroundLayout";
import { GENERAL_STYLES, LAYOUT, COLORS } from "../../constants";

const Transforms = (props) => {
  const { queryText, options, transforms, setTransforms } = props;

  const addTransform = (e, transforms, setTransforms) => {
    const copyTransform = [...transforms];
    const selectedTransform = deepCopyObj(e);
    Object.values(selectedTransform.parameters).forEach((val) => {
      val["value"] = "";
    });
    copyTransform.push(selectedTransform);
    setTransforms(copyTransform);    
  };

  return (
    <div>
      <BackgroundLayout>
        <Input
          queryText={queryText}
          options={options}
          onChange={(e) => {
            addTransform(e, transforms, setTransforms);
          }}
          style={{ float: "left" }}
        />

        {transforms.map((_, i) => (
          <div key={i} style={{ display: "inline-block" }}>
            <AddedLayer
              thisLayerIndex={i}
              addedLayers={transforms}
              setAddedLayers={setTransforms}
              key={i}
              onDelete={() => {
                const currentLayers = [...transforms];
                currentLayers.splice(i, 1);
                setTransforms(currentLayers);
              }}
              // style={styles}
            />
          </div>
        ))}
      </BackgroundLayout>
    </div>
  );
};

export default Transforms;

const deepCopyObj = (obj) => JSON.parse(JSON.stringify(obj));

const styles = {
  delete_btn: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  text: { ...GENERAL_STYLES.p, color: "white", fontSize: 20 },
  input_box: {
    margin: 7.5,
    backgroundColor: "white",
    width: 130,
    paddingInline: 5,
  },
  input_prompt: {
    fontFamily: "Arial, Helvetica, sans-serif",
    fontSize: 15,
    fontWeight: "bold",
  },
  input_text: {
    borderWidth: 0.5,
    borderColor: COLORS.layer,
    borderRadius: 10,
    fontSize: 15,
    maxWidth: "45%",
    padding: 5,
  },
};
