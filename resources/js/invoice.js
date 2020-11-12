/*---------------------------------------------------------------
 >> INVOICE.JS
 - This js file includes all features for the invoice tab.

 >> CONTENTS
    1. Dynamic invoice table.
    2. Invoice calculation.
----------------------------------------------------------------*/
import utils from './utils.js'
import apis from './api.js'

let calcResource; // variable to store all resource list.
apis.getAPI('get', utils.resourceAPI, utils.secretKey, true, (allResources) => {
  utils.latestOfflineResourceList = allResources
  resourceCall(firstSelectedCard)
})
/*---------------- Dynamic invoice table ------------------------*/
const cards = document.querySelectorAll('.project-card')
const firstSelectedCard = document.querySelector('.active-card')


cards.forEach((card) => {
  card.addEventListener('click', (e) => {
    let cardDiv = e.target.closest('div')
    resourceCall(cardDiv)
  })
})

// table making
function resourceCall(card) {
  let allResources = utils.latestOfflineResourceList
  let selectedResources = allResources.filter((resources) => resources.project_id == card.dataset.id && resources.billable == "True")
  tableMaker(selectedResources);
  remove();
}


function tableMaker(resourceList) {
  if (resourceList) {
    let table = document.querySelector('.invoice-details')
    if (resourceList.length <= 0) {
      table.innerHTML = ''
      document.querySelector('.no-data-div-invoice').style.display = 'block'
    }
    else {
      document.querySelector('.no-data-div-invoice').style.display = 'none'
      table.innerHTML = `<thead>
              <th style="color: #fff;">Name</th>
              <th style="color: #fff;">Rate per hour</th>    
              <th style="color: #fff;">Total amount</th>  
            </thead>`
      let tableBody = document.createElement('tbody')
      resourceList.forEach((resource) => {
        let row = document.createElement('tr')
        row.innerHTML = `<td>${resource.name}</td>
                <td class= "invoice-rate" style="text-align: right;">${resource.rate_per_hour}</td>
                <td class= "total-amount-per-person" data-id = ${resource.id} style="text-align: right;">---</td>`
        tableBody.appendChild(row)
      })
      table.appendChild(tableBody)
    }
  }
  else {
    console.log('No resource available')
  }
  calcResource = resourceList
}


 
  /*----------------- Invoice calculation-------------------------- */
  // Update table if any change occurs in resource.
  document.querySelector('#invoice-btn').addEventListener('click',()=>{
   resourceCall(document.querySelector('.active-card'))
 })

  let generateInvoice = document.querySelector(".generate-invoice-btn");
  generateInvoice.addEventListener("click", calculation);

  function calculation() {
    let workingDays = document.getElementById("working-days").value;
    if (workingDays) {
      let amountPerPerson = document.querySelectorAll(".total-amount-per-person");
      const workingHours = 8;
      let total =0;
      amountPerPerson.forEach(e=>{
        calcResource.forEach(r => { if(r.id == e.dataset.id) {
          e.innerHTML = r.rate_per_hour * workingHours * workingDays;
          total += Number(e.innerHTML);
        };
       
      })
    })

      // let rateList = calcResource.map(e => e.rate_per_hour);
      // let total = 0;
      // const workingHours = 8;
      // rateList.forEach(rate => { total = total + rate * workingHours * workingDays; })
      document.querySelector(".total-amount").innerHTML = total;
    }
}

  // Clear input field and total amount.
  function remove() {
    document.getElementById("working-days").value = "";
    document.querySelector(".total-amount").innerHTML = "";
    document.querySelectorAll(".total-amount-per-person").innerHTML = "---"
  }
