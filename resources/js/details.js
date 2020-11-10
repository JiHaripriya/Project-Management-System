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
}


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

