/*
Here are all the functions you may want to change.
Read the coursework spec carefully and the in-line comments in the functions to understand what is needed here
*/
let chromeBugWorkaround = true;

const getRandVal = function () {
  return ((Math.random() * 2) - 1);
};

const getMolePosition = function () {
  //function to generate a new location for the mole
  //function returns an object with fields x and y i.e. {x:<val>, y:<val>}
  //function should only return values between -1 and 1 for both fields
  //remember that the center is at 0,0, consider this to prevent overlap

  console.warn(
    "|========> getMolePosition(): Controls the position the mole appears at"
  );
  console.warn("|==============> x is between -1 and 1 and y is between -0.73 and 0.73");

  while(1){
    randomX = getRandVal();
    randomY = 0.73*getRandVal();
    if(Math.abs(randomX) > 0.2 || Math.abs(randomY) > 0.2){
      break;
    }
  }

  //Currently the function returns random values
  return { x: randomX, y: randomY };
};



const getMoleSize = function () {
  //function to generate a scale / size of the mole
  //function should return a single value between 1 and 2
  //you can use a discrete number of values for scale (e.g. three values 1.25, 1.5, 2)

  console.warn(
    "|========> getMoleSize(): Controls the size of the mole"
  );
  console.warn("|==============> returned value needs to be between 1 and 2");

  //Currently the function randomly returns one of three values: 1.25, 1.5 and 2.0
  if(gameState.trialCnt < 3){
    return 2;
  }
  else if(gameState.trialCnt < 6){
    return 1.75;
  }
  else if(gameState.trialCnt < 9){
    return 1.5;
  }
  else{
    return 1.25;
  }
};

const getTimeout = function () {
  //function that generates the time available for the user to click on the mole
  //function returns a value in milliseconds

  //Currently the function returns random values
  
  if(gameState.trialCnt == 0 || gameState.trialCnt == 3 || gameState.trialCnt == 6){
    return Math.floor((Math.random() * 500) + 2000);
  }
  else if(gameState.trialCnt == 1 || gameState.trialCnt == 4 || gameState.trialCnt == 7){
    return Math.floor((Math.random() * 500) + 1500);
  }
  else if(gameState.trialCnt == 2 || gameState.trialCnt == 5 || gameState.trialCnt == 8){
    return Math.floor((Math.random() * 500) + 1000);
  }
  else{
    return Math.floor((Math.random() * 1000) + 1250);;
  }
};

const getCSVDataLine = function (obj, pid) {
  //function that converts each log entry into a single comma separated string
  //you are expected to convert all timestamps into computed values,
  //e.g. difference between rndDelayEnd and  userClickMole is the time taken to complete the trial
  //currently these are only saved as raw timestamps.

  console.warn("|:========> Controls the data logged to the CSV file ");
  console.warn(
    "|==============> returns a single string which is comma-separated values"
  );

  //Currently the function returns raw timestamps only as a csv string
  return [
    pid,
    obj.tid,
    obj.startTS,
    obj.rndDelayStart - obj.rndDelayEnd,
    obj.rndDelay,
    0,
    obj.moleStats,
    obj.userMoveStart - obj.rndDelayEnd,
    obj.userEnterMole - obj.rndDelayEnd,
    obj.userClickMole - obj.rndDelayEnd,
    obj.hitSuccess,
  ].join(",");
};
