/*
Exports the logged experimental data.
If the data structure is updated to contain different info, 
the csvHeader should be edited to reflect the new headings
getCSVDataLine function is available in update.js
*/

const exportExperimentLog = function () {
  let csvHeader =
    "PiD,TrailId,startTS, rndDelayStart,rndDelay,rndDelayEnd,moleXn,moleYn,moleScale,hitTime,userMoveStart,userEnterMole,userClickMole,hitSuccess\n";
  let csvData = gameState.log.map((entry) => getCSVDataLine(entry, gameState.pid)); //map passes every record in the log array to the getCSVDataLine, we also need to include pid to all rows
  exportData(csvHeader + csvData.join("\n"), "experimentData.csv");
};

const exportData = function (csvDataString, exportFileName) {
  // Create a Blob with the CSV data
  const blob = new Blob([csvDataString], { type: "text/csv" });

  // Create a temporary link element
  const a = document.createElement("a");
  a.href = window.URL.createObjectURL(blob);
  a.download = exportFileName;

  // Trigger the download
  document.body.appendChild(a);
  a.style.display = "none";
  a.click();

  // Clean up
  window.URL.revokeObjectURL(a.href);
  document.body.removeChild(a);
};
