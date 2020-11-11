// function generateProjectActivity(activityList) {
//     if (activityList) {
//       // If there are no history saved  
//       if (activityList.length <= 0) {
//         document.querySelector('.no-data-div-invoice').style.display = 'block'
//       }
//       else {
//         document.querySelector('.no-data-div-invoice').style.display = 'none'
//       }
//     }
//     else {
//       console.log('No History available')
//     }
// }

/*----------------------------------------------------------------------------------------
 >> ACTIVITY.JS
 - This js file is a common collection of all functions related to activity tab

 >> CONTENTS
    1. Generate past one week's dates and populate generated dates to drop down list
    2. Generate sequence of working hours and minutes and populate generated data
    3. Activity form submission
----------------------------------------------------------------------------------------*/

import utils from './utils.js'
import apis from './api.js'

/*-------------- API call and global status reports variable setup ---*/
apis.getAPI('get', utils.statusReportAPI, utils.secretKey, true, (allStatusReports) => {
    utils.latestOfflineStatusReports = allStatusReports
    console.log(utils.latestOfflineStatusReports)
    // resourceCall(firstSelectedCard)
})

let datesDropDown = document.querySelector('#dates')

// GET DATE VALUE: datesDropDown.addEventListener('change', e => console.log(e.target.value))

Date.prototype.subtractDays = function(days) {
    let date = new Date(this.valueOf())
    date.setDate(date.getDate() - days)
    return date
}

function generateDates(startDate, stopDate) {
   let dateArray = new Array(), currentDate = startDate
   while (currentDate >= stopDate) {
    dateArray.push(`${currentDate.getDate()}/${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`)
    currentDate = currentDate.subtractDays(1)
   }
   return dateArray
}

function createOptions (value, text) {
    const option = document.createElement('option')
    option.value = value, option.text = text
    return option
}

// Get dates array in increasing order
const dateArray = generateDates(new Date(), new Date().subtractDays(7)).reverse()

// Populate dates dropdown
dateArray.forEach(
    (eachDate, index) => {
        const option = createOptions(eachDate, eachDate)
        option.classList.add('option-styling')
        // Select today's date
        if (index == dateArray.length - 1) option.selected = true
        datesDropDown.appendChild(option)
    }
)

// Append 0 to single digit time spent values
const hoursSequence = Array.from({length:16}, (_, index) => String(index + 1).length == 1 ? `0${index + 1}`: `${index + 1}`),
minuteSequence = Array.from({length:12}, (_, index) => String((index) * 5).length == 1 ? `0${(index) * 5}`: `${(index) * 5}`)

const hoursDropDown = document.querySelector('#time-spent')
hoursSequence.forEach(
    (hourValue, index) => {
        const option = createOptions(hourValue, hourValue)
        // Select minimum number of working hours (i.e., 8 hours)
        if (index == 7) option.selected = true
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

// Activity form submission - Activity Update
const activityFormButton = document.querySelector("#generate-activity"),
activityForm = document.querySelector("#activity-form")
