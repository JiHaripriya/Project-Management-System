/*---------------------------------------------------------------
 >> DASHBOARD.JS
 - This js file is a common collection of all dashboard functions
   used in this project.

 >> CONTENTS
    1. API call.
    2.  Make dynamic data after API call.
        i. Converts single digit numbers to double by adding zero.
        ii. Create tech and number of projects list.
        iii. Make graph of projects vs technologies.
        iv. Make graph of projects vs resources.
    3. Hamburger.
    4. Clicks for nav items
----------------------------------------------------------------*/
import utils from './utils.js'
import apis from './api.js'

/*---------------- API call ------------------------------*/
let apiPromise = new Promise((resolve, reject) => {
  let allProjectDetails, allResourceDetails
  apis.getAPI('get', utils.resourceAPI, utils.secretKey, true, (allResources) => {
    allResourceDetails = allResources

    apis.getAPI('get', utils.projectAPI, utils.secretKey, true, (allProjects) => {
      allProjectDetails = allProjects

      if (allProjectDetails && allResourceDetails && allProjectDetails.length > 0 && allResourceDetails.length > 0) {
        resolve([allProjectDetails, allResourceDetails])
      }
      else {
        reject('Server sleepy')
      }

    })
  })

})

/*---------------- Make dynamic data after API call -----*/
apiPromise.then((detailsArray) => {
  // detailsArray[0] will be projects
  // detailsArray[1] will be resources

  let totalProjects = detailsArray[0].length
  let totalEmployees = detailsArray[1].length

  document.querySelector('.projects-card .card-number').innerHTML = singleToDouble(totalProjects)
  document.querySelector('.total-employee-card .card-number').innerHTML = singleToDouble(totalEmployees)

  let billableEmployees = detailsArray[1].filter((resource) => resource.billable === 'True')
  let shadowEmployees = detailsArray[1].filter((resource) => resource.billable === 'False')

  document.querySelector('.employees-billable-card .card-number').innerHTML = singleToDouble(billableEmployees.length)
  document.querySelector('.employees-shadow-card .card-number').innerHTML = singleToDouble(shadowEmployees.length)

  dynamicTech(detailsArray[0])
  projectVsTechGraph(detailsArray[0])
  projectVsResourceGraph(detailsArray[0], detailsArray[1])


})
  .catch((msg) => {
    console.log(msg)
  })

// Converts single digit numbers to double by adding zero
function singleToDouble(num) {
  let n = String(num)
  if (n.length == 1) n = '0' + n

  return n
}

// Function to create tech and number of projects list
function dynamicTech(projects) {

  let techList = {}
  projects.forEach((project) => {
    project.tech_used.forEach((tech) => {
      if (Object.keys(techList).includes(tech)) techList[tech] += 1
      else techList[tech] = 1
    })
  })

  let listBox = document.querySelector('.tech-list')
  Object.keys(techList).forEach((techs) => {
    let list = document.createElement('div')
    list.className = 'list-element flex-box'

    let p1 = document.createElement('p')
    let p2 = document.createElement('p')
    p2.className = 'project-count'
    p1.innerHTML = techs
    p2.innerHTML = techList[techs]

    list.appendChild(p1)
    list.appendChild(p2)

    listBox.appendChild(list)
  })
}

// Function to extract details and make graph of projects vs technologies
function projectVsTechGraph(projectList) {
  let PvTList = {}

  projectList.forEach((project) => {
    PvTList[project.project_name] = project.tech_used.length
  })

  let listOfProjects = Object.keys(PvTList)
  let numOfTech = Object.values(PvTList)
  let projectTechChart = document.getElementById('chartOne').getContext('2d');

  let PvTDetails = [listOfProjects, 'Technologies', numOfTech, '#49d8a0', 'transparent']
  utils.chartMaker(projectTechChart, 'bar', PvTDetails)

}

// Function to extract details and make graph of projects vs resources
function projectVsResourceGraph(projects, resources) {

  /** Count number of resources against project ids */
  let ProjID_vs_Resource = {}  // Default order will be ascending order of project_id. So no need of sorting

  resources.forEach((res) => {
    let projId = `${res.project_id}` // number to string conversion
    if (Object.keys(ProjID_vs_Resource).includes(projId)) ProjID_vs_Resource[res.project_id] += 1
    else ProjID_vs_Resource[res.project_id] = 1
  })

  /**Create data arrays for chart */
  let projectList = []
  let resourceCount = []

  projects.forEach((project)=>{
    let projId = `${project.id}` // number to string conversion
    projectList.push(project.project_name)
    if(Object.keys(ProjID_vs_Resource).includes(projId)){
      resourceCount.push(ProjID_vs_Resource[project.id])
    }
    else{
       resourceCount.push(0)
    }
  })

  /** Make thy chart */
  let projectResChart = document.getElementById('chartTwo').getContext('2d');
  let PvRDetails = [projectList, 'Resources', resourceCount, '#49d8a12d', '#49d8a0']
  utils.chartMaker(projectResChart, 'line', PvRDetails)
}



/*---------------- Hamburger -----------------------------*/
let hamburger = document.querySelector('.mobile-hamburger')
let sidePanel = document.querySelector('.side-panel')
let mainPanel = document.querySelector('.main-panel')
let backBtn = document.querySelector('.back-arrow')

hamburger.addEventListener('click', () => {
  disableScroll()
  toggleSidebar()
  
})

backBtn.addEventListener('click', () => {
  toggleSidebar()
  enableScroll()
})

function disableScroll() {
  // Get the current page scroll position 
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop
  let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

    // if any scroll is attempted, set this to the previous value 
    window.onscroll = function () {
      window.scrollTo(scrollLeft, scrollTop);
    };
}

function enableScroll() { 
    window.onscroll = function() {}; 
} 

function toggleSidebar() {
  sidePanel.classList.toggle('active-sidebar')
  mainPanel.classList.toggle('blur')
}

/*---------------- clicks for nav items -------------------*/
let toProjects = document.querySelector('#projectLink')
toProjects.addEventListener('click', () => {
  location.href = 'index.html'
})

