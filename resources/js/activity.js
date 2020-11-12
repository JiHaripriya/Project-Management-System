/*----------------------------------------------------------------------------------------
 >> ACTIVITY.JS
 - This js file is a common collection of all functions related to activity tab

 >> CONTENTS
    1. API call and global status reports variable setup.
    2. Add event listeners to all project cards for loading activity tab data on click event.
    3. Function to load activity tab data.
    4. Function to load options for resource list drop down.
    5. Function to create option tags with value and text passed to the function.
    6. Function to load activity tab history (i.e., all status report entries for that project).
    7. Date drop down related functions:
          i. Generate past one week's dates and populate generated dates to drop down list.
          ii. Generate sequence of working hours and minutes and populate generated data.
    8. Status report form submission.
    9. Function to convert single digit numbers to double by adding zero.
    10. Pop up activity form on button click (for responsive view).
----------------------------------------------------------------------------------------*/

import utils from './utils.js'
import apis from './api.js'

/*-------------- API call and global status reports variable setup ---*/
apis.getAPI('get', utils.statusReportAPI, utils.secretKey, true, (allStatusReports) => {
    utils.latestOfflineStatusReports = allStatusReports
    loadStatusReportResourceList()
    loadActivityHistory()
});

/*-------- Add event listeners to all project cards for loading activity tab data on click event ---*/
const cards = document.querySelectorAll('.project-card')
cards.forEach((card) => {
    card.addEventListener('click', (e) => {
        let cardDiv = e.target.closest('div')
        activityCall(cardDiv)
    })
})

/*-------- Function to load activity tab data ----------*/
function activityCall(card) {
    // Clear error message for resource field drop down input
    document.querySelector('#resource-error-message').innerText = '';
    document.querySelector('#activity-form').reset();
    document.querySelector('#dates').selectedIndex = dateArray.length - 1;
    document.querySelector('#time-spent').selectedIndex = 8; // 8 hours is the default value
    loadStatusReportResourceList(card)
    loadActivityHistory(card)
    hoursSpentByEachResource(card)
}

/*-------- Loads options for resource list drop down ----------*/
function loadStatusReportResourceList(card = '') {
    const currentProjectId = card ? Number(card.dataset.id) : Number(document.querySelector('.active-card').dataset.id);
    const currentProjectResourceList = utils.latestOfflineResourceList.reduce((acc, curr) => {
        curr.project_id === currentProjectId ? acc.push(curr.name + ', ' + curr.email) : acc;
        return acc;
    }, []);
    const resourceListOptions = document.querySelector('#resources-list');
    resourceListOptions.innerHTML = '';
    const defaultOption = createOptions('', 'Select');
    resourceListOptions.appendChild(defaultOption);
    currentProjectResourceList.forEach(resource => {
        const option = createOptions(resource, resource);
        resourceListOptions.appendChild(option);
    })
}

/*-------- Creates option tags with value and text passed to the function ----------*/
function createOptions(value, text) {
    const option = document.createElement('option')
    option.value = value, option.text = text
    return option
}

/*-------- Loads activity tab history (i.e., all status report entries for that project) ----------*/
function loadActivityHistory(card) {
    const currentProjectId = card ? Number(card.dataset.id) : Number(document.querySelector('.active-card').dataset.id);
    const activityHistory = utils.latestOfflineStatusReports[currentProjectId - 1];
    if (activityHistory && activityHistory.length > 0) {
        document.querySelector('.no-data-div-activity').style.display = 'none'
        
        const sortable = activityHistory.reduce((acc, statusReport) => {
            acc[statusReport.date] ? acc[statusReport.date].push(statusReport) : acc[statusReport.date] = Array(statusReport);
            return acc;
        }, {})
        const activityHistoryByDate = Object.entries(sortable)
            .sort(([a,], [b,]) => { return new Date(b) - new Date(a); })
            .reduce((acc, [date, statusReportArray]) => ({ ...acc, [date]: statusReportArray }), {});
        
        const history = document.querySelector('.history-tab');
        history.innerHTML = '';

        for (const x in activityHistoryByDate) {
            const entries = document.createElement('div');
            entries.className = 'entries';
            entries.innerHTML = `<span class="history-date"><span>${x.split('-').reverse().join('/')}</span></span>`;
            
            activityHistoryByDate[x].forEach(statusReport => {
                const statusReportEntry = document.createElement('div');
                statusReportEntry.className = 'history-tab__contents';
                statusReportEntry.innerHTML += `<span class="history__resource-name">${statusReport.resourceName}</span>
                <span class="history__resource-email">${statusReport.emailId}</span>
                <span class="history__activity-type">${statusReport.activityType}</span>
                <span class="history__time-spent">${statusReport.hoursSpent} hour(s)</span>
                <span class="seperator-line"></span>
                <span class="history__posted-time" style="font-size: 80%">Posted On: <br>${statusReport.submitDate.split('-').reverse().join('/')}  ${statusReport.submitTime}</span>`;
                entries.appendChild(statusReportEntry);
            })
            
            history.appendChild(entries);
        }
    } else {
        document.querySelector('.no-data-div-activity').style.display = 'block'
        const history = document.querySelector('.history-tab');
        history.innerHTML = '';
    }
}

/*---------------------------------------------------------------------------------------------------------*/
/*-------------------------------- Date drop down related functions ---------------------------------------*/
/*---------------------------------------------------------------------------------------------------------*/
let datesDropDown = document.querySelector('#dates')

// GET DATE VALUE: datesDropDown.addEventListener('change', e => console.log(e.target.value))

Date.prototype.subtractDays = function (days) {
    let date = new Date(this.valueOf())
    date.setDate(date.getDate() - days)
    return date
}

/*-------- Generates dates between a given start and end date (both inclusive) and returns an array of dates ----------*/
function generateDates(startDate, stopDate) {
    let dateArray = new Array(), currentDate = startDate
    while (currentDate >= stopDate) {
        dateArray.push(`${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`)
        currentDate = currentDate.subtractDays(1)
    }
    return dateArray
}

// Get dates array in increasing order
const dateArray = generateDates(new Date(), new Date().subtractDays(7)).reverse()

// Populate dates dropdown
dateArray.forEach(
    (eachDate, index) => {
        const option = createOptions(eachDate, eachDate)
        // Select today's date
        if (index == dateArray.length - 1) option.selected = true
        datesDropDown.appendChild(option)
    }
)

// Append 0 to single digit time spent values
const hoursSequence = Array.from({ length: 17 }, (_, index) => String(index).length == 1 ? `0${index}` : `${index}`),
minuteSequence = Array.from({length:4}, (_, index) => String((index) * 15).length == 1 ? `0${(index) * 15}`: `${(index) * 15}`)

const hoursDropDown = document.querySelector('#time-spent')
hoursSequence.forEach(
    (hourValue, index) => {
        const option = createOptions(hourValue, hourValue)
        // Select minimum number of working hours (i.e., 8 hours)
        if (index == 8) option.selected = true
        hoursDropDown.appendChild(option)
    }
)

const minutesDropDown = document.querySelector('#time-spent-minutes')
minuteSequence.forEach(
    (hourValue) => {
        const option = createOptions(hourValue, hourValue)
        minutesDropDown.appendChild(option)
    }
)

/*---------------------------------------------------------------------------------------------------------*/
/*----------------------------- Activity form submission - Activity Update --------------------------------*/
/*---------------------------------------------------------------------------------------------------------*/

// Activity form pop-up
const activityForm = document.querySelector("#activity-form");

// Event listener for status report form submit button
const activityFormButton = document.querySelector("#generate-activity");
activityFormButton.addEventListener('click', function (e) {
    e.preventDefault();

    // Validate, format and store form data in variables
    const date = document.querySelector('#dates').value.split('/').reverse().join('-');
    let resourceName, emailId;
    if (document.querySelector('#resources-list').value) {
        document.querySelector('#resource-error-message').innerText = '';
        [resourceName, emailId] = document.querySelector('#resources-list').value.split(',');
        document.querySelector('.save-button').style.alignItems = "flex-end"
        activityFormButton.style.marginTop = "0"
    } else {
        document.querySelector('#resource-error-message').innerText = 'This field cannot be null';
        if (window.innerWidth >= 1230) {
            document.querySelector('.save-button').style.alignItems = "center"
            activityFormButton.style.marginTop = "7px"
        }
    }
    const activityType = document.querySelector('#activity-type').value;
    const hoursSpent = document.querySelector('#time-spent').value + ':' + document.querySelector('#time-spent-minutes').value;
    const submitDateTime = new Date();
    const submitDate = submitDateTime.getFullYear() + '-' + singleToDouble(submitDateTime.getMonth() + 1) + '-' + singleToDouble(submitDateTime.getDate());
    const submitTime = singleToDouble(submitDateTime.getHours()) + ':' + singleToDouble(submitDateTime.getMinutes()) + ':' + singleToDouble(submitDateTime.getSeconds());
    
    if (resourceName && emailId) {
        // All form data is valid
        const statusReportObj = {
            date,
            resourceName,
            emailId: emailId.trim(),
            activityType,
            hoursSpent,
            submitDate,
            submitTime
        }
        if(!utils.latestOfflineStatusReports[Number(document.querySelector('.active-card').dataset.id)-1]){
            utils.latestOfflineStatusReports[Number(document.querySelector('.active-card').dataset.id)-1] = [];
        }
        utils.latestOfflineStatusReports[Number(document.querySelector('.active-card').dataset.id)-1].push(statusReportObj);
        console.log(utils.latestOfflineStatusReports)
        apis.putAPI("PUT", utils.statusReportAPI, utils.secretKey, JSON.stringify(utils.latestOfflineStatusReports), (obj) => {
            activityCall(document.querySelector('.active-card'));
        });
        if (window.innerWidth < 1230) activityForm.style.display = 'none'
    }
});

// Converts single digit numbers to double by adding zero
function singleToDouble(num) {
    let n = String(num)
    if (n.length == 1) n = '0' + n
    return n
}


// Activity Form Pop up
const popupActivityForm = document.querySelector("#popup-activity")
popupActivityForm.addEventListener('click', _ => {
    activityForm.style.display = 'block'
})

const closeActivityForm = document.querySelector('#close-activity')
closeActivityForm.addEventListener('click', _ => {
    activityForm.style.display = 'none'
    document.querySelector('#resource-error-message').innerText = '' // Clear error message
})

// Hide or display activity form according to screen width
window.onresize = function () {
    if (window.innerWidth >= 1230) activityForm.style.display = 'flex'
    else activityForm.style.display = 'none'
}

function hoursSpentByEachResource(card) {
    const statusReportEntries = utils.latestOfflineStatusReports[Number(card.dataset.id)-1];
    if(statusReportEntries) {
        let totalHoursSpent = 0;
        const hoursBreakDown = statusReportEntries.reduce((acc, curr) => {
          const [hours, minutes] = curr.hoursSpent.split(':');
          const timeSpent = Number(hours) + Number(minutes)/60;
          acc[curr.emailId] ? acc[curr.emailId] += timeSpent : acc[curr.emailId] = timeSpent;
          totalHoursSpent += timeSpent;
          return acc;
        }, {});
        const emailIdNameMapping = statusReportEntries.reduce((acc, curr) => {
            if(!acc[curr.emailId]) {
                acc[curr.emailId] = curr.resourceName;
            }
            return acc;
        }, {});
        console.log(emailIdNameMapping)
        if(totalHoursSpent) {
            const tempTotalHoursSpent = totalHoursSpent.toString().split('.');
            if (!tempTotalHoursSpent[1]) tempTotalHoursSpent[1] = 0;
            utils.formattedTotalHoursSpent = singleToDouble(tempTotalHoursSpent[0])+':'+singleToDouble(tempTotalHoursSpent[1]*.60);
            // document.querySelector('#total-hours-spent').innerHTML = `${utils.formattedTotalHoursSpent} hour(s)`;
            const hoursBreakDownTableBody = document.querySelector('#resources-activity-table__body');
            hoursBreakDownTableBody.innerHTML = '';
            for(const x in hoursBreakDown) {
                const tempHoursBreakDown = hoursBreakDown[x].toString().split('.');
                if(!tempHoursBreakDown[1]) tempHoursBreakDown[1] = 0;
                const formattedHoursBreakDown = singleToDouble(tempHoursBreakDown[0])+':'+singleToDouble(tempHoursBreakDown[1]*.60);
                hoursBreakDownTableBody.innerHTML += `<tr>
                <td>${emailIdNameMapping[x]}</td>
                <td>${x}</td>
                <td>${formattedHoursBreakDown}</td>
              </tr>`;
            }
        } else {
            utils.formattedTotalHoursSpent = '00:00';
        }
    } else {
        utils.formattedTotalHoursSpent = '00:00';
    }
}