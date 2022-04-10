const puppeteer = require("puppeteer");
let { email, password } = require('./secret');
let { answer } = require("./codes");
let cTab;
let browserOPenPromise = puppeteer.launch({
  headless: false,
  defaultViewport: null,
  args: ["--start-maximized"],
  //executablePath: "C:\Program Files\Google\Chrome\Application\chrome.exe",
});
browserOPenPromise
    .then(function (browser) {
     console.log("browser is open");
    console.log(browserOPenPromise);
      // console.log(browser);
     let allTabsPromise=browser.pages();    //An array of all open pages inside the Browser.
     return allTabsPromise;     //returns an array with all the pages in all browser contexts

}) 
.then(function(allTabsArr){
  cTab=allTabsArr[0];
  console.log("New Tab");
  let visitingLoginPagePromise= cTab.goto("https://www.hackerrank.com/auth/login");     // goto take in the URL of the page to navigate to 
  return visitingLoginPagePromise;
})
.then(function(data){
console.log("HackerRank login page has been opened.");
let emailWillBeTypedPromise=cTab.type("input[name='username']",email,{delay:100});
return emailWillBeTypedPromise;
})
.then (function(){
  console.log("Email has been typed.");
  let passwordWillBeTypedPromise=cTab.type("input[type='password']",password,{delay:100});      //selector(where to type), data(what to type)
  return passwordWillBeTypedPromise;
})
.then (function(){
  console.log("Password has been typed.");
  let willBeLoggedInPromise=cTab.click(   ".ui-btn.ui-btn-large.ui-btn-primary.auth-button.ui-btn-styled");
  return willBeLoggedInPromise;
}
)
.then(function(){
  console.log("Logged in successfully");
   //waitAndClick will wait for the selector to load , and then click on the node
   let algorithmTabWillBeOPenedPromise = waitAndClick(
    "div[data-automation='algorithms']"
  );
  return algorithmTabWillBeOPenedPromise;
})
.then(function () {
  console.log("algorithm page has been opened");
  let allQuesPromise=cTab.waitForSelector('a[data-analytics="ChallengeListChallengeName"]');
  return allQuesPromise;
})
.then(function(){
  function getAllQuesLinks(){
    let allElemArr=document.querySelectorAll('a[data-analytics="ChallengeListChallengeName"]');  //document here the the foem in which browser stores the html css code which is kind of in the form of a tree
    let linksArr=[];
    for(let i=0;i<allElemArr.length;i++){
      linksArr.push(allElemArr[i].getAttribute("href"));
    }
    return linksArr;
  }
  let linksArrPromise=cTab.evaluate(getAllQuesLinks);   //evaluate????
  return linksArrPromise;

})
.then(function(linksArr){
  console.log("links to all questions received");
  console.log(linksArr);
  let questionWillBeSolvedPromise = questionSolver(linksArr[0], 0);
  for (let i = 1; i < linksArr.length; i++){
    questionWillBeSolvedPromise = questionWillBeSolvedPromise.then(function () {
      return questionSolver(linksArr[i], i);
    })
  }
return questionSolver(linksArr[i],i);
})
.then (function(){
  console.log("Question has been solved.");
})
.catch(function(err){
  console.log(err);
});
function waitAndClick(algoBtn) {
  let waitClickPromise = new Promise(function (resolve, reject) {
    let waitForSelectorPromise = cTab.waitForSelector(algoBtn);
    waitForSelectorPromise
      .then(function () {
        console.log("algo btn is found");
        let clickPromise = cTab.click(algoBtn);
        return clickPromise;
      })
      .then(function () {
        console.log("algo btn is clicked");
         resolve();
      })
      .catch(function (err) {
        reject(err);
      })
  });

  // waitClickPromise.then(function () {
  //   console.log("inside then of waitclick");
  // });
  return waitClickPromise;
}
function questionSolver(url,idx){
  return new Promise(function(resolve,reject){
    let fullLink=`http://www.hackerrank.com${url}`;
    let goToQuesPagePromise=cTab.goto(fullLink);
    goToQuesPagePromise
    .then(function(){
      console.log("Question has been opened.");
      //Tick the custom input box
      let waitForCheckBoxAndClickPromise=waitAndClick(".checkbox-input");
      return waitForCheckBoxAndClickPromise;
    })
    .then(function () {
      //selecting the box where code will be typed
      let waitForTextBoxPromise = cTab.waitForSelector(".custominput");
      return waitForTextBoxPromise;
    })
    .then(function () {
      let codeWillBeTypedPromise = cTab.type(".custominput", answer[idx]);
      return codeWillBeTypedPromise;
    })
     .then(function(){
      let controlPressedPromise=cTab.keyboard.down("Control");
      return controlPressedPromise;
    })
    .then(function(){
      let aKeyWillBePressedPromise=cTab.keyboard.press("a");
      return aKeyWillBePressedPromise;
    })
    .then(function(){
      let xKeyWillBePressedPromise=cTab.keyboard.press("x");
      return xKeyWillBePressedPromise;
    })
    .then(function(){
      let cursorOnEditorPromise=cTab.click(".monaco-editor.no-user-select.vs");
      return cursorOnEditorPromise;
    })
    .then(function(){
      let aKeyWillBePressedPromise=cTab.keyboard.press("a",{delay:100});
      return aKeyWillBePressedPromise;
    })
    .then(function(){
      let vKeyWillBePressedPromise=cTab.keyboard.press("v");
      return vKeyWillBePressedPromise;
    })
    .then(function(){
      let submitButtonClickedPromise=cTab.click(".hr-monaco-submit");
      return submitButtonClickedPromise;
    })
    .then(function(){
      let controlDownPromise=cTab.keyboard.up("Control");
      return controlDownPromise;
    })
    .then(function(){
      console.log("Code has been submitted successfully.");
      resolve();
    })
    .catch(function(err){
      reject(err);
    });
  });
}
