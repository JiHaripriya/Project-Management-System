/*---------------------------------------------------------------
 >> PROJECTS.JS
 - This js file contains logics common to projects menu.

 >> CONTENTS
    1. Create tab view im main content area.
    2. API call to receive projects data from server.
    3. Dynamic project list making (Cards).
    4. Hamburger menu setup.
    5. 'Add projects' form and its tag view.
    6. PUT projects to server (Adding new project).
    7. Validation on blur for 'Add project' form.
    8. Navigation Drawer
----------------------------------------------------------------*/
import apis from "./api.js";
import utils from "./utils.js";

var projects;  // Variable to store projects data obtained via API call

/*---------------- Tab view setup ------------------------*/
const buttons = document.querySelectorAll(".button-box button");
const tabs = document.querySelectorAll(".tab-content");
const editButton = document.querySelector(".edit-details-btn");

buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    setTabs(e.target.dataset.index);
  });
});

function setTabs(index) {
  buttons.forEach((button) => {
    button.className = "";
  });
  
  buttons[index].className = "active-tab";

  tabs.forEach((tab) => {
    tab.style.display = "none";
  });

  tabs[index].style.display = "block";
  if (tabs[index].dataset.editable == "true") {
    editButton.style.display = "block";
  } else {
    editButton.style.display = "none";
  }
}

// By default, project details tab is displayed
setTabs(0);

/*----- API call to receive projects data from server ----*/
apis.getAPI("get", utils.projectAPI, utils.secretKey, false, (obj) => {
  projects = obj
  displayProjects();
});

/*------------ Dynamic project list (Cards) --------------*/
function displayProjects() {
  if (projects) {
    document.querySelector('.no-data-div-project').style.display='none'
    let reversedProjects = [...projects].reverse();
    reversedProjects.forEach((project) => {
      let projectCard = document.createElement("div");
      projectCard.classList.add("project-card", "flex-box");
      projectCard.setAttribute('data-id', `${project.id}`)
      document.getElementById("projectList").appendChild(projectCard);
      let para = document.createElement("p");
      para.innerHTML = project.project_name;
      projectCard.appendChild(para);

      // Details for the percentage circle
      let size = 30, radius = 30, percentage = project.percentage_complete
      let circleStrokeOffset = 190
      
      utils.svgCircleMaker("card-circle",size,radius,percentage,circleStrokeOffset,(progressBar)=>{
        projectCard.appendChild(progressBar)
      })
    });
  }
  var cards = document.getElementsByClassName("project-card");
  cards[0].classList.add("active-card");
  for (var i = 0; i < cards.length; i++) {
    let card = cards[i];
    cards[i].addEventListener("click", function () {
      addClass(card);
    });
  }
}

function addClass(card) {
  document.querySelector(".active-card").classList.remove("active-card");
  card.classList.add("active-card");
}


/*---------------- Hamburger menu setup -------------------*/
const hamburger = document.querySelector(".mobile-hamburger");
const sidePanel = document.querySelector(".side-panel");
const burgerLines = document.querySelectorAll(".line");

hamburger.addEventListener("click", () => {
  sidePanel.classList.toggle("open");
  burgerLines.forEach((line) => {
    line.classList.toggle("line-dark");
  });
});

/*---------------- Add projects form ------------------------*/
const addProjectsBtn = document.querySelector(".add-project-btn");
const cancelAddProjectsBtn = document.querySelector(".cancel-add-btn");
const allAddProjectFields = document.querySelectorAll(".add-project-validate");

addProjectsBtn.addEventListener("click", () => {
  utils.popup("AddProject");
});
cancelAddProjectsBtn.addEventListener("click", () => {
  utils.popup("AddProject");
});

/*--- Tag view in technologies input field: Add projects ---*/
var input = document.querySelector('#project-technologies'),
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

/*------- Add projects to server----------------------------*/
const add = document.querySelector(".add-project-popup-btn");
var isAddProjectValid = true;
add.addEventListener("click", () => {
  console.log(allAddProjectFields);
  utils.validateFields(allAddProjectFields, isAddProjectValid, (valid) => {
    if (valid === true) {
      console.log("validated");
      addProject();
      utils.popup("AddProject");
    }
  });
});

function addProject() {
  let projectId = projects.length + 1;
  let projName = document.getElementById("project-name").value;
  let projDesc = document.getElementById("project-description").value;
  let techsArray = document.getElementById("project-technologies").value;
  let techs = JSON.parse(techsArray).map(tech => tech.value);

  let percent = document.getElementById("project-percentage").value;
  let start = document.getElementById("project-startDate").value;
  let end = document.getElementById("project-endDate").value;
  let projectObj = {
    id: projectId,
    project_name: projName,
    project_desc: projDesc,
    tech_used: techs,
    percentage_complete: percent,
    start_date: start,
    end_date: end,
  };
  projects.push(projectObj);
  console.log(projects);
  apis.putAPI("PUT", utils.projectAPI, utils.secretKey, JSON.stringify(projects), (res) => { location.reload(); });
}

function removeProjects() {
  document.getElementById("projectList").innerHTML = "";
}

// /*---------------- Field validation ------------------------*/

// Validate on blur (Add projects)
allAddProjectFields.forEach((field) => {
  field.addEventListener("blur", (e) => {
    utils.validate(e.target);
  });
});


document.querySelector('.btn-red').addEventListener('click',()=>{
  apis.preLoader()
})

// /*---------------- Navigation Drawer ------------------------*/

document.querySelector('.drawer-handle').addEventListener('click', ()=>{
  document.querySelector('.navigation-drawer').classList.toggle('active-drawer')
})