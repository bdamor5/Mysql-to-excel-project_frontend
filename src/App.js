import React, { useState } from "react";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

const App = () => {
  const [date1, setDate1] = useState(null);
  const [date2, setDate2] = useState(null);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadLink,setDownloadLink] = useState(null);

  // console.log(date1,date2);

  const handleGenerate = async () => {
    try {
      setSuccess(false);
      if (date1 && date2) {
        setLoading(true);
        const D1 = new Date(
          Date.UTC(
            date1.getFullYear(),
            date1.getMonth(),
            date1.getDate(),
            date1.getHours(),
            date1.getMinutes(),
            date1.getSeconds()
          )
        );
        const D2 = new Date(
          Date.UTC(
            date2.getFullYear(),
            date2.getMonth(),
            date2.getDate(),
            date2.getHours(),
            date2.getMinutes(),
            date2.getSeconds()
          )
        );

        let d1 = D1.toJSON();
        let d2 = D2.toJSON();

        // console.log(d1.substring(0, 4)); //year
        // console.log(d1.substring(5, 7)); //month
        // console.log(d1.substring(8, 10)); //day

        const res1 = await axios.post("https://mysql-to-excel-backend.herokuapp.com/setDate", {
          fromDate: `${d1.substring(0, 4)}-${d1.substring(5, 7)}-${d1.substring(
            8,
            10
          )}`,
          toDate: `${d2.substring(0, 4)}-${d2.substring(5, 7)}-${d2.substring(
            8,
            10
          )}`,
        });

        // console.log(res1)

        if (res1.status === 200) {
          const res2 = await axios.get("https://mysql-to-excel-backend.herokuapp.com/saveToExcel");

          // console.log(res2);

          if (res2.status === 200) {
            // console.log(res2.data.data);

            let dataSend = {
              dataReq: {
                data: res2.data.data,
                name: `Service_report_${d1.substring(0, 4)}-${d1.substring(
                  5,
                  7
                )}-${d1.substring(8, 10)}_to_${d2.substring(
                  0,
                  4
                )}-${d2.substring(5, 7)}-${d2.substring(8, 10)}.xlsx`,
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              },
              fname: "MySQLtoExcelProject",
            };

            fetch(
              "https://script.google.com/macros/s/AKfycbzV4Riq53iyh5GMJjQ4fA6yA2TZRpYxzLOAcpDCF2WchU0bTT96jWrNz3w3u5gHVeAGZQ/exec",
              {
                method: "POST",
                body: JSON.stringify(dataSend),
              }
            )
              .then((res) => res.json())
              .then((data) => {
                // console.log(data);
                setLoading(false);
                setSuccess(true);
                setDownloadLink(data.url)
              })
              .catch((err) => {
                console.error(err);
              });
          }
        }
      } else {
        setError(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container row mx-auto">
      <div className="col-12 mx-auto d-flex flex-column align-items-center mt-5 text-center">
        <h1>Select Date</h1>
        <h4 className="d-flex align-items-center my-1">
          <br />
          From: &nbsp;&nbsp;&nbsp;&nbsp;
          <DatePicker
            dateFormat="yyyy-MM-dd"
            onChange={setDate1}
            onCalendarOpen={() => {
              setError(false);
              setSuccess(false);
            }}
            selected={date1}
            placeholderText="yyyy-mm-dd"
          />{" "}
          To:
          <DatePicker
            dateFormat="yyyy-MM-dd"
            onChange={setDate2}
            onCalendarOpen={() => {
              setError(false);
              setSuccess(false);
            }}
            selected={date2}
            placeholderText="yyyy-mm-dd"
          />
        </h4>
        {loading ? (
          <button class="btn btn-primary col-2 mt-2" type="button" disabled>
            <span
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            &nbsp; Saving... <br/>(may take few mins)
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary col-2 mt-2"
            onClick={handleGenerate}
          >
            Save data
          </button>
        )}
        {error && (
          <h4 className="mt-3 text-danger">*Please Enter Valid Dates</h4>
        )}
        {success && (
          <>
          <h4 className="mt-3 text-success">
            Data saved successfully!
          </h4>
          <button
            type="button"
            className="btn btn-success col-2 mt-2"
          >
            <a href={downloadLink} target="_blank" rel="noreferrer">View</a>
          </button>
          </>
          
        )}
      </div>
    </div>
  );
};

export default App;
