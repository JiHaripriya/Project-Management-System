/*---------------------------------------------------------------
 >> RESOURCES.JS
 - This js file includes all features for the details tab.

 >> CONTENTS
    1. API call and global resource variable setup.
    2. Add resources form popup.
    3. Add resource to server.
    4. Edit resources form popup.
    5. Dynamic Resource table loading.
    6. Edit Resource in server.
    7. Delete Resource in server.
    8. Validation on blur for 'Add resources' and 'Edit resources' form.
----------------------------------------------------------------*/
import utils from './utils.js'
import apis from './api.js'

/*-------------- API call and global resource variable setup ---*/
apis.getAPI('get', utils.resourceAPI, utils.secretKey, true, (allResources) => {
  utils.latestOfflineResourceList = allResources
  resourceCall(firstSelectedCard)
})

/*-------------- Add resources form popup ----------------------*/
let availableResource = false
const addResourceBtn = document.querySelector(".add-resources-btn");
const cancelAddResourcesBtn = document.querySelector(".cancel-add-resources-btn");
const allAddResourcesFields = document.querySelectorAll(".add-resources-validate");

addResourceBtn.addEventListener("click", () => {
  if (availableResource) {
    utils.popup("AddResources");
  }
});

cancelAddResourcesBtn.addEventListener("click", () => {
  utils.popup("AddResources");
});

/* ------------------ Add resource to server ------------------- */
document.querySelector('.add-resources-popup-btn').addEventListener("click", () => {
  const allAddResourceFields = document.querySelectorAll(".add-resources-validate");
  var isAddResourceValid = true;
  utils.validateFields(allAddResourceFields, isAddResourceValid, (valid) => {
    if (valid === true) {
      let resourceList = utils.latestOfflineResourceList
      AddResources(resourceList)
    }
  })

})

function AddResources(resources) {
  let copyResource = [...resources]
  let resourceId = copyResource.pop().id + 1;
  let resourceName = document.getElementById('name-add').value;
  let resourceEmail = document.getElementById('email-add').value;
  let resourceBillableCheck = document.getElementById('billable-add').checked;
  let resourceBillable;
  if(resourceBillableCheck == true){
    resourceBillable = 'True'
  }
  else{
    resourceBillable = 'False'
  }
  let resourceRate = document.getElementById('rate-add').value;
  let projectId = document.querySelector('.active-card').dataset.id;

  let newResource = {
    id: resourceId,
    project_id: Number(projectId),
    name: resourceName,
    email: resourceEmail,
    billable: resourceBillable,
    rate_per_hour: Number(resourceRate)
  }
  resources.push(newResource);

  apis.putAPI("PUT", utils.resourceAPI, utils.secretKey, JSON.stringify(resources), (obj) => {
    utils.latestOfflineResourceList = resources
    resourceCall(document.querySelector('.active-card'))
  });

  utils.popup("AddResources")
}

/*---------------- Edit resources form popup ---------------------*/

const cancelEditResourceBtn = document.querySelector(".cancel-edit-resources-btn");
const allEditResourcesFields = document.querySelectorAll(".edit-resources-validate");

cancelEditResourceBtn.addEventListener("click", () => {
  utils.popup("EditResources");
});

/*---------------- Dynamic Resource table ------------------------*/
const cards = document.querySelectorAll('.project-card')
const firstSelectedCard = document.querySelector('.active-card')
cards.forEach((card) => {
  card.addEventListener('click', (e) => {
    let cardDiv = e.target.closest('div')
    resourceCall(cardDiv)
  })
})

function resourceCall(card) {
  let resourceList = utils.latestOfflineResourceList
  if (resourceList && resourceList.length > 0) {
    // Clear the 'No data available' message
    document.querySelector('.no-data-div-resource').style.display = 'none'
    availableResource = true

    let selectedResources = resourceList.filter((resources) => resources.project_id == card.dataset.id)
    tableMaker(selectedResources)
  }
  else {
    document.querySelector('.no-data-div-resource').style.display = 'block'
    availableResource = false
  }

}

function tableMaker(resourceList) {
  let table = document.querySelector('.resource-table')
  if (resourceList) {
    if (resourceList.length > 0) {
      table.innerHTML = `<thead>
              <th>Name</th>
              <th>Email</th>
              <th>Billable</th>
              <th>Rate per hour</th>         
            </thead>`
      let tableBody = document.createElement('tbody')
      resourceList.forEach((resource) => {
        let row = document.createElement('tr')
        row.innerHTML = `<td>${resource.name}</td>
                <td>${resource.email}</td>
                <td>${resource.billable}</td>
                <td style="text-align: right;">${resource.rate_per_hour}</td>
                <td class="edit-resource" data-id=${resource.id} style="text-align: center;"><ion-icon name="create-outline"></ion-icon></td>
                <td class="delete-resource" data-id=${resource.id} style="text-align: center;"><ion-icon name="trash-outline"></ion-icon></td>`
        tableBody.appendChild(row)
      })
      table.appendChild(tableBody)

      activateEdit()
      activateDelete()
    }
    else {
      console.log('No resource available')
      // Display the 'No data available' message
      table.innerHTML = ' '
      document.querySelector('.no-data-div-resource').style.display = 'block'
    }
  }
}

/*---------------- Edit Resource in server ------------------------*/
let currentEditingId
function activateEdit() {
  let resourceList = utils.latestOfflineResourceList
  const editResourceBtn = document.querySelectorAll(".edit-resource");
  editResourceBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      let resourceToEdit = resourceList.find((resource) => resource.id == btn.dataset.id)

      // Set default values for input fields in popup
      document.querySelector('#edit-name-add').value = resourceToEdit.name
      document.querySelector('#edit-email-add').value = resourceToEdit.email
      document.querySelector('#edit-rate-add').value = resourceToEdit.rate_per_hour
      if (resourceToEdit.billable) {
        document.querySelector('#edit-billable-add').checked = true
      }

      currentEditingId = resourceToEdit.id
      utils.popup("EditResources");
    });
  });
}

const updateResourcesBtn = document.querySelector('.edit-resources-popup-btn')

updateResourcesBtn.addEventListener('click', () => {
  let resourceList = utils.latestOfflineResourceList
  let updateReference = resourceList.find((resource) => resource.id == currentEditingId)

  // The original list (latestOfflineResourceList) is getting updated as this is a call by reference
  updateReference.name = document.querySelector('#edit-name-add').value
  updateReference.email = document.querySelector('#edit-email-add').value
  let updateResourceBillable = document.querySelector('#edit-billable-add').checked
  let updatedResourceBillableCheck
  if(updateResourceBillable == true){updatedResourceBillableCheck = 'True'}else{updatedResourceBillableCheck = 'False'}
  updateReference.billable = updatedResourceBillableCheck
  updateReference.rate_per_hour = document.querySelector('#edit-rate-add').value

  apis.putAPI("PUT", utils.resourceAPI, utils.secretKey, JSON.stringify(resourceList), (resp) => {
    utils.latestOfflineResourceList = resourceList
    resourceCall(document.querySelector('.active-card'))
  });
  utils.popup("EditResources")
})

/*---------------- Delete Resource in server ------------------------*/
function activateDelete() {
  const delResourceBtn = document.querySelectorAll(".delete-resource");
  delResourceBtn.forEach((btn) => {
    btn.addEventListener("click", () => {
      utils.popup("DeleteResources")
      const confirmDeleteBtn = document.querySelector(".delete-resources-popup-btn")
      confirmDeleteBtn.addEventListener("click", ()=>{
        let resourceList = utils.latestOfflineResourceList
        let updatedOfflineResourceList = resourceList.filter((a) => a.id != btn.dataset.id);
        console.log(updatedOfflineResourceList)
        apis.putAPI(
          "PUT",
          utils.resourceAPI, utils.secretKey,
          JSON.stringify(updatedOfflineResourceList), (docu) => {
            utils.latestOfflineResourceList = updatedOfflineResourceList
            resourceCall(document.querySelector('.active-card'))
          }
        )
        utils.popup("DeleteResources")  
      })
    })
  })
}

document.querySelector(".cancel-delete-resources-btn").addEventListener("click", () => {
  utils.popup("DeleteResources")
})

// Validate on blur (Add resources)
allAddResourcesFields.forEach((field) => {
  field.addEventListener("blur", (e) => {
    utils.validate(e.target);
  });
});

// Validate on blur (Edit resources)
allEditResourcesFields.forEach((field) => {
  field.addEventListener("blur", (e) => {
    utils.validate(e.target);
  });
})
