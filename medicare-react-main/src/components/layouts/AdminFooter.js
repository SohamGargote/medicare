import React from "react";

export default function AdminFooter() {
  return (
    <>
      <footer className="footer">
        <div className="container-fluid">
          MediCare  // <i>&nbsp;Pharmacy </i>
          <div className="copyright ml-auto">
            {" "}
            Copyright &copy;&nbsp;
            {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </>
  );
}
