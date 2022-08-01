import React from "react";
import { COLORS } from "../../constants";
import { Link, useLocation } from "react-router-dom";

const ChoiceTab = (props) => {

  const loc = useLocation().pathname;

  const getBackground = (id) => {    
    if (id === loc) return COLORS.gold ;
    return COLORS.dark_blue;
  }


  return (
    <div style={{ display: "flex", marginBottom: "0px", float: "right"}}>
      <button
        style={{ ...styles.button, backgroundColor: getBackground("/") }}
      >
        <Link to="/" style={styles.linkelEment}>
          Tabular Data
        </Link>
      </button>

      <button
        style={{ ...styles.button, backgroundColor: getBackground("/img-models") }}
      >
        <Link to="/img-models" style={styles.linkelEment}>
          Image Models
        </Link>
      </button>

      <button
        style={{ ...styles.button, backgroundColor: getBackground("/pretrained") }}
      >
        <Link to="/pretrained" style={styles.linkelEment}>
          Pretrained
        </Link>
      </button>


    </div>
  );
}

export default ChoiceTab;

const styles = {

  button: {
  marginRight: "5px",
  marginLeft: "5px",
  borderColor: COLORS.background ,
  // border: "3px",
  borderStyle: "solid",
  paddingLeft: "10px",
  paddingRight: "10px",
  borderRadius: "25px",
  fontSize: "17px",
  // backgroundColor: COLORS.dark_blue ,
  color: COLORS.background ,
  },
  linkelEment: {
    color: COLORS.background,
    textDecoration: "none"
  },
  
};