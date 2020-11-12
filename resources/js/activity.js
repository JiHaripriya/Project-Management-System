/*----------------------------------------------------------------------------------------
 >> ACTIVITY.JS
 - This js file is a common collection of all functions related to activity tab

 >> CONTENTS
    1. API call and global status reports variable setup.
    2. Add event listeners to all project cards for loading activity tab data on click event.
    3. Function to load activity tab data.
    4. Function to load options for resource list drop down.
    5. Function to load activity tab history (i.e., all status report entries for that project).
    6. Date drop down related functions:
          i. Generate past one week's dates and populate generated dates to drop down list.
          ii. Generate sequence of working hours and minutes and populate generated data.
    7. Status report form submission.
    8. Pop up activity form on button click (for responsive view).
    9. Function to calculate total hours spent on the project as well as total hours spent by each resource on the project.
    10. Function to create option tags with value and text passed to the function.
    11. Function to convert single digit numbers to double by adding zero.
    12. Function to return project id of currently selected project.
    13. Function to format hour value passed into it to hh:mm format and return it.
    14. Export statements.
----------------------------------------------------------------------------------------*/

import utils from './utils.js'
import apis from './api.js'

/*-------------- API call and global status reports variable setup ---*/
apis.getAPI('get', utils.statusReportAPI, utils.secretKey, true, (allStatusReports) => {
    utils.latestOfflineStatusReports = allStatusReports;
    activityCall();
});

/*-------- Add event listeners to all project cards for loading activity tab data on click event ---*/
const cards = document.querySelectorAll('.project-card')
cards.forEach((card) => {
    card.addEventListener('click', _ => {
        activityCall()
    })
})

/* ------- Function to reset status report form ---------- */
function resetStatusReportForm() {
    // Clear error message for resource field drop down input
    document.querySelector('#resource-error-message').innerText = '';
    document.querySelector('#activity-form').reset();
    document.querySelector('#dates').selectedIndex = dateArray.length - 1; // Latest date is the default value
    document.querySelector('#time-spent').selectedIndex = 8; // 8 hours is the default value
}

/*-------- Function to load activity tab data ----------*/
function activityCall() {
    resetStatusReportForm();
    hoursSpentByEachResource();
    loadActivityHistory();
    loadStatusReportResourceList();
}

/*-------- Loads options for resource list drop down ----------*/
const loadStatusReportResourceList = function () {
    const currentProjectId = currentlySelectedCardId();
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

/*-------- Loads activity tab history (i.e., all status report entries for that project) ----------*/
function loadActivityHistory() {
    const currentProjectId = currentlySelectedCardId();
    const activityHistory = utils.latestOfflineStatusReports[currentProjectId - 1];
    if (activityHistory && activityHistory.length > 0) {
        document.querySelector('.no-data-div-activity').style.display = 'none'
        document.querySelector('.resources-activity').style.display = 'block'

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
            activityHistoryByDate[x].reverse().forEach(statusReport => {
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
        document.querySelector('.resources-activity').style.display = 'none'
        const history = document.querySelector('.history-tab');
        history.innerHTML = '';
    }
}

/*---------------------------------------------------------------------------------------------------------*/
/*------------------------------- Date and time drop down related functions -------------------------------*/
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
    minuteSequence = Array.from({ length: 4 }, (_, index) => String((index) * 15).length == 1 ? `0${(index) * 15}` : `${(index) * 15}`)

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
        if (!utils.latestOfflineStatusReports[Number(document.querySelector('.active-card').dataset.id) - 1]) {
            utils.latestOfflineStatusReports[Number(document.querySelector('.active-card').dataset.id) - 1] = [];
        }

        utils.latestOfflineStatusReports[Number(document.querySelector('.active-card').dataset.id)-1].push(statusReportObj);
        const currentProjectStatusReports = utils.latestOfflineStatusReports[Number(document.querySelector('.active-card').dataset.id)-1]

        const resourceWorkingHours = calculateResourceWorkingHours(currentProjectStatusReports, date, emailId.trim())
                                
        // Check whether total working hours of the selected resource exceeds threshold
        if (resourceWorkingHours > 16) {
            // Remove local update
            utils.latestOfflineStatusReports[Number(document.querySelector('.active-card').dataset.id)-1].pop()
            document.querySelector('.overtime-popup').innerHTML = `
                        <img src="resources/imgs/error-img.png" alt="No Data available image">
                        <h3 class="add-resources-heading" style="margin-top: 10px;"> Maximum working hours per day is 16</h3>
                        <h5> You have already entered ${calculateResourceWorkingHours(currentProjectStatusReports, date, emailId.trim())} hours for this resource! </h5>
                        <span class="generate-activity" id="close-popup" style="margin: 15px 0 0 0;">Ok</span>`

            utils.popup('OvertimePopUp')

            // Close validation pop
            const validationPopUp = document.querySelector('#close-popup')
            validationPopUp.addEventListener('click', _ => utils.popup('OvertimePopUp'))
        }
        else {
            apis.putAPI("PUT", utils.statusReportAPI, utils.secretKey, JSON.stringify(utils.latestOfflineStatusReports), (obj) => {
                activityCall(document.querySelector('.active-card'));
            });
        }
        if (window.innerWidth < 1230) activityForm.style.display = 'none'
    }
    
});

// Calculate number of working hours in a day for a resource
function calculateResourceWorkingHours(resourceList, date, emailId) {
    return resourceList.filter(report => report.date == date && report.emailId == emailId.trim())
            .map (resource => {
                const [hours, minutes] = resource.hoursSpent.split(':')
                return Number(hours) + (Number(minutes)/60) 
            })
            .reduce((sum, value) => {return sum + value}, 0)
}

/*-----------------------------------------------------------------*/
/*-----------Activity form pop-up for responsive view--------------*/
/*-----------------------------------------------------------------*/

// Activity Form Pop up
const popupActivityForm = document.querySelector("#popup-activity")
popupActivityForm.addEventListener('click', _ => {
    activityForm.style.display = 'block'
})

const closeActivityForm = document.querySelector('#close-activity')
closeActivityForm.addEventListener('click', _ => {
    activityForm.style.display = 'none'
    resetStatusReportForm()
})

// Hide or display activity form according to screen width
window.onresize = function () {
    if (window.innerWidth >= 1230) activityForm.style.display = 'flex'
    else activityForm.style.display = 'none'
}

/*----------------------------------------------------------------------------------------------------------------------------*/
/*----------------------------Function to load activity data in Project page 'Details' tab------------------------------------*/
/*----------------------------------------------------------------------------------------------------------------------------*/

// Calculates total hours spent on the project as well as total hours spent by each resource on the project
function hoursSpentByEachResource() {
    const currentProjectId = currentlySelectedCardId() - 1;
    const statusReportEntries = utils.latestOfflineStatusReports[currentProjectId];
    if (statusReportEntries) {

        let totalHoursSpent = 0;
        // Calculates total hours spent on the project - totalHoursSpent
        // as well as total hours spent by each resource on the project - hoursBreakDown
        const hoursBreakDown = statusReportEntries.reduce((acc, curr) => {
            const [hours, minutes] = curr.hoursSpent.split(':');
            const timeSpent = Number(hours) + Number(minutes) / 60;
            acc[curr.emailId] ? acc[curr.emailId] += timeSpent : acc[curr.emailId] = timeSpent;
            totalHoursSpent += timeSpent;
            return acc;
        }, {});

        // Creates object with unique email ids in the project's status reports array as keys and the resource's name as value
        const emailIdNameMapping = statusReportEntries.reduce((acc, curr) => {
            if (!acc[curr.emailId]) {
                acc[curr.emailId] = curr.resourceName;
            }
            return acc;
        }, {});

        // If time has been invested on the project
        if (totalHoursSpent) {
            utils.formattedTotalHoursSpent = formatTime(totalHoursSpent);

            if (document.querySelector('#total-hours-spent')) {
                document.querySelector('#total-hours-spent').innerHTML = `${utils.formattedTotalHoursSpent} hour(s)`;
            }

            const hoursBreakDownTableBody = document.querySelector('#resources-activity-table__body');
            hoursBreakDownTableBody.innerHTML = '';
            for (const x in hoursBreakDown) {
                const formattedHoursBreakDown = formatTime(hoursBreakDown[x]);

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

// Returns project id of currently selected project
function currentlySelectedCardId() {
    return Number(document.querySelector('.active-card').dataset.id);
}

/*-------- Creates option tags with value and text passed to the function ----------*/
function createOptions(value, text) {
    const option = document.createElement('option')
    option.value = value, option.text = text
    return option
}

// Converts single digit numbers to double by adding zero
function singleToDouble(num) {
    let n = String(num)
    if (n.length == 1) n = '0' + n
    return n
}

// Formats hour value passed into it to hh:mm format and returns it
function formatTime(timeValue) {
    const tempTimeValue = timeValue.toString().split('.');
    if (!tempTimeValue[1]) { tempTimeValue[1] = 0; }
    // tempTimeValue[1] will have either 0, 25, 5, or 75 as value (value of timeValue after decimal point as minutes can only be selected as 15, 30, or 45)
    // If .5, then set as half of 60 mins which is 30 mins otherwise multiply with .60 and format to double digits
    const formattedTimeValue = singleToDouble(tempTimeValue[0]) + ':' + (tempTimeValue[1] === '5' ? '30' : singleToDouble(tempTimeValue[1] * .60));
    return formattedTimeValue;
}

/*------------------Export--------------------*/
let activity = { loadStatusReportResourceList };
export default activity;