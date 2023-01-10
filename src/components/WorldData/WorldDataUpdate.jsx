import {
  MapContainer,
  ZoomControl,
  GeoJSON,
  MapConsumer,
  LayersControl,
} from "react-leaflet";
import { useEffect, useState } from "react";
import SidePanel from "../Maps/SidePanel";
import FileSaver from "file-saver";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import L from "leaflet";
import AttributeData from "../Maps/AttributeData";
import thematicData from "../../assets/data/thematicData";
import AlertMsg from "../Maps/AlertMsg";
import BottomPanel from "../Maps/BottomPanel";
import $ from "jquery";
import bbox from "@turf/bbox";
import BaseMaps from "../Maps/BaseMaps";
import "leaflet";
import "leaflet-simple-map-screenshoter";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function WorldDataUpdate(props) {
  let template = {
    data: {
      url: null,
      layer: null,
      basemap: 0,
    },
    style: {
      column: null,
      columnData: [],
      classification: null,
      classes: null,
    },
    attributes: {
      Title: "",
      Theme: props.theme,
      Description: "",
      Dataset: "",
      Keywords: "",
      Owner: "",
      Type: "",
      Thumbnail: "",
    },
  };
  const [body, setBody] = useState(template);
  const [msg, setMsg] = useState(null);
  const [data, setData] = useState(null);
  const [myMap, setMyMap] = useState(null);
  let simpleMapScreenshoter = null;
  const pathname = window.location.pathname.split("/")[4];
  const { Overlay } = LayersControl;

  useEffect(() => {
    fetch(`/api/gis/${pathname}`, {
      method: "get",
      credentials: "include",
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        let d = body;

        let cl = JSON.parse(data?.Style);
        d.style.classes = cl;
        d.data.url = data?.URL;
        d.style.classification = data?.Classification;
        d.style.column = data?.Column;
        d.attributes.Title = data?.Title;
        d.attributes.Theme = data?.Category;
        d.attributes.Description = data?.Description;
        d.attributes.Thumbnail = data?.Thumbnail;
        d.attributes.Dataset = data?.Dataset;
        d.attributes.Keywords = data?.Keywords;
        d.attributes.Owner = data?.Owner;
        d.attributes.Type = data?.Type;

        updateBody(d);
      })
      .catch((err) => {});;
  }, []);

  useEffect(() => {
    if (myMap) {
      let pluginOptions = {
        cropImageByInnerWH: true,
        hidden: false,
        preventDownload: false,
        domtoimageOptions: {},
        position: "topright",
        screenName: "screen",
        hideElementsWithSelectors: [".leaflet-control-container"],
        mimeType: "image/png",
        caption: null,
        captionFontSize: 15,
        captionFont: "Arial",
        captionColor: "black",
        captionBgColor: "white",
        captionOffset: 5,

        onPixelDataFail: async function ({
          node,
          plugin,
          error,
          mapPane,
          domtoimageOptions,
        }) {
          return plugin._getPixelDataOfNormalMap(domtoimageOptions);
        },
      };

      simpleMapScreenshoter =
        L.simpleMapScreenshoter(pluginOptions).addTo(myMap);
    }
  }, [myMap]);

  useEffect(() => {
    if (body.data.url) {
      setData(null);

      var response = $.ajax({
        url: encodeURI(getUrl(body.data.url, body.data.filters)),
        dataType: "json",
        success: {},
        error: function (xhr) {
          setData(null);
        },
      });
      $.when(response).done(function (data) {
        if (data.features.length !== 0) {
          const bbx = bbox(response.responseJSON);
          const c1 = [bbx[1], bbx[0]];
          const c2 = [bbx[3], bbx[2]];
          let d = body;
          d.data.bounds = [c1, c2];
          d.data.layer = response.responseJSON;
          updateBody(d);
          setData(data);
        }
      });
    }
  }, [body.data.filters, body.data.url]);

  function getUrl(url, filters) {
    if (!filters) {
      return `/geoserver/${
        url.split(":")[0]
      }/wfs?request=GetFeature&version=1.0.0&typeName=${url}&outputFormat=json`;
    } else {
      return `/geoserver/${
        url.split(":")[0]
      }/wfs?request=GetFeature&version=1.0.0&typeName=${url}&${filters}&outputFormat=json`;
    }
  }

  const style = (feature) => {
    return {
      fillColor: "#FF7A00",
      color: "#030092",
      fillOpacity: 0.5,
      weight: 0.5,
      radius: 5,
    };
  };

  const pointToLayer = (feature, latlng) => {
    return L.circleMarker(latlng, null);
  };

  const updateBody = (bd) => {
    if (body.data.basemap !== bd.data.basemap) {
      let d = bd;
      d.data.basemap = null;
      setBody({ ...body, d });
    }
    setBody({ ...body, bd });
  };

  const submitData = () => {
    let bdy = thematicData;
    bdy.Title = body.attributes.Title;
    bdy.Category = body.attributes.Theme;
    bdy.Description = body.attributes.Description;
    bdy.Thumbnail = body.attributes.Thumbnail;
    bdy.Dataset = body.attributes.Dataset;
    bdy.Keywords = body.attributes.Keywords;
    bdy.Owner = body.attributes.Owner;
    bdy.Type = body.attributes.Type;
    bdy.URL = body.data.url;
    bdy.Column = body.style.column;
    bdy.Classification = body.style.classification;
    bdy.Style = JSON.stringify(body.style.classes);

    if (checkInputs(bdy)) {
      fetch(`/api/gis/${pathname}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(bdy),
      })
        .then((res) => {
          if (res.ok) return res.json();
          else throw Error("");
        })
        .then((data) => {
          setMsg("Submitted successfully!");
        })
        .catch((e) => {
          setMsg("Creation failed!");
        });
    }
  };

  const checkInputs = (bdy) => {
    let vl = true;

    if (!bdy.Title || bdy.Title === "") {
      setMsg("Map title is required!");
      return (vl = false);
    }

    if (!bdy.Description || bdy.Description === "") {
      setMsg("Map description is required!");
      return (vl = false);
    }
    if (!bdy.Thumbnail || bdy.Thumbnail === "") {
      setMsg("Please upload a thumbnail!");
      return (vl = false);
    }
    if (!bdy.Dataset || bdy.Dataset === "") {
      setMsg("Please load some spatial data!");
      return (vl = false);
    }
    if (!bdy.Keywords || bdy.Keywords === "") {
      setMsg("At least 1 keyword is required!");
      return (vl = false);
    }
    if (!bdy.Owner || bdy.Owner === "") {
      setMsg("Data owner is required!");
      return (vl = false);
    }
    if (!bdy.Type || bdy.Type === "") {
      setMsg("Data Type is required!");
      return (vl = false);
    }
    if (!bdy.URL || bdy.URL === "") {
      setMsg("Please load some spatial data!");
      return (vl = false);
    }

    return vl;
  };

  const printMap = () => {
    let format = "blob";
    let overridedPluginOptions = {
      mimeType: "image/jpeg",
    };
    simpleMapScreenshoter
      ?.takeScreen(format, overridedPluginOptions)
      .then((blob) => {
        FileSaver.saveAs(blob, "map.png");
      })
      .catch((e) => {
        console.error(e);
      });
  };

  return (
    <div>
      <div className="map">
        <MapContainer
          style={{ width: "100%", height: "80vh" }}
          center={[-1.2921, 36.8219]}
          zoom={12}
          maxZoom={18}
          zoomControl={false}
        >
          <LayersControl>
            <BaseMaps />
            {data && (
              <Overlay checked={true} name={body.data.url.split(":")[1]}>
                <GeoJSON
                  data={data}
                  pointToLayer={pointToLayer}
                  style={style}
                />
              </Overlay>
            )}
          </LayersControl>

          <MapConsumer>
            {(map) => {
              if (body.data.bounds) {
                map.fitBounds(body.data.bounds);
              }
              if (!myMap) setMyMap(map);

              return null;
            }}
          </MapConsumer>
          <ZoomControl position="bottomright" />
        </MapContainer>

        <SidePanel
          worldData={true}
          update={true}
          body={body}
          updateBody={updateBody}
        />
        <BottomPanel printMap={printMap} body={body} updateBody={updateBody} />
      </div>
      <div className="attribute">
        <AttributeData
          body={body}
          submitData={submitData}
          updateBody={updateBody}
        />
      </div>
      {msg && <AlertMsg msg={msg} setMsg={setMsg} />}
    </div>
  );
}
