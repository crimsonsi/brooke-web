import Header from "../components/Utils/Header2";
import { useEffect, useState } from "react";
import Maps from "../components/maps/NetworksMap";
import "../Styles/mapdata.scss";
import Navigation from "../components/Utils/Navigation2";

export default function AnimalHealthData(props) {
  const [active, setActive] = useState(null);
  const [data, setData] = useState(null);
  const [currentUser, setCurrentUser] = useState();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  var jwt = require("jsonwebtoken");

  useEffect(() => {
    const token = localStorage.getItem("cilbup_ksa");
    if (token) {
      try {
        var decoded = jwt.decode(token);
        setCurrentUser(decoded);

        if (Date.now() >= decoded.exp * 1000) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [isAuthenticated]);

  return (
    <div className="mapdata">
      <div className="MainingsContent">
        <div className="headings2">
          <Header
            active="MapData"
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
          />
        </div>
        <div className="home ">
          <Navigation active="Animal Health" />
          <Maps url="AnimalHealth" />
        </div>
      </div>
    </div>
  );
}
