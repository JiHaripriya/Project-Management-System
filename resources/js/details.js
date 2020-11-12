/*---------------------------------------------------------------
 >> DETAILS.JS
 - This js file includes all features for the details tab.

 >> CONTENTS
    1. API call to receive projects data from server.
    2. Dynamic creation of details of selected project.
    3. Edit projects form.
    4. Display edit project popup with setting default value.
    5. Upload the edited project details to server.
    6. Validation on blur for 'Edit project' form.
----------------------------------------------------------------*/
import apis from "./api.js";
import utils from './utils.js';

var projects; // Variable to store projects data obtained via API call

/*----- API call to receive projects data from server ----*/
apis.getAPI("get", utils.projectAPI, utils.secretKey, true, (obj) => {
  projects = obj;
  if (projects && projects.length > 0) {
    // Clear the 'No data available' message
    document.querySelector('.no-data-div-details').style.display = 'none'
  }
  activeProject();
  var cards = document.getElementsByClassName("project-card");
  for (let card of cards) {
    card.addEventListener("click", () => {
      activeProject();
    })
  }
});

var activeObj;

/*---- Dynamic creation of details of selected project ---*/
function activeProject() {
  let activeProjectCard = document.querySelector(".active-card").dataset.id;
  projects.forEach((project) => {
    if (project.id == activeProjectCard) {
      document.querySelector(
        ".tab-container"
      ).innerHTML = `<div class="left-side-details">
      <p class="heading">Project Name:</p>
      <p class="content">${project.project_name}</p>
    
      <p class="heading">Description</p>
      <p class="content">${project.project_desc}</p>
    
      <p class="heading">Technologies Used:</p>
      <p class="content">${project.tech_used}</p>

      <p class="heading">Total Hours Spent:</p>
      <p class="content" id="total-hours-spent">${utils.formattedTotalHoursSpent} hour(s)</p>
    </div>
    
    <div class="right-side-details flex-box">

      <div class="date-box flex-box">
        <div class="start-date-box">
          <p class="heading">Start Date:</p>
          <p class="content">${project.start_date}</p>
        </div>
        <div class="end-date-box">
          <p class="heading">End Date:</p>
          <p class="content">${project.end_date}</p>
        </div>        
      </div>
      <svg class="detail-circle">
        <circle cx="65px" cy="65px" r="65px"></circle>
        <circle cx="65px" cy="65px" r="65px"></circle>
      </svg>
      <p class="percentage-completed">${project.percentage_complete}%</p>
    </div>
    </div>
    </div >`;
      const circleStokeOffset = 410
      document.querySelector(
        ".detail-circle :nth-child(2)"
      ).style.strokeDashoffset =
        circleStokeOffset - (circleStokeOffset * `${project.percentage_complete}`) / 100;

      activeObj = project;
    }
  });
  // hoursSpentByEachResource(activeProjectCard);
}

// function hoursSpentByEachResource(card) {
//   const statusReportEntries = utils.latestOfflineStatusReports[Number(card.dataset.id)-1];
//   if(statusReportEntries) {
//       let totalHoursSpent = 0;
//       const hoursBreakDown = statusReportEntries.reduce((acc, curr) => {
//         const [hours, minutes] = curr.hoursSpent.split(':');
//         const timeSpent = Number(hours) + Number(minutes)/60;
//         acc[curr.emailId] ? acc[curr.emailId] += timeSpent : acc[curr.emailId] = timeSpent;
//         totalHoursSpent += timeSpent;
//         return acc;
//       }, {});
//       const emailIdNameMapping = statusReportEntries.reduce((acc, curr) => {
//           if(!acc[curr.emailId]) {
//               acc[curr.emailId] = curr.resourceName;
//           }
//           return acc;
//       }, {});
//       console.log(emailIdNameMapping)
//       if(totalHoursSpent) {
//           const tempTotalHoursSpent = totalHoursSpent.toString().split('.');
//           if (!tempTotalHoursSpent[1]) tempTotalHoursSpent[1] = 0;
//           utils.formattedTotalHoursSpent = singleToDouble(tempTotalHoursSpent[0])+':'+singleToDouble(tempTotalHoursSpent[1]*.60);
//           // document.querySelector('#total-hours-spent').innerHTML = `${utils.formattedTotalHoursSpent} hour(s)`;
//           const hoursBreakDownTableBody = document.querySelector('#resources-activity-table__body');
//           hoursBreakDownTableBody.innerHTML = '';
//           for(const x in hoursBreakDown) {
//               const tempHoursBreakDown = hoursBreakDown[x].toString().split('.');
//               if(!tempHoursBreakDown[1]) tempHoursBreakDown[1] = 0;
//               const formattedHoursBreakDown = singleToDouble(tempHoursBreakDown[0])+':'+singleToDouble(tempHoursBreakDown[1]*.60);
//               hoursBreakDownTableBody.innerHTML += `<tr>
//               <td>${emailIdNameMapping[x]}</td>
//               <td>${x}</td>
//               <td>${formattedHoursBreakDown}</td>
//             </tr>`;
//           }
//       } else {
//           utils.formattedTotalHoursSpent = '00:00';
//       }
//   } else {
//       utils.formattedTotalHoursSpent = '00:00';
//   }
// }

/*---------------- Edit projects form ------------------------*/
const cancelEditProjectsBtn = document.querySelector(".cancel-edit-btn");
const editButton = document.querySelector(".edit-details-btn");
const allEditProjectFields = document.querySelectorAll(".edit-project-validate");

/*--- Tag view in technologies input field: Edit projects ---*/
var input = document.querySelector('#project-technologies-edit'),
  tagify = new Tagify(input, {
    whitelist: utils.arrayOfTechnologies,
    maxTags: 10,
    dropdown: {
      maxItems: 20,           // <- mixumum allowed rendered suggestions
      classname: "tags-look", // <- custom classname for this dropdown, so it could be targeted
      enabled: 0,             // <- show suggestions on focus
      closeOnSelect: false    // <- do not hide the suggestions dropdown once an item has been selected
    }
  })

editButton.addEventListener("click", () => {
  utils.popup("EditProject");
  editProject();
});

cancelEditProjectsBtn.addEventListener("click", () => {
  utils.popup("EditProject");

});

/*-- Display edit project popup with setting default value --*/
function editProject() {
  document.getElementById("project-name-edit").value = activeObj.project_name;;
  document.getElementById("project-description-edit").value = activeObj.project_desc;
  let existingTechs = activeObj.tech_used.reduce((acc, curr) => [...acc, { value: curr }], [])
  console.log(activeObj.tech_used)
  // document.getElementById("project-technologies-edit").value = JSON.stringify(existingTechs);
  tagify.addTags(activeObj.tech_used)
  document.getElementById("project-percentage-edit").value = activeObj.percentage_complete;
  document.getElementById("project-startDate-edit").value = activeObj.start_date;
  document.getElementById("project-endDate-edit").value = activeObj.end_date;
}

const edit = document.querySelector(".edit-project-popup-btn");
var isEditProjectValid = true;
edit.addEventListener("click", () => {
  const allEditProjectFields = document.querySelectorAll(".edit-project-validate");
  console.log(allEditProjectFields);
  utils.validateFields(allEditProjectFields, isEditProjectValid, (valid) => {
    if (valid === true) {
      console.log("validated");
      getEdited();
      utils.popup("EditProject");
    }
  });
});

/*------- Upload the edited project details to server ------*/
function getEdited() {
  let projectId = activeObj.id;
  let projName = document.getElementById("project-name-edit").value;
  let projDesc = document.getElementById("project-description-edit").value;
  let techsArray = document.getElementById("project-technologies-edit").value;
  let techs = JSON.parse(techsArray).map(tech => tech.value);

  let percent = document.getElementById("project-percentage-edit").value;
  let start = document.getElementById("project-startDate-edit").value;
  let end = document.getElementById("project-endDate-edit").value;
  projects[projectId - 1].id = projectId;
  projects[projectId - 1].project_name = projName;
  projects[projectId - 1].project_desc = projDesc;
  projects[projectId - 1].tech_used = techs;
  projects[projectId - 1].percentage_complete = percent;
  projects[projectId - 1].start_date = start;
  projects[projectId - 1].end_date = end;

  apis.putAPI("PUT", utils.projectAPI, utils.secretKey, JSON.stringify(projects), (res) => { location.reload() });
  removeProject();
  activeProject();
}

function removeProject() {
  document.querySelector(".tab-container").innerHTML == "";

}

// Validate on blur (Edit projects)
allEditProjectFields.forEach((field) => {
  field.addEventListener("blur", (e) => {
    utils.validate(e.target);
  });
});

