import React from "react";
import logo2 from "../../assets/imgs/brookelogo.png";
import { useLocation } from "react-router-dom";

function NavLink(props) {
  const location = useLocation();
  let link;
  if (props.url === location.pathname) {
    link = (
      <h4
        className="underline"
        onClick={() => {
          window.location.href = props.url;
        }}
      >
        {props.txt}
      </h4>
    );
  } else {
    link = (
      <h4
        onClick={() => {
          window.location.href = props.url;
        }}
      >
        {props.txt}
      </h4>
    );
  }
  return link;
}

export default function ModalHeader(props) {
  return (
    <div className="modalheader">
      <div className="container">
        <div className="itemsLogo">
          <div
            onClick={() => {
              window.location.href = "/";
            }}
            className="logo"
          >
            <img src={logo2} alt="Brooke East Africa Logo" />
            <h2>Brooke East Africa GIS Portal</h2>
          </div>
          <i
            onClick={() => {
              props.toggleMenu();
            }}
            className="fa fa-close"
          >
            &#xf00d;
          </i>
        </div>

        <h3>Menus</h3>
        <div className="nav">
          <NavLink className="navlink" txt="Home" url="/" />
          <NavLink txt="Data" url="/data" />
          <NavLink txt="About" url="/about" />
          <br></br>
          <br></br>
          <br></br>
          {props.isAuthenticated ? (
            <button
              onClick={() => {
                props.logout();
                props.toggleMenu();
              }}
            >
              Logout
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  props.setToggleLogin(true);
                  props.setToggleRegister(false);
                  props.toggleMenu();
                }}
              >
                Admin
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
