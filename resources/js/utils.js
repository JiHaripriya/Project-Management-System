/*---------------------------------------------------------------
 >> UTILS.JS
 - This js file is a common collection of all utility functions
   used in this project.
 - All business logics in one place to be reused throughout 
   project.

 >> CONTENTS
    1. Pop up display function.
    2. Field validation function.
    3. Common variables for API calls
    4. Function to create svg progress circles.
    5. Graph drawing
    6. Common array of all approved list of technologies.
----------------------------------------------------------------*/

/*----------- Show popup on call -------------------------------*/
let popup = function (typeOfPopup) {

  // Find out which popup was called.
  if (typeOfPopup == 'AddProject') {
    var popupCard = document.querySelector('.add-project-popup')
  }
  else if (typeOfPopup == 'EditProject') {
    var popupCard = document.querySelector('.edit-project-popup')
  }
  else if (typeOfPopup == "AddResources") {
    var popupCard = document.querySelector('.add-resources-popup')
  }
  else if (typeOfPopup == "EditResources") {
    var popupCard = document.querySelector('.edit-resources-popup')
  }
  else if (typeOfPopup == "DeleteResources") {
    var popupCard = document.querySelector('.delete-resources-popup')
  }

  const leftSection = document.querySelector('.side-panel')
  const rightSection = document.querySelector('.main-panel')

  leftSection.classList.toggle('blur')   // Blur out main content.
  rightSection.classList.toggle('blur')

  popupCard.classList.toggle('active')
}

let isValid = true;  // Variable to check is all validations are satisfied: Returns 'false' in gets error at least once.

/*----------- field list validation ------------------------------*/
let validateFields = function (fields, valid, callback) {
  isValid = valid;
  fields.forEach((field) => { validate(field) });

  if (fields[0].className == 'add-project-validate') {
    let start = new Date(document.querySelector('#project-startDate').value)
    let end = new Date(document.querySelector('#project-endDate').value)
    let errorField = document.querySelector('#project-add-date-error')
    dateComparison(start, end, errorField)
  }
  else if (fields[0].className == 'edit-project-validate') {
    let start = new Date(document.querySelector('#project-startDate-edit').value)
    let end = new Date(document.querySelector('#project-endDate-edit').value)
    let errorField = document.querySelector('#project-edit-date-error')
    dateComparison(start, end, errorField)
  }
  callback(isValid);
}

/*----------- Individual field validation -------------------------*/
let validate = function (field) {
  if (field.tagName != 'TAGS') {
    if (field.required && field.value.length == 0) {
      setError(field, `${field.name} cannot be blank.`)
    }
    else {
      if (field.name == "Email") {
        validateEmail(field)
      }
      else if (field.name == 'Percentage') {
        validatePercentage(field)
      }
      else {
        clearError(field);
      }
    }
  }
}

// Email validation
function validateEmail(input) {
  if (!isEmail(input.value)) {
    setError(input, "Email is invalid!");
  } else {
    // Check to ensure email id uniqueness in a project
    const currentProjectId = Number(document.querySelector('.active-card').dataset.id);
    // const currentProjectResourceEmailList = utils.latestOfflineResourceList.filter(resource => resource.project_id = currentProjectId)
    //                                                                  .map(resource => resource.email);
    const currentProjectResourceEmailList = utils.latestOfflineResourceList.reduce((acc, curr) => {
      curr.project_id === currentProjectId ? acc.push(curr.email) : acc;
      return acc;
    }, []);
    currentProjectResourceEmailList.includes(input.value) ? setError(input, "Resource already allocated to this project!") : clearError(input);
  }
}

function isEmail(email) {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(email)
}

// Percentage limit validation
function validatePercentage(input) {
  if (parseInt(input.value) > 100 || parseInt(input.value) < 0) {
    setError(input, "Incorrect percentage value")
  }
  else {
    clearError(input)
  }
}

// Date comparison and validation
function dateComparison(start, end, errorField) {
  if (start > end) {
    errorField.style.color = '#ff0033'
    errorField.textContent = 'Your project is ending before it begins. Please check the dates'
    isValid = false
  }
  else {
    errorField.innerHTML = ''
  }
}


// Setting the error
function setError(input, msg) {
  const errorField = document.querySelector(`.${input.id}-error`)
  errorField.style.color = '#ff0033'
  errorField.textContent = msg
  isValid = false;

}

// Clearing errors
function clearError(input) {
  const fieldError = document.querySelector(`.${input.id}-error`);
  fieldError.style.color = '#2ecc71'
  fieldError.textContent = '';
}

/*----------- SVG Circle maker ------------------------------------*/
let svgCircleMaker = function (classForSvg, size, radius, percentage, strokeOffset, callback) {
  let progressBar = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  progressBar.classList.add(classForSvg);

  let circle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle1.setAttribute("cx", size);
  circle1.setAttribute("cy", size);
  circle1.setAttribute("r", radius);
  progressBar.appendChild(circle1);

  let circle2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle2.setAttribute("cx", size);
  circle2.setAttribute("cy", size);
  circle2.setAttribute("r", radius);

  let cal = strokeOffset - (strokeOffset * percentage) / 100;
  circle2.style.strokeDashoffset = cal;
  progressBar.appendChild(circle2);

  callback(progressBar)
}

/*----------- Graph drawing ---------------------------------------*/
let chartMaker = function (canvas, type, featureArray) {

  let graph = new Chart(canvas, {
    type: type,
    data: {
      labels: featureArray[0],
      datasets: [{
        label: featureArray[1],
        data: featureArray[2],
        backgroundColor: featureArray[3],
        borderColor: featureArray[4]
      }]
    },
    options: {
      tooltips: {
        backgroundColor: '#dbf7ec',
        titleFontColor: '#49d8a0',
        bodyFontColor: '#49d8a0'
      },
      scales: {
        // Remove names from x-axis to save space
        xAxes: [{
          ticks: {
            display: false
          }
        }],
        // Start from zero in y-axis
        yAxes: [{
          ticks: {
            beginAtZero: true,
            precision: 0
          }
        }]
      },
    }
  })
}

/*----------- Common variables and values -------------------------*/
// APIs
let resourceAPI = 'https://api.jsonbin.io/b/5facf156ea9b612e1c66b204';
let projectAPI = 'https://api.jsonbin.io/b/5facf133ea9b612e1c66b1fe';
let statusReportAPI = 'https://api.jsonbin.io/b/5facf171ea9b612e1c66b20b';
let secretKey = '$2b$10$pZaqde/aahZpS2VTTnCdGerVLGrHEPsHMpnAFzvi4U.wYV2Hwp3am';
let latestOfflineResourceList, latestOfflineStatusReports, formattedTotalHoursSpent = '00:00';

// List of technologies for popup input field.
let arrayOfTechnologies = ["HTML", "CSS", "JavaScript", "Flutter", "Swift", "Java", "C++", "C#", "Python"]

let utils = { popup, validateFields, validate, svgCircleMaker, resourceAPI, projectAPI, statusReportAPI, secretKey, arrayOfTechnologies, latestOfflineResourceList, latestOfflineStatusReports, formattedTotalHoursSpent, chartMaker };
export default utils;